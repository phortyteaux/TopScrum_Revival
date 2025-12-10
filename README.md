Flashcard Learning App
CPSC 362 – Software Engineering
Team Members

John Alora
Adan Jeronimo
Max Kwatcher
Sean Lowry
Rami Semrin
Sargun Singh

1. Overview

The Flashcard Learning App is a web-based studying tool that allows users to create decks, add cards, review material using multiple modes, track performance analytics, and store learning progress in the cloud. The app focuses on simplicity, accessibility, and efficiency for students who want a customizable study experience.

2. Key Features

– User authentication (signup/login)
– Create, edit, delete decks
– Add cards with text and optional images
– Review mode with progress bar
– Shuffle mode
– Track card attempts, correctness, and accuracy
– Review incorrect cards only
– Starred (favorite) cards
– Deck analytics dashboard (statistics + hardest cards)
– Bulk deck actions: import, export (JSON), delete, ZIP export
– Search for decks and search within a deck
– Upload images via Supabase Storage

3. Architecture Diagram (High-Level)

Frontend → React.js (Vite)
Backend → Supabase (Auth, Database, Storage)
Database → PostgreSQL on Supabase
Hosting → Vercel (optional; instructor-dependent)

Main system components:
– Authentication Service
– Deck service (CRUD)
– Card service (CRUD + analytics logging)
– Review engine
– Analytics engine
– Storage bucket for images

(A proper diagram can be added using draw.io or diagrams.net before submission.)

4. Tech Stack

Frontend: React.js, Vite, JavaScript
Backend-as-a-Service: Supabase
Database: PostgreSQL
Storage: Supabase Storage
UI Libraries: Custom CSS (Tailwind optional)
Build Tools: Node.js, Vite
Version Control: Git/GitHub

5. Code Structure

src/
– pages/
 • Login.jsx
 • Signup.jsx
 • MyDecks.jsx
 • DeckDetails.jsx
 • ReviewDeck.jsx
 • EditDeck.jsx
 • AddCard.jsx
 • EditCard.jsx
 • DeckStats.jsx
– context/
 • AuthContext.jsx
– lib/
 • supabaseClient.js
App.jsx
main.jsx

6. Algorithms & Logic Highlights

– Card shuffle uses randomized array shuffling
– Review engine updates card correctness and attempts
– Incorrect-only mode dynamically rebuilds the review list
– Analytics computation aggregates attempts, effectiveness, and hardest cards
– Bulk export uses JSZip + FileSaver
– Image upload uses Supabase Storage signed URLs

7. Test Plan (Summary)

Testing includes:
– Functional testing of CRUD operations
– Authentication workflow
– Image upload tests
– Review mode logic correctness
– Analytics accuracy
– JSON import/export integrity
– UI validation and error handling

(Full test cases should be included in the final documentation per instructor guidelines.)

8. Deployment Instructions

Clone repository

Install dependencies
 npm install

Create a .env or use Vite environment variables:
 VITE_SUPABASE_URL=xxx
 VITE_SUPABASE_ANON_KEY=xxx

Start dev server
 npm run dev

Optional: Deploy to Vercel

Deployment diagram should describe user → frontend → Supabase interactions as required by CPSC 362 guidelines.

9. Future Improvements

– UI/UX redesign with Tailwind / Material UI
– Spaced repetition algorithm (e.g., SM-2)
– Mobile version (React Native)
– Collaborating on shared decks
– AI-generated practice questions
– Audio flashcards
– Offline mode

10. References

– CPSC 362 Project Guidelines 

CPSC 362 - Project final delver…


– Supabase documentation
– React and Vite documentation