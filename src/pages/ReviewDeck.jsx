import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ReviewDeck() {
  const { id } = useParams(); // deck ID
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0); // track which card we're on
  const [showBack, setShowBack] = useState(false);

  // Load all cards from this deck
  useEffect(() => {
    async function loadCards() {
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .eq("deck_id", id);

      if (!error) setCards(data);
    }

    loadCards();
  }, [id]);

  if (cards.length === 0) return <p style={{ padding: 20 }}>No cards to review.</p>;

  const card = cards[index];

  function nextCard() {
    setShowBack(false);

    // loop back to start if at end
    if (index === cards.length - 1) {
      setIndex(0);
    } else {
      setIndex(index + 1);
    }
  }

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h2>Reviewing Deck</h2>
      <p>
        Card {index + 1} of {cards.length}
      </p>

      {/* Flashcard box */}
      <div
        style={{
          padding: 40,
          border: "2px solid black",
          borderRadius: 10,
          width: 300,
          margin: "20px auto",
          cursor: "pointer",
          minHeight: 150,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f7f7f7",
        }}
        onClick={() => setShowBack(!showBack)}
      >
        {showBack ? card.back_text : card.front_text}
      </div>

      {/* Action buttons */}
      <button
        onClick={() => {
          // Increment correctness stats here later
          nextCard();
        }}
        style={{
          padding: "8px 16px",
          marginRight: 10,
          backgroundColor: "green",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        Correct
      </button>

      <button
        onClick={() => {
          // Increment incorrect stats later
          nextCard();
        }}
        style={{
          padding: "8px 16px",
          backgroundColor: "red",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        Incorrect
      </button>
    </div>
  );
}
