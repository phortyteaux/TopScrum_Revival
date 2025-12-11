// src/__tests__/MyDecks.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MyDecks from '../pages/MyDecks';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user-id', email: 'user@test.com' } }),
}));



const decksSelectChain = {
  eq: vi.fn(() => decksSelectChain),
  order: vi.fn(() => decksSelectChain),
  // Make this object "await"-able:
  then: (resolve) => resolve({ data: [], error: null }),
};

const decksTable = {
  select: vi.fn(() => decksSelectChain),
  // Insert/delete/update are stubbed but not asserted in these tests
  insert: vi.fn(() => ({
    select: vi.fn(() => ({
      single: vi.fn(() =>
        Promise.resolve({ data: { id: 'new-deck-id' }, error: null }),
      ),
    })),
  })),
  delete: vi.fn(() => ({
    in: vi.fn(() => Promise.resolve({ error: null })),
    eq: vi.fn(() => Promise.resolve({ error: null })),
  })),
  update: vi.fn(() => ({
    eq: vi.fn(() => Promise.resolve({ error: null })),
  })),
};

const cardsTable = {
  insert: vi.fn(() => Promise.resolve({ error: null })),
};

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: (table) => (table === 'decks' ? decksTable : cardsTable),
  },
}));

beforeEach(() => {
  decksSelectChain.eq.mockClear();
  decksSelectChain.order.mockClear();
  decksTable.select.mockClear();
});

/**
 * Helper to simulate a file input "change" event.
 */
function createFile(contents, name = 'deck.json', type = 'application/json') {
  return new File([contents], name, { type });
}

describe('MyDecks basic behavior & error handling', () => {
  it('renders the "My decks" heading', () => {
    render(<MyDecks />);

    expect(
      screen.getByRole('heading', { name: /My decks/i }),
    ).toBeInTheDocument();
  });

  it('shows error for invalid JSON file (TC1.5)', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<MyDecks />);

    // Find the hidden file input via its "Import deck" label
    const label = screen.getByText(/Import deck/i).closest('label');
    const input = label.querySelector('input[type="file"]');

    const badFile = createFile('{ this is invalid JSON }');

    fireEvent.change(input, { target: { files: [badFile] } });

    // Expect alert for invalid JSON
    // No need for waitFor here because file.text() will run quickly
    expect(alertMock).toHaveBeenCalledWith('Invalid JSON file.');

    alertMock.mockRestore();
  });

  it('alerts when trying to delete with no decks selected (TC2.2)', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<MyDecks />);

    const deleteSelectedButton = screen.getByText(/Delete selected/i);
    fireEvent.click(deleteSelectedButton);

    expect(alertMock).toHaveBeenCalledWith('No decks selected.');

    alertMock.mockRestore();
  });
});
