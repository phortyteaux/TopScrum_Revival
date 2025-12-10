import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ReviewDeck() {
  const { id } = useParams();

  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);

  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const [shuffle, setShuffle] = useState(false);

  // ---------------------------------------------------------
  // LOAD CARDS
  // ---------------------------------------------------------
  useEffect(() => {
    async function loadCards() {
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .eq("deck_id", id);

      if (!error && data) {
        let loaded = [...data];

        if (shuffle) {
          loaded = loaded.sort(() => Math.random() - 0.5);
        }

        setCards(loaded);
      }
    }

    loadCards();
  }, [id, shuffle]);

  // ---------------------------------------------------------
  // FINAL RESULTS SCREEN
  // ---------------------------------------------------------
  if (finished) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h2>Review Complete!</h2>

        {/* 100% Progress Bar */}
        <div
          style={{
            width: "80%",
            height: "12px",
            backgroundColor: "#ddd",
            borderRadius: "6px",
            margin: "10px auto 20px auto",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: "100%",
              backgroundColor: "purple",
            }}
          />
        </div>

        <p>
          You got <strong>{correctCount}</strong> correct and{" "}
          <strong>{incorrectCount}</strong> incorrect.
        </p>

        <p style={{ fontSize: "24px", marginTop: 10 }}>
          Score:{" "}
          <strong>
            {Math.round((correctCount / cards.length) * 100)}%
          </strong>
        </p>

        <button
          onClick={() => {
            setCorrectCount(0);
            setIncorrectCount(0);
            setIndex(0);
            setFinished(false);
            setShowBack(false);
          }}
          style={{
            marginTop: 20,
            backgroundColor: "purple",
            color: "white",
            padding: "10px 18px",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Restart Review
        </button>

        <div style={{ marginTop: 20 }}>
          <a href={`/deck/${id}`}>
            <button
              style={{
                backgroundColor: "gray",
                color: "white",
                padding: "8px 16px",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Back to Deck
            </button>
          </a>
        </div>
      </div>
    );
  }

  if (cards.length === 0)
    return <p style={{ padding: 20 }}>No cards to review.</p>;

  const card = cards[index];

  // ---------------------------------------------------------
  // PROGRESS BAR CALCULATION (fixed)
  // ---------------------------------------------------------
  const progress =
    cards.length > 0 ? (index / cards.length) * 100 : 0;

  // ---------------------------------------------------------
  // NEXT CARD LOGIC
  // ---------------------------------------------------------
  function nextCard() {
    setShowBack(false);

    if (index === cards.length - 1) {
      setFinished(true);
    } else {
      setIndex(index + 1);
    }
  }

  async function markCorrect(cardId) {
    setCorrectCount(correctCount + 1);

    await supabase
      .from("cards")
      .update({
        attempts: (card.attempts || 0) + 1,
        correct: (card.correct || 0) + 1,
      })
      .eq("id", cardId);

    nextCard();
  }

  async function markIncorrect(cardId) {
    setIncorrectCount(incorrectCount + 1);

    await supabase
      .from("cards")
      .update({
        attempts: (card.attempts || 0) + 1,
        incorrect: (card.incorrect || 0) + 1,
      })
      .eq("id", cardId);

    nextCard();
  }

  // ---------------------------------------------------------
  // NORMAL REVIEW SCREEN
  // ---------------------------------------------------------
  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h2>Reviewing Deck</h2>

      {/* SHUFFLE TOGGLE */}
      <label style={{ display: "block", marginBottom: "15px" }}>
        <input
          type="checkbox"
          checked={shuffle}
          onChange={(e) => {
            setShuffle(e.target.checked);
            setIndex(0);
            setFinished(false);
            setCorrectCount(0);
            setIncorrectCount(0);
          }}
          style={{ marginRight: "8px" }}
        />
        Shuffle Cards
      </label>

      {/* FIXED PROGRESS BAR */}
      <div
        style={{
          width: "80%",
          height: "12px",
          backgroundColor: "#ddd",
          borderRadius: "6px",
          margin: "10px auto 20px auto",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            backgroundColor: "purple",
            transition: "width 0.3s ease",
          }}
        />
      </div>

      <p style={{ marginBottom: 10 }}>
        Card {index + 1} of {cards.length}
      </p>

      {/* FLASHCARD */}
      <div
        style={{
          padding: 20,
          border: "2px solid black",
          borderRadius: 10,
          width: 320,
          minHeight: 150,
          margin: "20px auto",
          cursor: "pointer",
          backgroundColor: "#f7f7f7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          fontSize: "20px",
          fontWeight: "bold",
        }}
        onClick={() => setShowBack(!showBack)}
      >
        {showBack ? card.back_text : card.front_text}
      </div>

      {/* MARK BUTTONS */}
      <button
        onClick={() => markCorrect(card.id)}
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
        onClick={() => markIncorrect(card.id)}
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

      {/* IMAGE BELOW */}
      {card.image_url && (
        <div style={{ marginTop: "30px" }}>
          <img
            src={card.image_url}
            alt="card"
            style={{
              width: "220px",
              borderRadius: "8px",
              display: "inline-block",
            }}
          />
        </div>
      )}
    </div>
  );
}
