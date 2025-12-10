import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import CreateDeck from "./pages/CreateDeck";
import MyDecks from "./pages/MyDecks";
import DeckDetails from "./pages/DeckDetails";
import AddCard from "./pages/AddCard";
import EditCard from "./pages/EditCard";
import EditDeck from "./pages/EditDeck";
import ReviewDeck from "./pages/ReviewDeck";
import DeckStats from "./pages/DeckStats";
import Home from "./pages/Home";
import Demo from "./pages/Demo"



function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: 20 }}>
        <Link to="/" style={{ marginRight: 10 }}>Home</Link>
        <Link to="/signup" style={{ marginRight: 10 }}>Signup</Link>
        <Link to="/login" style={{ marginRight: 10 }}>Login</Link>
        <Link to="/create-deck" style={{ marginRight: 10 }}>Create Deck</Link>
        <Link to="/my-decks">My Decks</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/create-deck" element={<CreateDeck />} />
        <Route path="/my-decks" element={<MyDecks />} />
        <Route path="/deck/:id" element={<DeckDetails />} />
        <Route path="/deck/:id/add-card" element={<AddCard />} />
        <Route path="/card/:id/edit" element={<EditCard />} />
        <Route path="/deck/:id/edit" element={<EditDeck />} />
        <Route path="/deck/:id/review" element={<ReviewDeck />} />
        <Route path="/deck/:id/stats" element={<DeckStats />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
