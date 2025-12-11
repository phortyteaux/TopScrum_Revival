import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Account created! Check your email to confirm.');
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/60">
        <h2 className="text-xl font-semibold tracking-tight text-slate-50">
          Create your TopScrum account
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Sync decks across devices and track your review stats.
        </p>

        <form onSubmit={handleSignup} className="mt-6 space-y-4 text-left">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 outline-none ring-brand-500/0 transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 outline-none ring-brand-500/0 transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
            />
          </div>

          <button
            type="submit"
            className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-brand-500 to-emerald-400 px-3 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/30 transition hover:from-brand-400 hover:to-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Sign up
          </button>
        </form>

        {message && (
          <p className="mt-4 rounded-xl bg-slate-950/60 px-3 py-2 text-xs text-slate-200">
            {message}
          </p>
        )}

        <p className="mt-3 text-xs text-slate-500">
          Already have an account? Just use the{' '}
          <span className="font-medium text-slate-300">Log In</span> link in the
          top bar.
        </p>
      </div>
    </div>
  );
}
