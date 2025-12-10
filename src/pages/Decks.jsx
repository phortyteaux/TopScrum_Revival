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

  useEffect(() => {
    async function fetchDecks() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('decks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) setError(error.message);
      else setDecks(data ?? []);

      setLoading(false);
    }

    if (user) fetchDecks();
  }, [user]);

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
            <div className="flex gap-3 text-xs sm:text-sm">
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
