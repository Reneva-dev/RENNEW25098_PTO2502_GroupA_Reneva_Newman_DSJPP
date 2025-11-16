import { useFavourites } from "../context/FavouritesContext";
import { useAudioPlayer } from "../context/AudioPlayerContext";   // <-- NEW
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { timeAgo } from "../utils/timeAgo";                      // <-- NEW
import styles from "./FavouritesPage.module.css";

export default function FavouritesPage() {
  const { favourites, toggleFavourite } = useFavourites();
  const { playEpisode } = useAudioPlayer();                      // <-- NEW

  const [sortOption, setSortOption] = useState("newest");

  // Group favourites by show title
  const grouped = useMemo(() => {
    const groups = favourites.reduce((acc, fav) => {
      if (!acc[fav.podcastTitle]) acc[fav.podcastTitle] = [];
      acc[fav.podcastTitle].push(fav);
      return acc;
    }, {});

    // Apply sorting inside each group
    Object.keys(groups).forEach((show) => {
      groups[show] = [...groups[show]].sort((a, b) => {
        switch (sortOption) {
          case "az":
            return a.episodeTitle.localeCompare(b.episodeTitle);
          case "za":
            return b.episodeTitle.localeCompare(a.episodeTitle);
          case "oldest":
            return a.addedAt - b.addedAt;
          case "newest":
          default:
            return b.addedAt - a.addedAt;
        }
      });
    });

    return groups;
  }, [favourites, sortOption]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>❤️ Your Favourite Episodes</h1>

      {/* Sorting Options */}
      <div className={styles.sortBar}>
        <label>Sort:</label>
        <select
          className={styles.sortDropdown}
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="newest">Newest added</option>
          <option value="oldest">Oldest added</option>
          <option value="az">Episode Title A → Z</option>
          <option value="za">Episode Title Z → A</option>
        </select>
      </div>

      {/* Empty State */}
      {favourites.length === 0 && (
        <p className={styles.empty}>You have no favourite episodes yet.</p>
      )}

      {/* Favourites grouped by show */}
      {Object.keys(grouped).map((show) => (
        <div key={show} className={styles.showGroup}>
          <h2 className={styles.showTitle}>{show}</h2>

          {grouped[show].map((ep) => (
            <div key={ep.id} className={styles.episodeCard}>
              
              {/* Episode Image */}
              <img
                src={ep.image || "/placeholder.jpg"}
                alt={ep.episodeTitle}
                className={styles.cover}
              />

              <div className={styles.info}>
                
                {/* Link to show detail */}
                <Link to={`/show/${ep.podcastId}`} className={styles.link}>
                  <h3 className={styles.episodeTitle}>
                    Episode {ep.episodeIndex + 1}: {ep.episodeTitle}
                  </h3>
                </Link>

                {/* Human-friendly timestamp */}
                <p className={styles.meta}>
                  Season {ep.seasonNumber} • Added {timeAgo(ep.addedAt)}
                </p>
              </div>

              {/* ▶ PLAY BUTTON (STEP 6B) */}
              <button
                className={styles.playButton}
                onClick={() =>
                  playEpisode({
                    title: ep.episodeTitle,
                    audioUrl: ep.audioUrl,
                    podcastTitle: ep.podcastTitle,
                    episodeNumber: ep.episodeIndex + 1,
                  })
                }
              >
                ▶
              </button>

              {/* Remove Button */}
              <button
                className={styles.removeBtn}
                onClick={() =>
                  toggleFavourite({
                    podcastId: ep.podcastId,
                    seasonIndex: ep.seasonIndex,
                    episodeIndex: ep.episodeIndex,
                  })
                }
              >
                ✖
              </button>

            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

