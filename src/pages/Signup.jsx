// src/pages/Signup.jsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      navigate('/decks');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 shadow-sm">
      <h1 className="text-2xl font-semibold mb-4 text-center">Sign up</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            name="email"
            className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-2 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            name="password"
            className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-2 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 px-3 py-2 rounded-md bg-brand text-white text-sm font-medium hover:bg-indigo-600 transition disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
      <p className="mt-3 text-sm text-center">
        Already have an account?{' '}
        <Link to="/login" className="underline">
          Login
        </Link>
      </p>
    </div>
  );
}
