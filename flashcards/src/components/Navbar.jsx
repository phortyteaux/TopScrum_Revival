// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="flex items-center justify-between px-4 py-3 border-b">
      <div className="flex items-center gap-4">
        <Link to="/" className="font-semibold">
          Flashcards
        </Link>
        {user && (
          <>
            <Link to="/decks" className="text-sm">
              Decks
            </Link>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-xs text-gray-500">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm px-3 py-1 border rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm">
              Login
            </Link>
            <Link
              to="/signup"
              className="text-sm px-3 py-1 border rounded"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
