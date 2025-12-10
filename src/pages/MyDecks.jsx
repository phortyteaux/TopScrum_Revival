import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function MyDecks() {
  const { user } = useAuth();
  const [decks, setDecks] = useState([]);

  useEffect(() => {
    async function loadDecks() {
      const { data, error } = await supabase
        .from("decks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) setDecks(data);
    }

    if (user) loadDecks();
  }, [user]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Decks</h2>

      {decks.length === 0 && <p>No decks created yet.</p>}

      <ul>
        {decks.map((deck) => (
          <li
            key={deck.id}
            style={{ marginBottom: "10px", listStyle: "none" }}
          >
            <a
              href={`/deck/${deck.id}`}
              style={{
                fontWeight: "bold",
                fontSize: "18px",
                textDecoration: "none"
              }}
            >
              {deck.title}
            </a>

            <div style={{ color: "#555" }}>
              {deck.description}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
