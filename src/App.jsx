// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/navbar';
import Home from './pages/Home';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Decks from './pages/MyDecks';
import NewDeck from './pages/CreateDeck';
import DeckDetail from './pages/DeckDetails';
import EditDeck from './pages/EditDeck';
import ReviewPage from './pages/ReviewDeck'; // if/when you make one

import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />

      <main className="app-container py-4">
        <Routes>
          {/* Default route: send logged-in users to /decks, otherwise to /login */}
          <Route path="/" element={<Home />} />

          {/* Auth routes – only show if NOT logged in */}
          <Route
            path="/login"
            element={
              user ? <Navigate to="/decks" replace /> : <Login />
            }
          />
          <Route
            path="/signup"
            element={
              user ? <Navigate to="/decks" replace /> : <Signup />
            }
          />

          {/* Protected routes – only for logged-in users */}
          <Route
            path="/decks"
            element={
              user ? <Decks /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/decks/new"
            element={
              user ? <NewDeck /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/decks/:deckId"
            element={
              user ? <DeckDetail /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/decks/:deckId/edit"
            element={
              user ? <EditDeck /> : <Navigate to="/login" replace />
            }
          />

          {/* Example review route if you build it */}
          {/* <Route
            path="/review/:deckId"
            element={
              user ? <ReviewPage /> : <Navigate to="/login" replace />
            }
          /> */}

          {/* Catch-all: go home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
