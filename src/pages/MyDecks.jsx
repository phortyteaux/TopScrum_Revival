import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function MyDecks() {
  const { user } = useAuth();
  const [decks, setDecks] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDecks, setSelectedDecks] = useState([]);
  const [draggedDeckId, setDraggedDeckId] = useState(null);

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

      const cardInserts = (data.cards || []).map((card) => ({
        deck_id: newDeck.id,
        front_text: card.front_text,
        back_text: card.back_text,
        image_url: card.image_url,
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

  useEffect(() => {
    async function loadDecks() {
      if (!user) return;

      const { data, error } = await supabase
        .from("decks")
        .select("*")
        .eq("user_id", user.id)
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

  const filteredDecks = decks.filter((deck) =>
    deck.title.toLowerCase().includes(search.toLowerCase())
  );

  async function deleteDeck(id) {
    const ok = confirm("Delete this deck?");
    if (!ok) return;

    await supabase.from("decks").delete().eq("id", id);
    setDecks((prev) => prev.filter((d) => d.id !== id));
    setSelectedDecks((prev) => prev.filter((x) => x !== id));
  }

  async function deleteSelected() {
    if (selectedDecks.length === 0) return alert("No decks selected.");

    const ok = confirm("Delete ALL selected decks?");
    if (!ok) return;

    await supabase.from("decks").delete().in("id", selectedDecks);

    setDecks((prev) => prev.filter((d) => !selectedDecks.includes(d.id)));
    setSelectedDecks([]);
  }

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

    const updates = decks.map((deck, idx) => ({
      id: deck.id,
      order_index: idx,
    }));

    const { error } = await supabase
      .from("decks")
      .upsert(updates, { onConflict: "id" });

    if (error) {
      console.error("Error saving deck order:", error);
    }
  }

  if (!user) {
    return (
      <p className="text-center text-sm text-slate-700 dark:text-slate-400">
        Log in to see your decks.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            My decks
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Drag to reorder. Export / import to share with teammates.
          </p>
        </div>

        <label className="inline-flex cursor-pointer items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-900 shadow-sm hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:border-slate-500">
          <span className="mr-2 text-slate-700 dark:text-slate-300">
            Import deck
          </span>
          <input
            type="file"
            accept=".json"
            onChange={importDeck}
            className="hidden"
          />
        </label>
      </div>

      {/* Bulk actions */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={selectAll}
          className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-slate-800 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:border-slate-500"
        >
          Select all
        </button>
        <button
          onClick={clearSelection}
          className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-slate-800 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:border-slate-500"
        >
          Clear
        </button>
        <button
          onClick={deleteSelected}
          className="rounded-full bg-red-500/90 px-3 py-1.5 font-medium text-white hover:bg-red-400"
        >
          Delete selected
        </button>
        <button
          onClick={exportSelected}
          className="rounded-full bg-slate-900 px-3 py-1.5 font-medium text-slate-50 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white/90"
        >
          Export selected
        </button>
      </div>

      {/* Search */}
      <div className="mt-2">
        <input
          type="text"
          placeholder="Search decks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-brand-500/0 transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-50"
        />
      </div>

      {/* Deck list */}
      {filteredDecks.length === 0 ? (
        <p className="pt-4 text-sm text-slate-600 dark:text-slate-400">
          No decks match your search. Try a different keyword.
        </p>
      ) : (
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {filteredDecks.map((deck) => (
            <li
              key={deck.id}
              draggable
              onDragStart={() => handleDeckDragStart(deck.id)}
              onDragOver={(e) => handleDeckDragOver(e, deck.id)}
              onDrop={handleDeckDropOrEnd}
              onDragEnd={handleDeckDropOrEnd}
              className="group flex cursor-grab flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-brand-500/70 hover:shadow-brand-500/20 dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-slate-950/40"
              onClick={(e) => {
                if (
                  e.target.tagName === "BUTTON" ||
                  e.target.type === "checkbox"
                )
                  return;
                window.location.href = `/deck/${deck.id}`;
              }}
            >
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={selectedDecks.includes(deck.id)}
                  onChange={() => toggleDeck(deck.id)}
                  className="mt-1 h-4 w-4 rounded border-slate-400 bg-white text-brand-500 focus:ring-brand-500/40 dark:border-slate-600 dark:bg-slate-950/80"
                />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {deck.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
                    {deck.description || "No description"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    (window.location.href = `/deck/${deck.id}/review`)
                  }
                  className="inline-flex flex-1 items-center justify-center rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  Review
                </button>
                <button
                  onClick={() => deleteDeck(deck.id)}
                  className="inline-flex items-center justify-center rounded-xl bg-red-500/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-400"
                >
                  Delete
                </button>
                <button
                  onClick={() => exportDeck(deck)}
                  className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:border-slate-500"
                >
                  Export
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
