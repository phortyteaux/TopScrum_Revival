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

    // NEW: search state for filtering cards
    const [cardSearch, setCardSearch] = useState("");

    // ---------------------------------------------------------
    // EXPORT DECK AS JSON FILE
    // ---------------------------------------------------------
    async function exportDeck() {
        // Fetch cards to ensure latest info
        const { data: cardData } = await supabase
            .from("cards")
            .select("*")
            .eq("deck_id", id);

        const exportData = {
            title: deck.title,
            description: deck.description,
            cards: cardData || []
        };

        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `${deck.title.replace(/\s+/g, "_")}_deck.json`;
        a.click();

        URL.revokeObjectURL(url);
    }

    // ---------------------------------------------------------
    // LOAD DECK INFORMATION
    // ---------------------------------------------------------
    useEffect(() => {

        async function fetchDeck() {
            const { data, error } = await supabase
                .from("decks")
                .select("*")
                .eq("id", id)
                .eq("user_id", user.id)
                .single();

            if (!error) setDeck(data);
        }

        if (user) fetchDeck();

    }, [id, user]);



    // ---------------------------------------------------------
    // LOAD CARDS FOR THIS DECK
    // ---------------------------------------------------------
    useEffect(() => {

        async function fetchCards() {
            const { data, error } = await supabase
                .from("cards")
                .select("*")
                .eq("deck_id", id);

            if (!error) setCards(data);
        }

        fetchCards();

    }, [id]);


    // If still loading deck info
    if (!deck) return <p>Loading deck...</p>;

    // ---------------------------------------------------------
    // FILTER CARDS BASED ON SEARCH INPUT
    // ---------------------------------------------------------
    const filteredCards = cards.filter((card) =>
        (card.front_text + " " + card.back_text)
            .toLowerCase()
            .includes(cardSearch.toLowerCase())
    );


    // ---------------------------------------------------------
    // MAIN PAGE RENDER — SHOW DECK + ALL CARDS
    // ---------------------------------------------------------
    return (
        <div style={{ padding: "20px" }}>
            <h1>{deck.title}</h1>
            <p>{deck.description}</p>

            {/* ACTION BUTTONS */}
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

                {/* NEW EXPORT BUTTON */}
                <button
                    style={{
                        backgroundColor: "gray",
                        color: "white",
                        padding: "6px 12px",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                    onClick={exportDeck}
                >
                    Export Deck
                </button>
            </div>

            <h2>Cards</h2>

            {/* NEW SEARCH BAR */}
            <input
                type="text"
                placeholder="Search cards..."
                value={cardSearch}
                onChange={(e) => setCardSearch(e.target.value)}
                style={{
                    padding: "8px",
                    width: "80%",
                    margin: "10px 0 20px 0",
                    border: "1px solid gray",
                    borderRadius: "6px",
                }}
            />

            {/* CARD LIST */}
            {filteredCards.length === 0 ? (
                <p>No matching cards.</p>
            ) : (
                <ul>
                    {filteredCards.map((card) => (

                        <li key={card.id} style={{ marginBottom: "20px" }}>
                            <strong>{card.front_text}</strong>
                            <br />
                            {card.back_text}
                            <br />

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
                                onClick={async () => {
                                    const { error } = await supabase
                                        .from("cards")
                                        .delete()
                                        .eq("id", card.id);

                                    if (!error) {
                                        setCards(cards.filter((c) => c.id !== card.id));
                                    }
                                }}
                            >
                                Delete
                            </button>

                            {/* EDIT BUTTON */}
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

            {/* Add Card Button */}
            <a href={`/deck/${id}/add-card`}>
                <button>Add New Card</button>
            </a>
        </div>
    );
}
