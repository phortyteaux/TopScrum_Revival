import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function CreateDeck() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  if (!user) {
    return (
      <p className="text-center text-sm text-slate-400">
        You&apos;ll need to log in before creating decks.
      </p>
    );
  }

  const handleCreate = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from('decks').insert({
      title,
      description,
      user_id: user.id,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Deck created!');
      setTitle('');
      setDescription('');
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/60">
        <h2 className="text-xl font-semibold tracking-tight text-slate-50">
          Create a new deck
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Think of each deck as a sprint backlog for one topic.
        </p>

        <form onSubmit={handleCreate} className="mt-6 space-y-4 text-left">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">
              Deck title
            </label>
            <input
              placeholder="e.g. CS 332 – DBMS Midterm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 outline-none ring-brand-500/0 transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">
              Description (optional)
            </label>
            <textarea
              rows={3}
              placeholder="What exam / topic is this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 outline-none ring-brand-500/0 transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
            />
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-brand-500 to-emerald-400 px-3 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/30 transition hover:from-brand-400 hover:to-emerald-300"
          >
            Create deck
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
