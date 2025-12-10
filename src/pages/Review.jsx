// src/pages/Review.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Review() {
  const { deckId } = useParams();
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCards() {
      setLoading(true);
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('deck_id', deckId)
        .order('created_at');

      if (error) {
        console.error(error);
        setCards([]);
      } else {
        setCards(data ?? []);
      }
      setLoading(false);
    }

    if (deckId) loadCards();
  }, [deckId]);

  const handleAnswer = async (isCorrect) => {
    if (!user || cards.length === 0) return;

    const card = cards[currentIndex];

    // TODO: improve with upsert for stats
    try {
      await supabase.rpc('increment_card_stat', {
        p_user_id: user.id,
        p_card_id: card.id,
        p_is_correct: isCorrect,
      }).catch(async () => {
        // fallback: simple upsert-like logic if no RPC is defined
        const { data: existing } = await supabase
          .from('stats')
          .select('*')
          .eq('user_id', user.id)
          .eq('card_id', card.id)
          .maybeSingle();

        if (!existing) {
          await supabase.from('stats').insert({
            user_id: user.id,
            card_id: card.id,
            correct_count: isCorrect ? 1 : 0,
            wrong_count: isCorrect ? 0 : 1,
          });
        } else {
          await supabase
            .from('stats')
            .update({
              correct_count: existing.correct_count + (isCorrect ? 1 : 0),
              wrong_count: existing.wrong_count + (!isCorrect ? 1 : 0),
            })
            .eq('id', existing.id);
        }
      });
    } catch (err) {
      console.error('Error updating stats', err);
    }

    setShowAnswer(false);
    setCurrentIndex((prev) =>
      cards.length === 0 ? 0 : (prev + 1) % cards.length
    );
  };

  if (loading) return <div className="p-4">Loading cards...</div>;
  if (cards.length === 0) {
    return <div className="p-4">No cards in this deck to review.</div>;
  }

  const card = cards[currentIndex];
  const progressText = `${currentIndex + 1} / ${cards.length}`;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 shadow-sm text-center">
      <h1 className="text-xl font-semibold mb-2">Review</h1>
      <p className="text-xs text-gray-500 mb-4">Card {progressText}</p>

      <div className="border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-6 mb-4 bg-gray-50/80 dark:bg-gray-950/50">
        <p className="text-sm mb-2 font-medium text-gray-500">Question</p>
        <p className="text-lg mb-4">{card.front}</p>

        {showAnswer ? (
          <div className="mt-4">
            <p className="text-sm mb-1 font-medium text-gray-500">Answer</p>
            <p className="text-lg">{card.back}</p>
          </div>
        ) : (
          <button
            onClick={() => setShowAnswer(true)}
            className="mt-2 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Show Answer
          </button>
        )}
      </div>

      {showAnswer && (
        <div className="flex justify-center gap-3">
          <button
            onClick={() => handleAnswer(true)}
            className="px-4 py-2 rounded-md bg-emerald-500 text-white text-sm hover:bg-emerald-600 transition"
          >
            Correct
          </button>
          <button
            onClick={() => handleAnswer(false)}
            className="px-4 py-2 rounded-md bg-rose-500 text-white text-sm hover:bg-rose-600 transition"
          >
            Incorrect
          </button>
        </div>
      )}
    </div>
  );
}
