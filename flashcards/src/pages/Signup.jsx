// src/pages/Signup.jsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setInfo('Check your email for verification (if enabled).');
      // Navigate to login or decks if you want:
      // navigate('/login');
      if (data?.user) {
        navigate('/decks');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded">
      <h1 className="text-xl font-semibold mb-4">Sign up</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            name="email"
            className="w-full border px-2 py-1 rounded"
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
            className="w-full border px-2 py-1 rounded"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-green-600">{info}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 px-3 py-2 border rounded font-medium"
        >
          {loading ? 'Signing up...' : 'Sign up'}
        </button>
      </form>
      <p className="mt-3 text-sm">
        Already have an account?{' '}
        <Link to="/login" className="underline">
          Login
        </Link>
      </p>
    </div>
  );
}
