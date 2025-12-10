// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './pages/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Decks from './pages/Decks';
import NewDeck from './pages/NewDeck';
import EditDeck from './pages/EditDeck';
import DeckDetail from './pages/DeckDetail';
import Review from './pages/Review';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Decks />} />
            <Route path="/decks" element={<Decks />} />
            <Route path="/decks/new" element={<NewDeck />} />
            <Route path="/decks/:deckId" element={<DeckDetail />} />
            <Route path="/decks/:deckId/edit" element={<EditDeck />} />
            <Route path="/review/:deckId" element={<Review />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}
