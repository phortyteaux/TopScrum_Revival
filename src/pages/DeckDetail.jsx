// src/pages/DeckDetail.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useParams } from 'react-router-dom';

export default function DeckDetail() {
  const { deckId } = useParams();
  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cardForm, setCardForm] = useState({ front: '', back: '' });
  const [savingCard, setSavingCard] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      const [{ data: deckData, error: deckError }, { data: cardsData, error: cardsError }] =
        await Promise.all([
          supabase.from('decks').select('*').eq('id', deckId).single(),
          supabase.from('cards').select('*').eq('deck_id', deckId).order('created_at'),
        ]);

      if (deckError) setError(deckError.message);
      if (cardsError) setError((prev) => prev || cardsError.message);

      setDeck(deckData ?? null);
      setCards(cardsData ?? []);
      setLoading(false);
    }

    if (deckId) loadData();
  }, [deckId]);

  const handleCardChange = (e) => {
    setCardForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    setSavingCard(true);
    setError(null);

    const { data, error } = await supabase
      .from('cards')
      .insert({
        deck_id: deckId,
        front: cardForm.front,
        back: cardForm.back,
      })
      .select()
      .single();

    setSavingCard(false);

    if (error) setError(error.message);
    else if (data) {
      setCards((prev) => [...prev, data]);
      setCardForm({ front: '', back: '' });
    }
  };

  const handleDeleteCard = async (cardId) => {
    const { error } = await supabase.from('cards').delete().eq('id', cardId);
    if (error) setError(error.message);
    else setCards((prev) => prev.filter((c) => c.id !== cardId));
  };

  if (loading) return <div className="p-4">Loading deck...</div>;
  if (!deck) return <div className="p-4">Deck not found.</div>;

  return (
    <div className="mt-4">
      <h1 className="text-2xl font-semibold mb-1">{deck.title}</h1>
      {deck.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {deck.description}
        </p>
      )}

      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Cards</h2>
        {cards.length === 0 && (
          <p className="text-sm text-gray-600">No cards yet.</p>
        )}
        <ul className="space-y-2 mb-4">
          {cards.map((card) => (
            <li
              key={card.id}
              className="border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 flex justify-between items-start text-sm bg-white/80 dark:bg-gray-900/80"
            >
              <div>
                <p className="font-medium">Q: {card.front}</p>
                <p className="text-gray-700 dark:text-gray-300">
                  A: {card.back}
                </p>
              </div>
              <button
                onClick={() => handleDeleteCard(card.id)}
                className="text-xs text-red-600 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

        <form
          onSubmit={handleAddCard}
          className="space-y-2 border border-gray-200 dark:border-gray-800 rounded-lg p-3 bg-white/80 dark:bg-gray-900/80"
        >
          <h3 className="font-medium text-sm mb-1">Add Card</h3>
          <div>
            <label className="block text-xs mb-1">Front</label>
            <input
              name="front"
              className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-2 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              value={cardForm.front}
              onChange={handleCardChange}
              required
            />
          </div>
          <div>
            <label className="block text-xs mb-1">Back</label>
            <input
              name="back"
              className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-2 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              value={cardForm.back}
              onChange={handleCardChange}
              required
            />
          </div>
          <button
            type="submit"
            disabled={savingCard}
            className="mt-1 px-3 py-2 rounded-md bg-brand text-white text-xs sm:text-sm font-medium hover:bg-indigo-600 transition disabled:opacity-60"
          >
            {savingCard ? 'Adding...' : 'Add Card'}
          </button>
        </form>
      </section>
    </div>
  );
}
