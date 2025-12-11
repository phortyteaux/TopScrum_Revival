// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Decks from './pages/MyDecks';
import CreateDeck from './pages/CreateDeck';
import DeckDetails from './pages/DeckDetails';
import EditDeck from './pages/EditDeck';
import ReviewDeck from './pages/ReviewDeck';
import DeckStats from './pages/DeckStats';
import AddCard from './pages/AddCard';
import EditCard from './pages/EditCard';

import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-4xl w-full px-4 py-6">
        <Routes>
          {/* Landing route */}
          <Route
            path="/"
            element={user ? <Navigate to="/decks" replace /> : <Home />}
          />

          {/* Auth routes – only show if NOT logged in */}
          <Route
            path="/login"
            element={user ? <Navigate to="/decks" replace /> : <Login />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/decks" replace /> : <Signup />}
          />

          {/* Deck list (support both /decks and /my-decks) */}
          <Route
            path="/decks"
            element={user ? <Decks /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/my-decks"
            element={user ? <Decks /> : <Navigate to="/login" replace />}
          />

          {/* Create deck */}
          <Route
            path="/decks/new"
            element={user ? <CreateDeck /> : <Navigate to="/login" replace />}
          />

          {/* Single deck + actions – note: /deck/:id (singular) */}
          <Route
            path="/deck/:id"
            element={user ? <DeckDetails /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/deck/:id/edit"
            element={user ? <EditDeck /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/deck/:id/review"
            element={user ? <ReviewDeck /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/deck/:id/stats"
            element={user ? <DeckStats /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/deck/:id/add-card"
            element={user ? <AddCard /> : <Navigate to="/login" replace />}
          />

          {/* Card edit */}
          <Route
            path="/card/:id/edit"
            element={user ? <EditCard /> : <Navigate to="/login" replace />}
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
