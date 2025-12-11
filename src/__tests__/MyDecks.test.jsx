// src/__tests__/MyDecks.test.jsx
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "test-user-id" },
  }),
}));

vi.mock("../lib/supabaseClient", () => {
  const chain = {
    data: [],
    error: null,
  };

  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.order = vi.fn(() => chain); 
  chain.delete = vi.fn(() => chain);
  chain.in = vi.fn(() => chain);
  chain.upsert = vi.fn(() => chain);

  return {
    supabase: {
      from: vi.fn(() => chain),
    },
  };
});

import MyDecks from "../pages/MyDecks.jsx";

function renderMyDecks() {
  return render(
    <MemoryRouter>
      <MyDecks />
    </MemoryRouter>
  );
}

let alertSpy;

beforeEach(() => {
  alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
});

afterEach(() => {
  alertSpy.mockRestore();
});

// --- Tests ---

describe("MyDecks basic behavior & error handling", () => {
  it('renders the "My decks" heading', async () => {
    renderMyDecks();

    const heading = await screen.findByText(/My decks/i);
    expect(heading).toBeInTheDocument();
  });

  it("shows error for invalid JSON file (TC1.5)", async () => {
    renderMyDecks();

    const importLabel = screen.getByText(/Import deck/i).closest("label");
    expect(importLabel).not.toBeNull();

    const fileInput = importLabel.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();

    const badFile = new File(["{ invalid json"], "invalid.json", {
      type: "application/json",
    });

    fireEvent.change(fileInput, {
      target: { files: [badFile] },
    });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Invalid JSON file.");
    });
  });

  it("alerts when trying to delete with no decks selected (TC2.2)", async () => {
    renderMyDecks();

    const deleteButton = await screen.findByText(/Delete selected/i);
    fireEvent.click(deleteButton);

    expect(alertSpy).toHaveBeenCalledWith("No decks selected.");
  });
});
