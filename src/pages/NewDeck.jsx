// src/pages/NewDeck.jsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function NewDeck() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!user) return null;

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.from('decks').insert({
      user_id: user.id,
      title: form.title,
      description: form.description,
    });

    setLoading(false);

    if (error) setError(error.message);
    else navigate('/decks');
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 shadow-sm">
      <h1 className="text-xl font-semibold mb-4">New Deck</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Title</label>
          <input
            name="title"
            className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-2 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea
            name="description"
            className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-2 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            rows={3}
            value={form.description}
            onChange={handleChange}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 px-3 py-2 rounded-md bg-brand text-white text-sm font-medium hover:bg-indigo-600 transition disabled:opacity-60"
        >
          {loading ? 'Creating...' : 'Create Deck'}
        </button>
      </form>
    </div>
  );
}
