// src/pages/Decks.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Decks() {
  const { user } = useAuth();
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function fetchDecks() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('decks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading decks:', error);
        // Optional: special-case the missing-table error
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

  const handleDeleteDeck = async (deckId) => {
    if (!window.confirm('Delete this deck and all its cards?')) return;

    setError(null);
    setDeletingId(deckId);

    // Delete cards first (in case DB doesn’t have cascading foreign keys)
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

    // Optimistically update UI
    setDecks((prev) => prev.filter((d) => d.id !== deckId));
    setDeletingId(null);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Your Decks</h1>
        <Link
          to="/decks/new"
          className="px-3 py-1 rounded-md border border-brand text-sm text-brand hover:bg-brand hover:text-white transition"
        >
          + New Deck
        </Link>
      </div>

      {loading && <p>Loading decks...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && decks.length === 0 && (
        <p className="text-sm text-gray-600">
          You don&apos;t have any decks yet. Create one!
        </p>
      )}

      <div className="space-y-2">
        {decks.map((deck) => (
          <div
            key={deck.id}
            className="border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 flex items-center justify-between bg-white/80 dark:bg-gray-900/80"
          >
            <div>
              <h2 className="font-medium">{deck.title}</h2>
              {deck.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {deck.description}
                </p>
              )}
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
                disabled={deletingId === deck.id}
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
