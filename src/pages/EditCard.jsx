import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function EditCard() {
    const { id } = useParams(); // card ID
    const navigate = useNavigate();

    const [front, setFront] = useState("");
    const [back, setBack] = useState("");
    const [imageURL, setImageURL] = useState(null);
    const [newImage, setNewImage] = useState(null);
    const [message, setMessage] = useState("");

    // -----------------------------
    // Load existing card data
    // -----------------------------
    useEffect(() => {
        async function loadCard() {
            const { data, error } = await supabase
                .from("cards")
                .select("*")
                .eq("id", id)
                .single();

            if (data) {
                setFront(data.front_text);
                setBack(data.back_text);
                setImageURL(data.image_url);
            }
        }

        loadCard();
    }, [id]);

    // -----------------------------
    // Upload new image (if provided)
    // -----------------------------
    async function uploadImage(file) {
        if (!file) return null;

        const filePath = `${Date.now()}_${file.name}`;

        // Try uploading the file to the correct bucket
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from("card-images")
            .upload(filePath, file)

        if (uploadError) {
            console.error("UPLOAD ERROR:", uploadError);
            setMessage("Upload failed: " + uploadError.message);
            return null;
        }

        // Get public URL using Supabase's new syntax
        const { data: urlData } = supabase
            .storage
            .from("card-images")
            .getPublicUrl(filePath);

        console.log("PUBLIC URL:", urlData.publicUrl);

        return urlData.publicUrl;
    }


    // -----------------------------
    // Update card in DB
    // -----------------------------
    async function handleUpdate(e) {
        e.preventDefault();

        let finalImageURL = imageURL;

        if (newImage) {
            finalImageURL = await uploadImage(newImage);
        }

        const { error } = await supabase
            .from("cards")
            .update({
                front_text: front,
                back_text: back,
                image_url: finalImageURL
            })
            .eq("id", id);

        if (error) setMessage(error.message);
        else {
            setMessage("Card updated!");
            setTimeout(() => {
                navigate(-1); // go back to deck page
            }, 600);
        }
    }

    return (
        <div style={{ padding: "20px" }}>
            <h2>Edit Card</h2>

            <form onSubmit={handleUpdate}>
                <input
                    type="text"
                    value={front}
                    onChange={(e) => setFront(e.target.value)}
                    placeholder="Front text"
                    required
                />
                <br /><br />

                <textarea
                    value={back}
                    onChange={(e) => setBack(e.target.value)}
                    placeholder="Back text"
                    required
                />
                <br /><br />

                {/* Show existing image */}
                {imageURL && (
                    <img
                        src={imageURL}
                        alt="Current"
                        style={{ width: "150px", marginBottom: "10px" }}
                    />
                )}
                <br />

                {/* Upload new image */}
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewImage(e.target.files[0])}
                />
                <br /><br />

                <button type="submit">Save Changes</button>
            </form>

            <p>{message}</p>
        </div>
    );
}
