// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyDecks from './pages/MyDecks';
import CreateDeck from './pages/CreateDeck';
import DeckDetails from './pages/DeckDetails';
import EditDeck from './pages/EditDeck';
import AddCard from './pages/AddCard';
import EditCard from './pages/EditCard';
import ReviewDeck from './pages/ReviewDeck';
import DeckStats from './pages/DeckStats';
import Contact from './pages/Contact'; // 👈 NEW

import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-4xl w-full px-4 py-6">
        <Routes>
          {/* Public landing page */}
          <Route path="/" element={<Home />} />

          {/* Auth routes – bounce logged-in users to /decks */}
          <Route
            path="/login"
            element={user ? <Navigate to="/decks" replace /> : <Login />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/decks" replace /> : <Signup />}
          />

          {/* Contact – public page */}
          <Route path="/contact" element={<Contact />} />

          {/* Alias for old /my-decks link */}
          <Route path="/my-decks" element={<Navigate to="/decks" replace />} />

          {/* Protected deck routes */}
          <Route
            path="/decks"
            element={user ? <MyDecks /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/decks/new"
            element={user ? <CreateDeck /> : <Navigate to="/login" replace />}
          />

          {/* Single deck + cards */}
          <Route
            path="/deck/:id"
            element={user ? <DeckDetails /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/deck/:id/edit"
            element={user ? <EditDeck /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/deck/:id/add-card"
            element={user ? <AddCard /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/deck/:id/review"
            element={user ? <ReviewDeck /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/deck/:id/stats"
            element={user ? <DeckStats /> : <Navigate to="/login" replace />}
          />

          {/* Edit a single card */}
          <Route
            path="/card/:id/edit"
            element={user ? <EditCard /> : <Navigate to="/login" replace />}
          />

          {/* Catch-all: go to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
