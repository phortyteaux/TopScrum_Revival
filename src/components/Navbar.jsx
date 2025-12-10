// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur sticky top-0 z-10">
      <div className="app-container flex items-center justify-between py-3">
        {/* Left */}
        <div className="flex items-center gap-4">
          <Link
            to={user ? '/decks' : '/login'}
            className="font-semibold text-lg text-brand dark:text-brand"
          >
            Flashcards
          </Link>
          {user && (
            <Link
              to="/decks"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-brand"
            >
              Decks
            </Link>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
            <span className="hidden sm:inline">
              {theme === 'dark' ? 'Dark' : 'Light'}
            </span>
          </button>

          {user ? (
            <>
              <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs sm:text-sm px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 hover:text-brand"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-xs sm:text-sm px-3 py-1 rounded-md border border-brand text-brand hover:bg-brand hover:text-white transition"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
