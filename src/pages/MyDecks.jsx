import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import JSZip from "jszip"; // ⬅ NEW: For bulk export ZIP
import { saveAs } from "file-saver"; // ⬅ NEW: For downloading ZIP

export default function MyDecks() {
  const { user } = useAuth();
  const [decks, setDecks] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDecks, setSelectedDecks] = useState([]); // ⬅ NEW for bulk actions

  // ---------------------------------------------------------
  // EXPORT ONE DECK AS JSON
  // ---------------------------------------------------------
  async function fetchDeckData(deckId) {
    const { data: deck } = await supabase
      .from("decks")
      .select("*")
      .eq("id", deckId)
      .single();

    const { data: cards } = await supabase
      .from("cards")
      .select("*")
      .eq("deck_id", deckId);

    return { ...deck, cards };
  }

  async function exportDeck(deck) {
    const data = await fetchDeckData(deck.id);

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${deck.title.replace(/\s+/g, "_")}_deck.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  // ---------------------------------------------------------
  // BULK EXPORT (ZIP FILE)
  // ---------------------------------------------------------
  async function exportSelected() {
    if (selectedDecks.length === 0) return alert("No decks selected.");

    const zip = new JSZip();

    for (const deckId of selectedDecks) {
      const deck = decks.find((d) => d.id === deckId);
      const data = await fetchDeckData(deckId);

      zip.file(
        `${deck.title.replace(/\s+/g, "_")}.json`,
        JSON.stringify(data, null, 2)
      );
    }

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "exported_decks.zip");
  }

  // ---------------------------------------------------------
  // IMPORT DECK
  // ---------------------------------------------------------
  async function importDeck(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const { data: newDeck } = await supabase
        .from("decks")
        .insert({
          user_id: user.id,
          title: data.title,
          description: data.description,
        })
        .select()
        .single();

      const cardInserts = data.cards.map((card) => ({
        deck_id: newDeck.id,
        front_text: card.front_text,
        back_text: card.back_text,
        image_url: card.image_url,
      }));

      await supabase.from("cards").insert(cardInserts);

      alert("Deck imported!");
      window.location.reload();
    } catch {
      alert("Invalid JSON file.");
    }
  }

  // ---------------------------------------------------------
  // LOAD DECKS
  // ---------------------------------------------------------
  useEffect(() => {
    async function loadDecks() {
      const { data } = await supabase
        .from("decks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setDecks(data);
    }

    if (user) loadDecks();
  }, [user]);

  // SEARCH filtering
  const filteredDecks = decks.filter((deck) =>
    deck.title.toLowerCase().includes(search.toLowerCase())
  );

  // ---------------------------------------------------------
  // DELETE A SINGLE DECK
  // ---------------------------------------------------------
  async function deleteDeck(id) {
    const ok = confirm("Delete this deck?");
    if (!ok) return;

    await supabase.from("decks").delete().eq("id", id);
    setDecks(decks.filter((d) => d.id !== id));
    setSelectedDecks(selectedDecks.filter((x) => x !== id));
  }

  // ---------------------------------------------------------
  // BULK DELETE
  // ---------------------------------------------------------
  async function deleteSelected() {
    if (selectedDecks.length === 0) return alert("No decks selected.");

    const ok = confirm("Delete ALL selected decks?");
    if (!ok) return;

    await supabase.from("decks").delete().in("id", selectedDecks);

    setDecks(decks.filter((d) => !selectedDecks.includes(d.id)));
    setSelectedDecks([]);
  }

  // TOGGLE SELECTED CHECKBOXES
  function toggleDeck(id) {
    if (selectedDecks.includes(id)) {
      setSelectedDecks(selectedDecks.filter((x) => x !== id));
    } else {
      setSelectedDecks([...selectedDecks, id]);
    }
  }

  function selectAll() {
    setSelectedDecks(filteredDecks.map((d) => d.id));
  }

  function clearSelection() {
    setSelectedDecks([]);
  }

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <div style={{ padding: "20px" }}>
      <h2>My Decks</h2>

      {/* IMPORT BUTTON */}
      <label
        style={{
          display: "inline-block",
          marginBottom: "15px",
          padding: "8px 12px",
          backgroundColor: "#444",
          color: "white",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Import Deck
        <input
          type="file"
          accept=".json"
          onChange={importDeck}
          style={{ display: "none" }}
        />
      </label>

      {/* BULK ACTION BUTTONS */}
      <div style={{ marginBottom: "15px", marginTop: "10px" }}>
        <button onClick={selectAll} style={{ marginRight: "10px" }}>
          Select All
        </button>
        <button onClick={clearSelection} style={{ marginRight: "10px" }}>
          Clear
        </button>
        <button onClick={deleteSelected} style={{ marginRight: "10px" }}>
          Delete Selected
        </button>
        <button onClick={exportSelected}>Export Selected</button>
      </div>

      {/* SEARCH BAR */}
      <input
        type="text"
        placeholder="Search decks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "8px",
          width: "80%",
          margin: "10px 0 20px 0",
          border: "1px solid gray",
          borderRadius: "6px",
          display: "block",
        }}
      />

      <ul style={{ padding: 0 }}>
        {filteredDecks.map((deck) => (
          <li
            key={deck.id}
            style={{
              listStyle: "none",
              marginBottom: "20px",
              padding: "15px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              background: "#fafafa",
              cursor: "pointer",
            }}
            onClick={(e) => {
              // Prevent click if user clicked button or checkbox
              if (e.target.tagName === "BUTTON" || e.target.type === "checkbox") return;
              window.location.href = `/deck/${deck.id}`;
            }}
          >

            {/* CHECKBOX FOR BULK SELECT */}
            <input
              type="checkbox"
              checked={selectedDecks.includes(deck.id)}
              onChange={() => toggleDeck(deck.id)}
              style={{ marginRight: "10px" }}
            />

            <div style={{ fontSize: "20px", fontWeight: "bold" }}>
              {deck.title}
            </div>
            <div style={{ color: "#666", marginBottom: "10px" }}>
              {deck.description}
            </div>

            {/* BUTTON ROW */}
            <div style={{ display: "flex", gap: "10px" }}>
              <a href={`/deck/${deck.id}/review`}>
                <button style={{ backgroundColor: "purple", color: "white" }}>
                  Review
                </button>
              </a>

              <button
                onClick={() => deleteDeck(deck.id)}
                style={{ backgroundColor: "red", color: "white" }}
              >
                Delete
              </button>

            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
