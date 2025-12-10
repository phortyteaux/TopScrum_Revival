import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function EditDeck() {
  const { id } = useParams(); // deck ID
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  // --------------------------------------
  // Load existing deck data
  // --------------------------------------
  useEffect(() => {
    async function loadDeck() {
      const { data, error } = await supabase
        .from("decks")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        setTitle(data.title);
        setDescription(data.description);
      }
    }

    loadDeck();
  }, [id]);

  // --------------------------------------
  // Save updated deck info
  // --------------------------------------
  async function handleUpdate(e) {
    e.preventDefault();

    const { error } = await supabase
      .from("decks")
      .update({
        title,
        description
      })
      .eq("id", id);

    if (error) {
      setMessage("Error updating deck: " + error.message);
    } else {
      setMessage("Deck updated!");

      setTimeout(() => {
        navigate(`/deck/${id}`); // Return to deck details
      }, 500);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Edit Deck</h2>

      <form onSubmit={handleUpdate}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Deck title"
          required
        />
        <br /><br />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
        <br /><br />

        <button type="submit">Save Changes</button>
      </form>

      <p>{message}</p>
    </div>
  );
}
