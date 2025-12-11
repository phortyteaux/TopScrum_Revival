import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function DeckDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [cardSearch, setCardSearch] = useState('');
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [draggedCardId, setDraggedCardId] = useState(null);

  async function exportDeck() {
    const { data: cardData } = await supabase
      .from('cards')
      .select('*')
      .eq('deck_id', id)
      .order('order_index', { ascending: true, nullsFirst: false });

    const exportData = {
      title: deck.title,
      description: deck.description,
      cards: cardData || [],
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json, { type: 'application/json' }]);

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck.title.replace(/\s+/g, '_')}_deck.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function toggleStar(cardId, currentStarred) {
    const { error } = await supabase
      .from('cards')
      .update({ starred: !currentStarred })
      .eq('id', cardId);

    if (!error) {
      setCards((prev) =>
        prev.map((c) =>
          c.id === cardId ? { ...c, starred: !currentStarred } : c,
        ),
      );
    }
  }

  useEffect(() => {
    async function fetchDeck() {
      const { data, error } = await supabase
        .from('decks')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (!error) setDeck(data);
    }

    if (user) fetchDeck();
  }, [id, user]);

  useEffect(() => {
    async function fetchCards() {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('deck_id', id)
        .order('order_index', { ascending: true, nullsFirst: false });

      if (!error) setCards(data || []);
    }

    fetchCards();
  }, [id]);

  if (!deck) {
    return (
      <p className="text-sm text-slate-700 dark:text-slate-400">
        Loading deck...
      </p>
    );
  }

  const filteredCards = cards
    .filter((card) =>
      (card.front_text + ' ' + card.back_text)
        .toLowerCase()
        .includes(cardSearch.toLowerCase()),
    )
    .filter((card) => (showStarredOnly ? card.starred : true));

  function handleCardDragStart(cardId) {
    setDraggedCardId(cardId);
  }

  function handleCardDragOver(e, overId) {
    e.preventDefault();
    if (!draggedCardId || draggedCardId === overId) return;

    setCards((prev) => {
      const arr = [...prev];
      const fromIndex = arr.findIndex((c) => c.id === draggedCardId);
      const toIndex = arr.findIndex((c) => c.id === overId);
      if (fromIndex === -1 || toIndex === -1) return prev;

      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return arr;
    });
  }

  async function handleCardDropOrEnd() {
    if (!draggedCardId) return;
    setDraggedCardId(null);

    const updates = cards.map((card, idx) => ({
      id: card.id,
      order_index: idx,
    }));

    const { error } = await supabase
      .from('cards')
      .upsert(updates, { onConflict: 'id' });

    if (error) {
      console.error('Error saving card order:', error);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header / actions */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            {deck.title}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {deck.description || 'No description'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            to={`/deck/${id}/review`}
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-brand-500 to-emerald-400 px-3 py-1.5 font-semibold text-slate-950 hover:from-brand-400 hover:to-emerald-300"
          >
            Review deck
          </Link>
          <Link
            to={`/deck/${id}/stats`}
            className="inline-flex items-center rounded-xl bg-teal-500/90 px-3 py-1.5 font-semibold text-slate-950 hover:bg-teal-400"
          >
            View stats
          </Link>
          <button
            onClick={exportDeck}
            className="inline-flex items-center rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 font-medium text-slate-800 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:border-slate-500"
          >
            Export
          </button>
          <Link
            to={`/deck/${id}/edit`}
            className="inline-flex items-center rounded-xl bg-amber-500/90 px-3 py-1.5 font-semibold text-slate-950 hover:bg-amber-400"
          >
            Edit deck
          </Link>
          <button
            onClick={async () => {
              const confirmDelete = confirm(
                'Delete this deck? This cannot be undone.',
              );
              if (!confirmDelete) return;

              const { error } = await supabase
                .from('decks')
                .delete()
                .eq('id', id);

              if (!error) {
                window.location.href = '/my-decks';
              }
            }}
            className="inline-flex items-center rounded-xl bg-red-500/90 px-3 py-1.5 font-semibold text-white hover:bg-red-400"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Search / filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="text"
          placeholder="Search cards..."
          value={cardSearch}
          onChange={(e) => setCardSearch(e.target.value)}
          className="w-full max-w-md rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-brand-500/0 transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-50"
        />
        <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={showStarredOnly}
            onChange={(e) => setShowStarredOnly(e.target.checked)}
            className="h-4 w-4 rounded border-slate-400 bg-white text-brand-500 focus:ring-brand-500/40 dark:border-slate-600 dark:bg-slate-950/80"
          />
          Show starred only
        </label>
      </div>

      {/* Cards */}
      {filteredCards.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          No matching cards.
        </p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {filteredCards.map((card) => (
            <li
              key={card.id}
              draggable
              onDragStart={() => handleCardDragStart(card.id)}
              onDragOver={(e) => handleCardDragOver(e, card.id)}
              onDrop={handleCardDropOrEnd}
              onDragEnd={handleCardDropOrEnd}
              className="group cursor-grab rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm transition hover:border-brand-500/70 hover:shadow-brand-500/20 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-slate-950/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900 dark:text-slate-50">
                      {card.front_text}
                    </strong>
                    <button
                      onClick={() => toggleStar(card.id, card.starred)}
                      className="text-lg"
                      title={card.starred ? 'Unstar' : 'Star'}
                    >
                      {card.starred ? '⭐' : '☆'}
                    </button>
                  </div>
                  <p className="mt-1 text-slate-700 dark:text-slate-300">
                    {card.back_text}
                  </p>
                </div>
              </div>

              {card.image_url && (
                <img
                  src={card.image_url}
                  alt="Card"
                  className="mt-3 max-h-40 w-full rounded-xl object-cover"
                />
              )}

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <button
                  onClick={async () => {
                    const { error } = await supabase
                      .from('cards')
                      .delete()
                      .eq('id', card.id);

                    if (!error) {
                      setCards((prev) =>
                        prev.filter((c) => c.id !== card.id),
                      );
                    }
                  }}
                  className="rounded-lg bg-red-500/90 px-3 py-1 text-xs font-semibold text-white hover:bg-red-400"
                >
                  Delete
                </button>
                <Link
                  to={`/card/${card.id}/edit`}
                  className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-50 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white/90"
                >
                  Edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="pt-2">
        <Link
          to={`/deck/${id}/add-card`}
          className="inline-flex items-center rounded-xl border border-dashed border-brand-500/70 bg-slate-50 px-4 py-2 text-xs font-semibold text-brand-600 hover:border-brand-400 hover:text-brand-500 dark:bg-slate-950/60 dark:text-brand-200 dark:hover:text-brand-100"
        >
          + Add new card
        </Link>
      </div>
    </div>
  );
}
