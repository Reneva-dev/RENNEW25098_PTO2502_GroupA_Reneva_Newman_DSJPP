// src/components/UI/Header.jsx
import styles from "./Header.module.css";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={styles.appHeader}>
      <div className={styles.inner}>
        <h1 className={styles.logo}>
          <Link to="/">🎙️ Podcast App</Link>
        </h1>

        <nav className={styles.nav}>
          <Link to="/favourites" className={styles.navLink}>
            ⭐ Favourites
          </Link>

          {/* Theme toggle button (emoji) */}
          <button
            className={styles.themeBtn}
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </nav>
      </div>
    </header>
  );
}



