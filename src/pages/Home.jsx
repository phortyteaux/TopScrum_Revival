import React from 'react';
import { Link } from 'react-router-dom';
import { footerSections } from "./footerData";

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
      <Footer />
    </div>

  );
}

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Loop through the columns */}
        {footerSections.map((section) => (
          <div key={section.title} className="footer-column">
            <h4 className="column-title">{section.title}</h4>
            <ul className="column-links">
              {/* Loop through the links in each column */}
              {section.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
};
