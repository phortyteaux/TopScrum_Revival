// src/pages/Review.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useParams } from 'react-router-dom';

export default function Review() {
  const { deckId } = useParams();
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

    if (deckId) {
      loadCards();
    }
  }, [deckId]);

  const handleAnswer = (isCorrect) => {
    // TODO: Call Supabase to update stats table based on card + user
    // e.g. upsert into stats with correct_count / wrong_count
    console.log('Answered:', isCorrect ? 'correct' : 'incorrect');

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
    <div className="max-w-xl mx-auto mt-10 p-4 border rounded text-center">
      <h1 className="text-xl font-semibold mb-4">Review</h1>
      <p className="text-xs text-gray-500 mb-2">Card {progressText}</p>

      <div className="border rounded px-4 py-6 mb-4">
        <p className="text-sm mb-2 font-medium">Question</p>
        <p className="text-lg mb-4">{card.front}</p>

        {showAnswer ? (
          <div className="mt-4">
            <p className="text-sm mb-1 font-medium">Answer</p>
            <p className="text-lg">{card.back}</p>
          </div>
        ) : (
          <button
            onClick={() => setShowAnswer(true)}
            className="mt-2 px-3 py-1 border rounded text-sm"
          >
            Show Answer
          </button>
        )}
      </div>

      {showAnswer && (
        <div className="flex justify-center gap-3">
          <button
            onClick={() => handleAnswer(true)}
            className="px-4 py-2 border rounded text-sm"
          >
            Correct
          </button>
          <button
            onClick={() => handleAnswer(false)}
            className="px-4 py-2 border rounded text-sm"
          >
            Incorrect
          </button>
        </div>
      )}
    </div>
  );
}
