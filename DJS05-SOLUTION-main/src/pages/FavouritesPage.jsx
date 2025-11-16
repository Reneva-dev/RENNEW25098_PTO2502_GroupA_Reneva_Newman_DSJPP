import { useEffect, useState } from "react";
import styles from "./FavouritesPage.module.css";

export default function FavouritesPage() {
  const [favourites, setFavourites] = useState([]);
  const [grouped, setGrouped] = useState({});

  // Load favourites from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("favouriteEpisodes") || "[]");
    setFavourites(saved);
  }, []);

  // Group episodes by show title
  useEffect(() => {
    const groups = favourites.reduce((acc, ep) => {
      if (!acc[ep.showTitle]) acc[ep.showTitle] = [];
      acc[ep.showTitle].push(ep);
      return acc;
    }, {});

    setGrouped(groups);
  }, [favourites]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Your Favourite Episodes</h1>

      {favourites.length === 0 && (
        <p className={styles.empty}>No favourites yet.</p>
      )}

      {Object.keys(grouped).map(show => (
        <div key={show} className={styles.showGroup}>
          <h2 className={styles.showTitle}>{show}</h2>

          {grouped[show].map(ep => (
            <div key={ep.id} className={styles.episodeCard}>
              <div className={styles.info}>
                <p className={styles.epTitle}>
                  Episode {ep.episodeNumber}: {ep.title}
                </p>

                <p className={styles.meta}>
                  Season {ep.seasonNumber} • Added:{" "}
                  {new Date(ep.addedAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
