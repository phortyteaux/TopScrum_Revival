import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import JSZip from "jszip"; // For bulk export ZIP
import { saveAs } from "file-saver"; // For downloading ZIP

export default function MyDecks() {
  const { user } = useAuth();
  const [decks, setDecks] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDecks, setSelectedDecks] = useState([]); // bulk actions
  const [draggedDeckId, setDraggedDeckId] = useState(null); // DnD

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
          description: data.description
          // order_index will be set by backfill or when you reorder
        })
        .select()
        .single();

      const cardInserts = (data.cards || []).map((card) => ({
        deck_id: newDeck.id,
        front_text: card.front_text,
        back_text: card.back_text,
        image_url: card.image_url,
        // same idea for order_index – you can keep as null; will be handled on reorder
      }));

      if (cardInserts.length > 0) {
        await supabase.from("cards").insert(cardInserts);
      }

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
      if (!user) return;

      const { data, error } = await supabase
        .from("decks")
        .select("*")
        .eq("user_id", user.id)
        // First by order_index (manual), then by created_at for any nulls
        .order("order_index", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading decks:", error);
        return;
      }

      setDecks(data || []);
    }

    loadDecks();
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
    setDecks((prev) => prev.filter((d) => d.id !== id));
    setSelectedDecks((prev) => prev.filter((x) => x !== id));
  }

  // ---------------------------------------------------------
  // BULK DELETE
  // ---------------------------------------------------------
  async function deleteSelected() {
    if (selectedDecks.length === 0) return alert("No decks selected.");

    const ok = confirm("Delete ALL selected decks?");
    if (!ok) return;

    await supabase.from("decks").delete().in("id", selectedDecks);

    setDecks((prev) => prev.filter((d) => !selectedDecks.includes(d.id)));
    setSelectedDecks([]);
  }

  // TOGGLE SELECTED CHECKBOXES
  function toggleDeck(id) {
    setSelectedDecks((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function selectAll() {
    setSelectedDecks(filteredDecks.map((d) => d.id));
  }

  function clearSelection() {
    setSelectedDecks([]);
  }

  // ---------------------------------------------------------
  // DRAG-AND-DROP HELPERS FOR DECKS
  // ---------------------------------------------------------
  function handleDeckDragStart(id) {
    setDraggedDeckId(id);
  }

  function handleDeckDragOver(e, overId) {
    e.preventDefault();
    if (!draggedDeckId || draggedDeckId === overId) return;

    setDecks((prev) => {
      const arr = [...prev];
      const fromIndex = arr.findIndex((d) => d.id === draggedDeckId);
      const toIndex = arr.findIndex((d) => d.id === overId);
      if (fromIndex === -1 || toIndex === -1) return prev;

      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return arr;
    });
  }

  async function handleDeckDropOrEnd() {
    if (!draggedDeckId) return;
    setDraggedDeckId(null);

    // Persist order_index based on current order in `decks`
    const updates = decks.map((deck, idx) => ({
      id: deck.id,
      order_index: idx
    }));

    const { error } = await supabase
      .from("decks")
      .upsert(updates, { onConflict: "id" });

    if (error) {
      console.error("Error saving deck order:", error);
    }
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
          cursor: "pointer"
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
          display: "block"
        }}
      />

      <ul style={{ padding: 0 }}>
        {filteredDecks.map((deck) => (
          <li
            key={deck.id}
            draggable
            onDragStart={() => handleDeckDragStart(deck.id)}
            onDragOver={(e) => handleDeckDragOver(e, deck.id)}
            onDrop={handleDeckDropOrEnd}
            onDragEnd={handleDeckDropOrEnd}
            style={{
              listStyle: "none",
              marginBottom: "20px",
              padding: "15px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              background: "#fafafa",
              cursor: "grab"
            }}
            onClick={(e) => {
              // Prevent click if user clicked button or checkbox
              if (
                e.target.tagName === "BUTTON" ||
                e.target.type === "checkbox"
              )
                return;
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

              <button
                onClick={() => exportDeck(deck)}
                style={{ backgroundColor: "gray", color: "white" }}
              >
                Export
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
