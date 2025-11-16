import styles from "./Header.module.css";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className={styles.appHeader}>
      <h1>
        <Link to="/">🎙️ Podcast App</Link>
      </h1>

      {/* NEW: Favourites Navigation Link */}
      <nav className={styles.navLinks}>
        <Link to="/favourites" className={styles.navItem}>
          ❤️ Favourites
        </Link>
      </nav>
    </header>
  );
}

