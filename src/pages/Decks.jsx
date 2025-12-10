// src/pages/Decks.jsx
import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import JSZip from 'jszip';

export default function Decks() {
  const { user } = useAuth();
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // New state for search + bulk actions
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]); // array of deck IDs
  const [bulkLoading, setBulkLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function fetchDecks() {
      if (!user) return;

      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('decks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading decks:', error);
        if (error.message?.includes("Could not find the table 'public.decks'")) {
          setError('Decks are not set up yet. Please contact the developer.');
        } else {
          setError('Could not load decks. Please try again later.');
        }
      } else {
        setDecks(data ?? []);
      }

      setLoading(false);
    }

    if (user) fetchDecks();
  }, [user]);

  // Helper: download blob as file
  const downloadBlob = (filename, blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- Single deck delete (already existed) ----
  const handleDeleteDeck = async (deckId) => {
    if (!window.confirm('Delete this deck and all its cards?')) return;

    setError(null);
    setDeletingId(deckId);

    // Delete cards first
    const { error: cardsError } = await supabase
      .from('cards')
      .delete()
      .eq('deck_id', deckId);

    if (cardsError) {
      console.error(cardsError);
      setError(cardsError.message);
      setDeletingId(null);
      return;
    }

    // Then delete the deck itself
    const { error: deckError } = await supabase
      .from('decks')
      .delete()
      .eq('id', deckId)
      .eq('user_id', user.id);

    if (deckError) {
      console.error(deckError);
      setError(deckError.message);
      setDeletingId(null);
      return;
    }

    // Update UI
    setDecks((prev) => prev.filter((d) => d.id !== deckId));
    setSelectedIds((prev) => prev.filter((id) => id !== deckId));
    setDeletingId(null);
  };

  // ---- Search ----
  const filteredDecks = decks.filter((deck) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const title = deck.title?.toLowerCase() ?? '';
    const desc = deck.description?.toLowerCase() ?? '';
    return title.includes(q) || desc.includes(q);
  });

  // ---- Select decks (checkbox UI) ----
  const toggleSelectDeck = (deckId) => {
    setSelectedIds((prev) =>
      prev.includes(deckId)
        ? prev.filter((id) => id !== deckId)
        : [...prev, deckId]
    );
  };

  const allVisibleSelected =
    filteredDecks.length > 0 &&
    filteredDecks.every((d) => selectedIds.includes(d.id));

  const handleToggleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      if (allVisibleSelected) {
        // Unselect all visible
        const visibleIds = new Set(filteredDecks.map((d) => d.id));
        return prev.filter((id) => !visibleIds.has(id));
      }
      // Select all visible (add missing ones)
      const newIds = [...prev];
      filteredDecks.forEach((d) => {
        if (!newIds.includes(d.id)) newIds.push(d.id);
      });
      return newIds;
    });
  };

  // ---- Bulk delete decks ----
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    if (
      !window.confirm(
        `Delete ${selectedIds.length} deck(s) and all their cards?`
      )
    ) {
      return;
    }

    setError(null);
    setBulkLoading(true);

    try {
      // Delete all cards for those decks
      const { error: cardsError } = await supabase
        .from('cards')
        .delete()
        .in('deck_id', selectedIds);

      if (cardsError) throw cardsError;

      // Delete decks themselves
      const { error: decksError } = await supabase
        .from('decks')
        .delete()
        .in('id', selectedIds)
        .eq('user_id', user.id);

      if (decksError) throw decksError;

      // Update UI
      setDecks((prev) => prev.filter((d) => !selectedIds.includes(d.id)));
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Bulk delete failed.');
    } finally {
      setBulkLoading(false);
    }
  };

  // ---- Import Deck (JSON) ----
  const handleClickImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const parsed = JSON.parse(text);

        // Support both:
        // { deck: { title, description }, cards: [...] }
        // AND { title, description, cards: [...] }
        const deckData = parsed.deck || parsed;
        const cardsData =
          parsed.cards || deckData.cards || [];

        if (!deckData.title) {
          throw new Error('JSON must include a "title" for the deck.');
        }

        // Insert deck
        const { data: newDeck, error: deckError } = await supabase
          .from('decks')
          .insert({
            user_id: user.id,
            title: deckData.title,
            description: deckData.description || null,
          })
          .select()
          .single();

        if (deckError) throw deckError;

        // Insert cards (optional)
        if (Array.isArray(cardsData) && cardsData.length > 0) {
          const cardsToInsert = cardsData.map((c) => ({
            deck_id: newDeck.id,
            front: c.front,
            back: c.back,
          }));

          const { error: cardsError } = await supabase
            .from('cards')
            .insert(cardsToInsert);

          if (cardsError) throw cardsError;
        }

        // Add imported deck to UI
        setDecks((prev) => [newDeck, ...prev]);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to import deck.');
      } finally {
        // reset file input so same file can be chosen again if needed
        e.target.value = '';
      }
    };

    reader.readAsText(file);
  };

  // ---- Bulk Export Decks (ZIP of JSON files) ----
  const handleBulkExport = async () => {
    if (selectedIds.length === 0) return;

    setError(null);
    setBulkLoading(true);

    try {
      const zip = new JSZip();

      const decksToExport = decks.filter((d) =>
        selectedIds.includes(d.id)
      );

      for (const deck of decksToExport) {
        const { data: cardsData, error: cardsError } = await supabase
          .from('cards')
          .select('*')
          .eq('deck_id', deck.id)
          .order('created_at');

        if (cardsError) throw cardsError;

        const payload = {
          deck: {
            id: deck.id,
            title: deck.title,
            description: deck.description,
            created_at: deck.created_at,
          },
          cards: (cardsData ?? []).map((c) => ({
            front: c.front,
            back: c.back,
          })),
        };

        // Safe filename
        const safeTitle =
          (deck.title || 'deck')
            .toLowerCase()
            .replace(/[^\w\-]+/g, '_')
            .slice(0, 50) || 'deck';

        const filename = `${safeTitle}_${deck.id}.json`;

        zip.file(filename, JSON.stringify(payload, null, 2));
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      downloadBlob('decks_export.zip', blob);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Bulk export failed.');
    } finally {
      setBulkLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h1 className="text-2xl font-semibold">Your Decks</h1>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Search */}
          <input
            type="text"
            placeholder="Search decks..."
            className="border border-gray-300 dark:border-gray-700 bg-transparent px-2 py-1 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Import Deck */}
          <button
            type="button"
            onClick={handleClickImport}
            className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-700 text-xs sm:text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Import Deck (JSON)
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImportFile}
          />

          {/* Bulk actions (only show when something is selected) */}
          {selectedIds.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleBulkExport}
                disabled={bulkLoading}
                className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-700 text-xs sm:text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
              >
                {bulkLoading ? 'Exporting…' : `Export Selected (${selectedIds.length})`}
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={bulkLoading}
                className="px-3 py-1 rounded-md border border-red-500 text-xs sm:text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50"
              >
                {bulkLoading ? 'Deleting…' : `Delete Selected (${selectedIds.length})`}
              </button>
            </>
          )}

          <Link
            to="/decks/new"
            className="px-3 py-1 rounded-md border border-brand text-xs sm:text-sm text-brand hover:bg-brand hover:text-white transition"
          >
            + New Deck
          </Link>
        </div>
      </div>

      {loading && <p>Loading decks...</p>}
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      {!loading && filteredDecks.length === 0 && decks.length === 0 && (
        <p className="text-sm text-gray-600">
          You don&apos;t have any decks yet. Create one!
        </p>
      )}

      {!loading && decks.length > 0 && (
        <div className="mb-2 flex items-center gap-2 text-xs text-gray-600">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={handleToggleSelectAllVisible}
            />
            <span>Select all shown</span>
          </label>
          {selectedIds.length > 0 && (
            <span>{selectedIds.length} selected</span>
          )}
        </div>
      )}

      <div className="space-y-2">
        {filteredDecks.map((deck) => (
          <div
            key={deck.id}
            className="border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 flex items-center justify-between bg-white/80 dark:bg-gray-900/80"
          >
            <div className="flex items-start gap-2">
              {/* Checkbox */}
              <input
                type="checkbox"
                className="mt-1"
                checked={selectedIds.includes(deck.id)}
                onChange={() => toggleSelectDeck(deck.id)}
              />

              <div>
                <h2 className="font-medium">{deck.title}</h2>
                {deck.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {deck.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3 text-xs sm:text-sm items-center">
              <Link
                to={`/decks/${deck.id}`}
                className="underline hover:text-brand"
              >
                Open
              </Link>
              <Link
                to={`/decks/${deck.id}/edit`}
                className="underline hover:text-brand"
              >
                Edit
              </Link>
              <Link
                to={`/review/${deck.id}`}
                className="underline hover:text-brand"
              >
                Review
              </Link>
              <button
                onClick={() => handleDeleteDeck(deck.id)}
                disabled={deletingId === deck.id || bulkLoading}
                className="underline text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                {deletingId === deck.id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
