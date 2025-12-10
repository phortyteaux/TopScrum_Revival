import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function CreateDeck() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from("decks")
      .insert({
        title,
        description,
        user_id: user.id,
      });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Deck created!");
      setTitle("");
      setDescription("");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create a New Deck</h2>
      <form onSubmit={handleCreate}>
        <input
          placeholder="Deck title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        /><br /><br />

        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        /><br /><br />

        <button type="submit">Create Deck</button>
      </form>

      <p>{message}</p>
    </div>
  );
}
