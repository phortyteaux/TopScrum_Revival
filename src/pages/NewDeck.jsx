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

  if (!user) {
    return null;
  }

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

    if (error) {
      setError(error.message);
    } else {
      navigate('/decks');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-4 border rounded">
      <h1 className="text-xl font-semibold mb-4">New Deck</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Title</label>
          <input
            name="title"
            className="w-full border px-2 py-1 rounded"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea
            name="description"
            className="w-full border px-2 py-1 rounded"
            rows={3}
            value={form.description}
            onChange={handleChange}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 px-3 py-2 border rounded"
        >
          {loading ? 'Creating...' : 'Create Deck'}
        </button>
      </form>
    </div>
  );
}
