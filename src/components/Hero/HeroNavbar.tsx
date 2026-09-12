import { useState } from "react";
import BrandMark from "./BrandMark";
export type Panel = "about" | "scents" | "shop";
export default function HeroNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="hero-navbar">
      <a
        className="brand"
        href="#home"
        aria-label="AERIS home"
        onClick={() => setMenuOpen(false)}
      >
        <BrandMark />
        <span>AERIS</span>
      </a>
      <button
        className="menu-toggle"
        aria-expanded={menuOpen}
        aria-controls="main-navigation"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? "CLOSE" : "MENU"}
        <span aria-hidden="true">{menuOpen ? "−" : "+"}</span>
      </button>
      <nav
        id="main-navigation"
        aria-label="Main navigation"
        className={menuOpen ? "navigation is-open" : "navigation"}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setMenuOpen(false);
            document.querySelector<HTMLButtonElement>(".menu-toggle")?.focus();
          }
        }}
      >
        {[
          ["HOME", "home"],
          ["ABOUT", "about"],
          ["SCENTS", "scents"],
          ["SHOP", "shop"],
        ].map(([label, id]) => (
          <a
            key={id}
            className={`nav-item ${id === "home" ? "active" : ""}`}
            href={`#${id}`}
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </a>
        ))}
        <a
          className="bag-button"
          href="#shop"
          aria-label="View candle and purchase"
          onClick={() => setMenuOpen(false)}
        >
          <svg
            width="24"
            height="28"
            viewBox="0 0 24 28"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 8h18l1 18H2L3 8Z M8 8V5a4 4 0 0 1 8 0v3"
              stroke="currentColor"
              strokeWidth="1.1"
            />
          </svg>
        </a>
      </nav>
    </header>
  );
}
