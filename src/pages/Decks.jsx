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
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setDecks(data ?? []);
      }

      setLoading(false);
    }

    if (user) {
      fetchDecks();
    }
  }, [user]);

  return (
    <div className="max-w-3xl mx-auto mt-6 px-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Your Decks</h1>
        <Link
          to="/decks/new"
          className="px-3 py-1 border rounded text-sm"
        >
          + New Deck
        </Link>
      </div>

      {loading && <p>Loading decks...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {!loading && decks.length === 0 && (
        <p className="text-sm text-gray-600">
          You don&apos;t have any decks yet. Create one!
        </p>
      )}

      <div className="space-y-2">
        {decks.map((deck) => (
          <div
            key={deck.id}
            className="border rounded px-3 py-2 flex items-center justify-between"
          >
            <div>
              <h2 className="font-medium">{deck.title}</h2>
              {deck.description && (
                <p className="text-xs text-gray-600">
                  {deck.description}
                </p>
              )}
            </div>
            <div className="flex gap-2 text-sm">
              <Link
                to={`/decks/${deck.id}`}
                className="underline"
              >
                Open
              </Link>
              <Link
                to={`/decks/${deck.id}/edit`}
                className="underline"
              >
                Edit
              </Link>
              <Link
                to={`/review/${deck.id}`}
                className="underline"
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
