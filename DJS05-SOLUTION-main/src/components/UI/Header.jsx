import styles from "./Header.module.css";
import { Link } from "react-router-dom";

export default function Header() {
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
        </nav>
      </div>
    </header>
  );
}


