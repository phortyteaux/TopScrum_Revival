import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AddCard() {
  const { id: deck_id } = useParams();
  const navigate = useNavigate();

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [starred, setStarred] = useState(false);
  const [message, setMessage] = useState("");

  // Upload image to Supabase Storage
  async function uploadImage(file) {
    if (!file) return null;

    const filePath = `${deck_id}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("card-images")
      .upload(filePath, file);

    if (uploadError) {
      console.error(uploadError);
      return null;
    }

    const { data: publicURL } = supabase.storage
      .from("card-images")
      .getPublicUrl(filePath);

    return publicURL.publicUrl;
  }

  const handleCreate = async (e) => {
    e.preventDefault();

    let image_url = null;

    if (imageFile) {
      image_url = await uploadImage(imageFile);
    }

    const { error } = await supabase.from("cards").insert({
      deck_id,
      front_text: front,
      back_text: back,
      image_url,
      starred: starred,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Card added!");
      setFront("");
      setBack("");
      setImageFile(null);
      setStarred(false);

      // redirect to deck page
      setTimeout(() => navigate(`/deck/${deck_id}`), 600);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Add Card</h2>

      <form onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Front text"
          value={front}
          onChange={(e) => setFront(e.target.value)}
          required
        />
        <br />
        <br />

        <textarea
          placeholder="Back text"
          value={back}
          onChange={(e) => setBack(e.target.value)}
          required
        />
        <br />
        <br />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
        />
        <br />
        <br />

        <label>
          <input
            type="checkbox"
            checked={starred}
            onChange={(e) => setStarred(e.target.checked)}
            style={{ marginRight: "6px" }}
          />
          Star / favorite this card
        </label>
        <br />
        <br />

        <button type="submit">Add Card</button>
      </form>

      <p>{message}</p>
    </div>
  );
}
