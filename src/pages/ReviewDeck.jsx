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

  // Track incorrect cards for second-round review
  const [incorrectCardsList, setIncorrectCardsList] = useState([]);

  // NEW: multiple-choice mode
  const [multipleChoice, setMultipleChoice] = useState(false);
  const [options, setOptions] = useState([]);

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
        setIndex(0);
        setShowBack(false);
        setFinished(false);
        setCorrectCount(0);
        setIncorrectCount(0);
        setIncorrectCardsList([]);
      }
    }

    loadCards();
  }, [id, shuffle]);

  // ---------------------------------------------------------
  // GENERATE MULTIPLE-CHOICE OPTIONS
  // ---------------------------------------------------------
  useEffect(() => {
    if (!multipleChoice || cards.length === 0) {
      setOptions([]);
      return;
    }

    const card = cards[index];
    if (!card) return;

    const correctAnswer = card.back_text || "";

    const otherCards = cards.filter((c, idx) => idx !== index && c.back_text);
    const shuffledOthers = [...otherCards].sort(() => Math.random() - 0.5);
    const distractors = shuffledOthers.slice(0, 3).map((c) => c.back_text);

    const allOptions = [correctAnswer, ...distractors];
    const uniqueOptions = Array.from(new Set(allOptions));
    const shuffled = [...uniqueOptions].sort(() => Math.random() - 0.5);

    setOptions(shuffled);
  }, [cards, index, multipleChoice]);

  // ---------------------------------------------------------
  // FINAL RESULTS SCREEN
  // ---------------------------------------------------------
  if (finished) {
    const totalAnswered = correctCount + incorrectCount;

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

        {/* Review incorrect only button */}
        {incorrectCardsList.length > 0 && (
          <button
            onClick={() => {
              setCards(incorrectCardsList);
              setIndex(0);
              setShowBack(false);
              setFinished(false);
              setCorrectCount(0);
              setIncorrectCount(0);
              setIncorrectCardsList([]);
            }}
            style={{
              marginBottom: 15,
              backgroundColor: "blue",
              color: "white",
              padding: "10px 18px",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              display: "block",
              width: "230px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Review Incorrect Only
          </button>
        )}

        <p>
          You got <strong>{correctCount}</strong> correct and{" "}
          <strong>{incorrectCount}</strong> incorrect.
        </p>

        <p style={{ fontSize: "24px", marginTop: 10 }}>
          Score:{" "}
          <strong>
            {totalAnswered > 0
              ? Math.round((correctCount / totalAnswered) * 100)
              : 0}
            %
          </strong>
        </p>

        <button
          onClick={() => {
            setCorrectCount(0);
            setIncorrectCount(0);
            setIndex(0);
            setFinished(false);
            setShowBack(false);
            setIncorrectCardsList([]);
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
  // PROGRESS BAR CALCULATION
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
    setCorrectCount((prev) => prev + 1);

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
    setIncorrectCount((prev) => prev + 1);

    // Save incorrect card for second review
    setIncorrectCardsList((prev) => [...prev, cards[index]]);

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
  // TOGGLE STAR FROM REVIEW
  // ---------------------------------------------------------
  async function toggleStarCurrent() {
    const current = card;
    const newStarred = !current.starred;

    const { error } = await supabase
      .from("cards")
      .update({ starred: newStarred })
      .eq("id", current.id);

    if (!error) {
      setCards((prev) =>
        prev.map((c, idx) =>
          idx === index ? { ...c, starred: newStarred } : c
        )
      );
    }
  }

  // ---------------------------------------------------------
  // HANDLE CHOICE CLICK (MC MODE)
  // ---------------------------------------------------------
  function handleChoiceClick(answer) {
    if (answer === card.back_text) {
      markCorrect(card.id);
    } else {
      markIncorrect(card.id);
    }
  }

  // ---------------------------------------------------------
  // NORMAL / MULTIPLE-CHOICE REVIEW SCREEN
  // ---------------------------------------------------------
  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h2>Reviewing Deck</h2>

      {/* SHUFFLE + MULTIPLE-CHOICE TOGGLES */}
      <div style={{ marginBottom: "10px" }}>
        <label style={{ marginRight: "15px" }}>
          <input
            type="checkbox"
            checked={shuffle}
            onChange={(e) => {
              setShuffle(e.target.checked);
            }}
            style={{ marginRight: "6px" }}
          />
          Shuffle Cards
        </label>

        <label>
          <input
            type="checkbox"
            checked={multipleChoice}
            onChange={(e) => {
              setMultipleChoice(e.target.checked);
              setIndex(0);
              setFinished(false);
              setCorrectCount(0);
              setIncorrectCount(0);
              setShowBack(false);
            }}
            style={{ marginRight: "6px" }}
          />
          Multiple Choice Mode
        </label>
      </div>

      {/* PROGRESS BAR */}
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

      {/* STAR TOGGLE FOR CURRENT CARD */}
      <button
        onClick={toggleStarCurrent}
        style={{
          border: "none",
          background: "none",
          cursor: "pointer",
          fontSize: "22px",
          marginBottom: "10px",
        }}
        title={card.starred ? "Unstar" : "Star"}
      >
        {card.starred ? "⭐" : "☆"}
      </button>

      {/* MULTIPLE-CHOICE MODE */}
      {multipleChoice ? (
        <>
          {/* QUESTION (FRONT) */}
          <div
            style={{
              padding: 20,
              border: "2px solid black",
              borderRadius: 10,
              width: 320,
              minHeight: 120,
              margin: "20px auto",
              backgroundColor: "#f7f7f7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            {card.front_text}
          </div>

          {/* OPTIONS */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              width: "80%",
              maxWidth: "400px",
              margin: "0 auto 20px auto",
            }}
          >
            {options.length === 0 ? (
              <p>No options available.</p>
            ) : (
              options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleChoiceClick(opt)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #333",
                    backgroundColor: "white",
                    cursor: "pointer",
                  }}
                >
                  {opt}
                </button>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          {/* FLASHCARD MODE */}
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
        </>
      )}

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
