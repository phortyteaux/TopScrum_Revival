// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const onHomePage = location.pathname === "/";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <nav className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* Left: Logo / Brand */}
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className={`text-lg font-semibold px-2 py-0.5 rounded-md transition-colors ${
              theme === "dark"
                ? "text-brand-300 hover:text-brand-200 bg-slate-900/80"
                : "text-brand-700 hover:text-brand-900 bg-slate-100"
            }`}
          >
            TopScrum
          </Link>

          <span className="hidden text-xs text-slate-500 sm:inline">
            Flashcards
          </span>
        </div>

        {/* Right: Theme toggle + Auth controls */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200 shadow-sm hover:border-brand-400"
          >
            <span>{theme === "dark" ? "🌙" : "☀️"}</span>
            <span className="hidden sm:inline">
              {theme === "dark" ? "Dark" : "Light"}
            </span>
          </button>

          {/* Auth section */}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-slate-400 sm:inline">
                {user.email}
              </span>

              <Link
                to="/decks"
                className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-brand-600 sm:text-sm"
              >
                My Decks
              </Link>

              <button
                onClick={handleLogout}
                className="text-xs text-slate-300 hover:text-red-400 sm:text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            // Hide Login / Sign Up on the home page
            !onHomePage && (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-xs font-medium text-slate-200 hover:text-brand-400 sm:text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-lg border border-brand-500 px-3 py-1.5 text-xs font-semibold text-brand-400 hover:bg-brand-500 hover:text-white sm:text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
