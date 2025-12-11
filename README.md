# 📚 Flashcard Web App — CPSC 362 Software Engineering Project

A full-stack flashcard study application built using **React.js**, **Supabase**, and **Vite**.  
This project focuses on real-world software engineering principles: authentication, database schema design, UI/UX, feature iteration, teamwork, and deployment.

---

## 👥 Group Members
- **John Alora**
- **Adan Jeronimo**
- **Max Kwatcher**
- **Sean Lowry**
- **Rami Semrin**
- **Sargun Singh**

---

## 🚀 Project Overview

Our web application allows users to:

- Create, edit, and organize flashcard decks  
- Practice through Review Mode with progress tracking  
- Upload images to cards  
- Export & import decks as JSON  
- View study analytics and hardest cards  
- Shuffle cards, filter starred cards, and more  

Built with modern tools and real database integration, this project demonstrates full-stack engineering practices suitable for production-level applications.

---

## 🛠️ Tech Stack

**Frontend:** React.js (Vite), JavaScript, JSX  
**Backend:** Supabase (PostgreSQL, Auth, Storage)  
**Storage:** Supabase Storage for images  
**Build Tools:** Vite  
**Deployment:** (to be added by team — Netlify / Vercel recommended)

---

## 🌟 Key Features Implemented

### 1. Deck Management
- Create, edit, delete decks  
- Add unlimited cards to any deck  
- Search decks by title  
- Import decks via JSON file  
- Export individual decks  
- Bulk export multiple decks as ZIP  
- Bulk delete multiple decks  

### 2. Card Management
- Create, edit, delete cards  
- Upload images to cards  
- Edit card images and text  
- Filter cards by search  
- Star / unstar cards (favorites system)  

### 3. Review Mode
- Flip cards  
- Mark correct / incorrect  
- Shuffle mode  
- Track attempts, correct count, incorrect count  
- Second-chance review: review incorrect-only cards  
- Image display in review  
- Auto-progress bar with completion screen  

### 4. Deck Analytics Dashboard (Stats Page)
- Total cards  
- Total attempts  
- Correct vs. incorrect  
- Overall accuracy (%)  
- Count of starred cards  
- Hardest cards detection (least accurate with ≥3 attempts)  
- Table of hardest cards  

### 5. Import / Export System
- Export deck with all cards as JSON  
- Import JSON and auto-recreate deck + cards  
- Bulk export selected decks as a downloadable ZIP  

---

## 📂 Project Structure

```
src/
 ├── pages/
 │    ├── MyDecks.jsx
 │    ├── DeckDetails.jsx
 │    ├── AddCard.jsx
 │    ├── EditCard.jsx
 │    ├── ReviewDeck.jsx
 │    ├── DeckStats.jsx
 │    └── EditDeck.jsx
 │
 ├── components/
 │    └── Navbar.jsx
 │
 ├── context/
 │    └── AuthContext.jsx
 │
 ├── lib/
 │    └── supabaseClient.js
 │
 └── App.jsx
```

---

## 🧪 How to Run Locally

### 1. Set up environment variables  
Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your_url_here
VITE_SUPABASE_ANON_KEY=your_key_here
```

### 2. Install dependencies
```
npm install
```

### 3. Start development server
```
npm run dev
```

---

## 🗄️ Database Schema (Supabase)

### Table: decks
```
id (uuid) PK
user_id (uuid)
title (text)
description (text)
created_at (timestamp)
```

### Table: cards
```
id (uuid) PK
deck_id (uuid) FK
front_text (text)
back_text (text)
image_url (text)
starred (boolean, default false)
attempts (int, default 0)
correct (int, default 0)
incorrect (int, default 0)
```

---

## 📄 License
This project is for educational purposes under the CPSC 362 Software Engineering course.

