// src/pages/EditDeck.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';

export default function EditDeck() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDeck() {
      setError(null);
      const { data, error } = await supabase
        .from('decks')
        .select('*')
        .eq('id', deckId)
        .single();

      if (error) {
        setError(error.message);
      } else if (data) {
        setForm({
          title: data.title ?? '',
          description: data.description ?? '',
        });
      }
      setLoading(false);
    }

    if (deckId) {
      loadDeck();
    }
  }, [deckId]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const { error } = await supabase
      .from('decks')
      .update({
        title: form.title,
        description: form.description,
      })
      .eq('id', deckId);

    setSaving(false);

    if (error) {
      setError(error.message);
    } else {
      navigate('/decks');
    }
  };

  if (loading) return <div className="p-4">Loading deck...</div>;

  return (
    <div className="max-w-md mx-auto mt-8 p-4 border rounded">
      <h1 className="text-xl font-semibold mb-4">Edit Deck</h1>
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
          disabled={saving}
          className="w-full mt-2 px-3 py-2 border rounded"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
