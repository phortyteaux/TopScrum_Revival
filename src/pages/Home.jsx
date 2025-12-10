export default function Home() {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Welcome to TopScrum Flashcards</h1>
      <p>Your study companion — fast, clean, powerful.</p>

      <div style={{ marginTop: "20px" }}>
        <a href="/signup">
          <button
            style={{
              padding: "10px 20px",
              backgroundColor: "purple",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            Sign Up
          </button>
        </a>

        <a href="/login">
          <button
            style={{
              padding: "10px 20px",
              backgroundColor: "blue",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Log In
          </button>
        </a>
      </div>
	  
      <div style={{ marginBottom: "20px", textAlign: "left" }}>
          <h3>About us</h3>
          <a href="https://github.com/phortyteaux/TopScrum_Revival">
            GitHub
          </a>
          <br></br>
          <a href="/demo">
            How it works
          </a>
      </div>
    </div>

  );
}
