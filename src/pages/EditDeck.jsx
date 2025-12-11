import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function EditDeck() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadDeck() {
      const { data, error } = await supabase
        .from('decks')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        setTitle(data.title);
        setDescription(data.description);
      }
    }

    loadDeck();
  }, [id]);

  async function handleUpdate(e) {
    e.preventDefault();

    const { error } = await supabase
      .from('decks')
      .update({
        title,
        description,
      })
      .eq('id', id);

    if (error) {
      setMessage('Error updating deck: ' + error.message);
    } else {
      setMessage('Deck updated!');
      setTimeout(() => {
        navigate(`/deck/${id}`);
      }, 500);
    }
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/60">
        <h2 className="text-xl font-semibold text-slate-50">Edit deck</h2>

        <form onSubmit={handleUpdate} className="mt-6 space-y-4 text-left">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">
              Deck title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Deck title"
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
            />
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-semibold text-slate-950 hover:bg-white/90"
          >
            Save changes
          </button>
        </form>

        {message && (
          <p className="mt-4 rounded-xl bg-slate-950/60 px-3 py-2 text-xs text-slate-200">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
