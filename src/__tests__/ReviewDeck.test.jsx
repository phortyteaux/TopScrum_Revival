// src/__tests__/ReviewDeck.test.jsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ReviewDeck from '../pages/ReviewDeck';


const cardsTable = {
  select: vi.fn(() => ({
    eq: vi.fn(() =>
      Promise.resolve({
        data: [],
        error: null,
      }),
    ),
  })),
};

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: () => cardsTable,
  },
}));

describe('ReviewDeck boundary behavior', () => {
  it('shows "No cards to review" when deck has no cards (TC3.3)', async () => {
    render(
      <MemoryRouter initialEntries={['/deck/1/review']}>
        <Routes>
          <Route path="/deck/:id/review" element={<ReviewDeck />} />
        </Routes>
      </MemoryRouter>,
    );

    const msg = await screen.findByText(/No cards to review in this deck/i);
    expect(msg).toBeInTheDocument();
  });
});
