import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function DeckDetails() {
  // Get the deck ID from the URL (ex: /deck/123 → id = "123")
  const { id } = useParams();

  // Get the currently logged-in user
  const { user } = useAuth();

  // Store deck information and cards in component state
  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);

  // Search state for filtering cards
  const [cardSearch, setCardSearch] = useState("");

  // Show only starred cards toggle
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  // Drag state for cards
  const [draggedCardId, setDraggedCardId] = useState(null);

  // ---------------------------------------------------------
  // EXPORT DECK AS JSON FILE
  // ---------------------------------------------------------
  async function exportDeck() {
    // Fetch cards to ensure latest info
    const { data: cardData } = await supabase
      .from("cards")
      .select("*")
      .eq("deck_id", id)
      .order("order_index", { ascending: true, nullsFirst: false });

    const exportData = {
      title: deck.title,
      description: deck.description,
      cards: cardData || []
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${deck.title.replace(/\s+/g, "_")}_deck.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  // ---------------------------------------------------------
  // TOGGLE STAR / FAVORITE FOR A CARD
  // ---------------------------------------------------------
  async function toggleStar(cardId, currentStarred) {
    const { error } = await supabase
      .from("cards")
      .update({ starred: !currentStarred })
      .eq("id", cardId);

    if (!error) {
      setCards((prev) =>
        prev.map((c) =>
          c.id === cardId ? { ...c, starred: !currentStarred } : c
        )
      );
    }
  }

  // ---------------------------------------------------------
  // LOAD DECK INFORMATION
  // ---------------------------------------------------------
  useEffect(() => {
    async function fetchDeck() {
      const { data, error } = await supabase
        .from("decks")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (!error) setDeck(data);
    }

    if (user) fetchDeck();
  }, [id, user]);

  // ---------------------------------------------------------
  // LOAD CARDS FOR THIS DECK
  // ---------------------------------------------------------
  useEffect(() => {
    async function fetchCards() {
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .eq("deck_id", id)
        .order("order_index", { ascending: true, nullsFirst: false });

      if (!error) setCards(data || []);
    }

    fetchCards();
  }, [id]);

  // If still loading deck info
  if (!deck) return <p>Loading deck...</p>;

  // ---------------------------------------------------------
  // FILTER CARDS BASED ON SEARCH INPUT + STAR FILTER
  // ---------------------------------------------------------
  const filteredCards = cards
    .filter((card) =>
      (card.front_text + " " + card.back_text)
        .toLowerCase()
        .includes(cardSearch.toLowerCase())
    )
    .filter((card) => (showStarredOnly ? card.starred : true));

  // ---------------------------------------------------------
  // DRAG-AND-DROP HELPERS FOR CARDS
  // ---------------------------------------------------------
  function handleCardDragStart(id) {
    setDraggedCardId(id);
  }

  function handleCardDragOver(e, overId) {
    e.preventDefault();
    if (!draggedCardId || draggedCardId === overId) return;

    setCards((prev) => {
      const arr = [...prev];
      const fromIndex = arr.findIndex((c) => c.id === draggedCardId);
      const toIndex = arr.findIndex((c) => c.id === overId);
      if (fromIndex === -1 || toIndex === -1) return prev;

      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return arr;
    });
  }

  async function handleCardDropOrEnd() {
    if (!draggedCardId) return;
    setDraggedCardId(null);

    // Persist order_index based on current order in `cards`
    const updates = cards.map((card, idx) => ({
      id: card.id,
      order_index: idx
    }));

    const { error } = await supabase
      .from("cards")
      .upsert(updates, { onConflict: "id" });

    if (error) {
      console.error("Error saving card order:", error);
    }
  }

  // ---------------------------------------------------------
  // MAIN PAGE RENDER — SHOW DECK + ALL CARDS
  // ---------------------------------------------------------
  return (
    <div style={{ padding: "20px" }}>
      <h1>{deck.title}</h1>
      <p>{deck.description}</p>

      {/* ACTION BUTTONS */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "10px",
          marginBottom: "20px"
        }}
      >
        {/* REVIEW DECK */}
        <a href={`/deck/${id}/review`}>
          <button
            style={{
              backgroundColor: "purple",
              color: "white",
              padding: "6px 12px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Review Deck
          </button>
        </a>

        {/* VIEW STATS */}
        <a href={`/deck/${id}/stats`}>
          <button
            style={{
              backgroundColor: "teal",
              color: "white",
              padding: "6px 12px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            View Stats
          </button>
        </a>

        {/* EXPORT DECK */}
        <button
          style={{
            backgroundColor: "gray",
            color: "white",
            padding: "6px 12px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
          onClick={exportDeck}
        >
          Export Deck
        </button>

        {/* EDIT DECK */}
        <a href={`/deck/${id}/edit`}>
          <button
            style={{
              backgroundColor: "orange",
              color: "white",
              padding: "6px 12px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Edit Deck
          </button>
        </a>

        {/* DELETE DECK */}
        <button
          style={{
            backgroundColor: "red",
            color: "white",
            padding: "6px 12px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
          onClick={async () => {
            const confirmDelete = confirm(
              "Are you sure you want to delete this deck? This cannot be undone."
            );
            if (!confirmDelete) return;

            const { error } = await supabase
              .from("decks")
              .delete()
              .eq("id", id);

            if (!error) {
              window.location.href = "/my-decks";
            }
          }}
        >
          Delete Deck
        </button>
      </div>

      <h2>Cards</h2>

      {/* SEARCH BAR + STAR FILTER */}
      <div style={{ marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="Search cards..."
          value={cardSearch}
          onChange={(e) => setCardSearch(e.target.value)}
          style={{
            padding: "8px",
            width: "80%",
            border: "1px solid gray",
            borderRadius: "6px",
            marginRight: "10px"
          }}
        />

        <label style={{ fontSize: "14px" }}>
          <input
            type="checkbox"
            checked={showStarredOnly}
            onChange={(e) => setShowStarredOnly(e.target.checked)}
            style={{ marginRight: "6px" }}
          />
          Show starred only
        </label>
      </div>

      {/* CARD LIST */}
      {filteredCards.length === 0 ? (
        <p>No matching cards.</p>
      ) : (
        <ul>
          {filteredCards.map((card) => (
            <li
              key={card.id}
              draggable
              onDragStart={() => handleCardDragStart(card.id)}
              onDragOver={(e) => handleCardDragOver(e, card.id)}
              onDrop={handleCardDropOrEnd}
              onDragEnd={handleCardDropOrEnd}
              style={{ marginBottom: "20px", cursor: "grab" }}
            >
              {/* Title row with star */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <strong>{card.front_text}</strong>
                <button
                  onClick={() => toggleStar(card.id, card.starred)}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: "18px"
                  }}
                  title={card.starred ? "Unstar" : "Star"}
                >
                  {card.starred ? "⭐" : "☆"}
                </button>
              </div>

              <div>{card.back_text}</div>

              {card.image_url && (
                <img
                  src={card.image_url}
                  alt="Card"
                  style={{
                    width: "200px",
                    marginTop: "10px",
                    borderRadius: "8px",
                    display: "block"
                  }}
                />
              )}

              {/* BUTTONS */}
              <div
                style={{
                  marginTop: "10px",
                  display: "flex",
                  gap: "8px"
                }}
              >
                <button
                  style={{
                    backgroundColor: "red",
                    color: "white",
                    padding: "4px 8px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                  onClick={async () => {
                    const { error } = await supabase
                      .from("cards")
                      .delete()
                      .eq("id", card.id);

                    if (!error) {
                      setCards((prev) => prev.filter((c) => c.id !== card.id));
                    }
                  }}
                >
                  Delete
                </button>

                <a href={`/card/${card.id}/edit`}>
                  <button
                    style={{
                      backgroundColor: "blue",
                      color: "white",
                      padding: "4px 8px",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Edit
                  </button>
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add Card Button */}
      <a href={`/deck/${id}/add-card`}>
        <button>Add New Card</button>
      </a>
    </div>
  );
}
