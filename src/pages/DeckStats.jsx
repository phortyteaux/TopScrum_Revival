import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

// ====== MOVE THIS UP HERE SO IT'S AVAILABLE ======
const cell = {
  border: "1px solid #ddd",
  padding: "8px 10px",
};

// ===== SMALL REUSABLE COMPONENT =====
function StatBox({ label, value }) {
  return (
    <div
      style={{
        background: "#f3f3f3",
        padding: "20px",
        borderRadius: "8px",
        textAlign: "center",
        border: "1px solid #ddd",
      }}
    >
      <div style={{ fontSize: "22px", fontWeight: "bold" }}>{value}</div>
      <div style={{ fontSize: "14px", marginTop: "5px", color: "#555" }}>
        {label}
      </div>
    </div>
  );
}

export default function DeckStats() {
  const { id } = useParams();

  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===== LOAD DATA =====
  useEffect(() => {
    async function loadStats() {
      setLoading(true);

      const { data: deckData } = await supabase
        .from("decks")
        .select("*")
        .eq("id", id)
        .single();

      const { data: cardData } = await supabase
        .from("cards")
        .select("*")
        .eq("deck_id", id);

      setDeck(deckData || null);
      setCards(cardData || []);
      setLoading(false);
    }

    loadStats();
  }, [id]);

  if (loading) return <p style={{ padding: 20 }}>Loading stats...</p>;
  if (!deck) return <p style={{ padding: 20 }}>Deck not found.</p>;

  // ===== CALCULATIONS =====
  const totalCards = cards.length;
  const starredCount = cards.filter((c) => c.starred === true).length;

  const totalAttempts = cards.reduce((sum, c) => sum + (c.attempts || 0), 0);
  const totalCorrect = cards.reduce((sum, c) => sum + (c.correct || 0), 0);
  const totalIncorrect = cards.reduce((sum, c) => sum + (c.incorrect || 0), 0);

  const accuracy =
    totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  // Hardest cards (lowest accuracy)
  const hardestCards = [...cards]
    .map((c) => {
      const attempts = c.attempts || 0;
      const correct = c.correct || 0;
      const acc = attempts > 0 ? correct / attempts : 0;
      return { ...c, attempts, accuracy: acc };
    })
    .filter((c) => c.attempts >= 3)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5);

  return (
    <div style={{ padding: 20 }}>
      <h1>{deck.title} — Stats</h1>
      <p>{deck.description}</p>

      {/* SUMMARY GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "15px",
          marginTop: 20,
          marginBottom: 30,
        }}
      >
        <StatBox label="Total Cards" value={totalCards} />
        <StatBox label="Starred Cards" value={starredCount} />
        <StatBox label="Total Attempts" value={totalAttempts} />
        <StatBox label="Correct Answers" value={totalCorrect} />
        <StatBox label="Incorrect Answers" value={totalIncorrect} />
        <StatBox label="Accuracy" value={`${accuracy}%`} />
      </div>

      {/* HARDEST CARDS */}
      <h2>Hardest Cards</h2>

      {hardestCards.length === 0 ? (
        <p>No difficult cards yet!</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 10,
          }}
        >
          <thead>
            <tr style={{ background: "#eee" }}>
              <th style={cell}>Front</th>
              <th style={cell}>Back</th>
              <th style={cell}>Attempts</th>
              <th style={cell}>Accuracy</th>
            </tr>
          </thead>

          <tbody>
            {hardestCards.map((card) => (
              <tr key={card.id}>
                <td style={cell}>{card.front_text}</td>
                <td style={cell}>{card.back_text}</td>
                <td style={cell}>{card.attempts}</td>
                <td style={cell}>{Math.round(card.accuracy * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 30 }}>
        <a href={`/deck/${id}`}>
          <button
            style={{
              padding: "10px 18px",
              backgroundColor: "gray",
              color: "white",
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
