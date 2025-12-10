import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function DeckDetails() {

    // Get the deck ID from the URL (ex: /deck/123 → id = "123")
    const { id } = useParams();

    // Get the currently logged-in user
    const { user } = useAuth();

    // Store deck information and cards in component state
    const [deck, setDeck] = useState(null);
    const [cards, setCards] = useState([]);

    // ---------------------------------------------------------
    // LOAD DECK INFORMATION
    // Runs every time the deck ID or user changes
    // ---------------------------------------------------------
    useEffect(() => {

        // Fetch the deck info from Supabase
        async function fetchDeck() {
            const { data, error } = await supabase
                .from("decks")
                .select("*")
                .eq("id", id)         // match the deck ID from the URL
                .eq("user_id", user.id)  // ensure it belongs to the logged-in user
                .single();            // returns exactly one result

            if (!error) setDeck(data);
        }

        // Only fetch the deck AFTER we know who the user is
        if (user) fetchDeck();

    }, [id, user]);  // dependencies → reload deck if ID or user changes



    // ---------------------------------------------------------
    // LOAD CARDS FOR THIS DECK
    // Runs every time the deck ID changes
    // ---------------------------------------------------------
    useEffect(() => {

        // Fetch all cards that belong to this deck
        async function fetchCards() {
            const { data, error } = await supabase
                .from("cards")
                .select("*")
                .eq("deck_id", id);   // match deck foreign key

            if (!error) setCards(data);
        }

        fetchCards();

    }, [id]);  // only reload cards when deck ID changes



    // If data is still loading, show a simple loading screen
    if (!deck) return <p>Loading deck...</p>;


    // ---------------------------------------------------------
    // MAIN PAGE RENDER — SHOW DECK + ALL CARDS
    // ---------------------------------------------------------
    return (
        <div style={{ padding: "20px" }}>
            <h1>{deck.title}</h1>
            <p>{deck.description}</p>
            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "10px",
                    marginBottom: "20px",
                }}
            >
                <a href={`/deck/${id}/edit`}>
                    <button
                        style={{
                            backgroundColor: "orange",
                            color: "white",
                            padding: "6px 12px",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                    >
                        Edit Deck
                    </button>
                </a>

                <button
                    style={{
                        backgroundColor: "red",
                        color: "white",
                        padding: "6px 12px",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                    onClick={async () => {
                        const confirmDelete = confirm(
                            "Are you sure you want to delete this deck? This cannot be undone."
                        );
                        if (!confirmDelete) return;

                        const { error } = await supabase.from("decks").delete().eq("id", id);

                        if (!error) {
                            window.location.href = "/my-decks";
                        }
                    }}
                >
                    Delete Deck
                </button>

                <a href={`/deck/${id}/review`}>
                    <button
                        style={{
                            backgroundColor: "purple",
                            color: "white",
                            padding: "6px 12px",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                    >
                        Review Deck
                    </button>
                </a>
            </div>

            <h2>Cards</h2>

            {cards.length === 0 ? (
                <p>No cards yet.</p>
            ) : (
                <ul>
                    {cards.map((card) => (

                        <li key={card.id} style={{ marginBottom: "20px" }}>
                            {/* Card Front and Back Text */}
                            <strong>{card.front_text}</strong>
                            <br />
                            {card.back_text}
                            <br />

                            {/* Display card image if available */}
                            {card.image_url && (
                                <img
                                    src={card.image_url}
                                    alt="Card"
                                    style={{
                                        width: "200px",
                                        marginTop: "10px",
                                        borderRadius: "8px"
                                    }}
                                />
                            )}

                            <br />

                            {/* DELETE CARD BUTTON */}
                            <button
                                style={{
                                    marginTop: "10px",
                                    backgroundColor: "red",
                                    color: "white",
                                    padding: "4px 8px",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                }}

                                // When clicked → delete card from Supabase,
                                // then remove it from the UI immediately
                                onClick={async () => {
                                    const { error } = await supabase
                                        .from("cards")
                                        .delete()
                                        .eq("id", card.id);

                                    if (!error) {
                                        // Remove card locally so UI updates right away
                                        setCards(cards.filter((c) => c.id !== card.id));
                                    }
                                }}
                            >
                                Delete
                            </button>
                            {/* Edit button */}
                            <a href={`/card/${card.id}/edit`}>
                                <button
                                    style={{
                                        marginTop: "10px",
                                        marginRight: "10px",
                                        backgroundColor: "blue",
                                        color: "white",
                                        padding: "4px 8px",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Edit
                                </button>
                            </a>
                        </li>

                    ))}
                </ul>
            )}

            {/* Button to navigate to Add Card page */}
            <a href={`/deck/${id}/add-card`}>
                <button>Add New Card</button>
            </a>
        </div>
    );
}
