// src/pages/FavouritesPage.jsx
import { useFavourites } from "../context/FavouritesContext";
import { useState, useMemo } from "react";
import styles from "./FavouritesPage.module.css";
import { loadProgress, getStatus, resetAllProgress } from "../utils/progressStorage";
import { useNavigate } from "react-router-dom";

export default function FavouritesPage() {
  const { favourites, toggleFavourite } = useFavourites();
  const [sortOption, setSortOption] = useState("newest");
  const navigate = useNavigate();

  const grouped = useMemo(() => {
    const groups = favourites.reduce((acc, fav) => {
      if (!acc[fav.podcastTitle]) acc[fav.podcastTitle] = [];
      acc[fav.podcastTitle].push(fav);
      return acc;
    }, {});

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

  const handleResetHistory = () => {
    if (!window.confirm("Reset listening history? This will erase progress and finished flags.")) return;
    resetAllProgress();
    // Optionally show toast if you have one; leaving it as a native confirm for now.
    window.location.reload(); // reload to update UI (or you can rerender)
  };

  return (
    <div className={styles.container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className={styles.title}>❤️ Your Favourite Episodes</h1>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <label style={{ color: "var(--text-muted)" }}>Sort:</label>
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

          <button className={styles.resetBtn} onClick={handleResetHistory} title="Reset listening history">
            Reset History
          </button>
        </div>
      </div>

      {favourites.length === 0 && <p className={styles.empty}>You have no favourite episodes yet.</p>}

      {Object.keys(grouped).map((show) => (
        <div key={show} className={styles.showGroup}>
          <h2 className={styles.showTitle}>{show}</h2>

          {grouped[show].map((ep) => {
            const prog = loadProgress(ep.podcastId, ep.seasonIndex, ep.episodeIndex);
            const percent = prog && prog.duration ? Math.min(100, Math.round((prog.currentTime / prog.duration) * 100)) : 0;
            const status = getStatus(ep.podcastId, ep.seasonIndex, ep.episodeIndex);
            const finished = status && status.status === "finished";

            return (
              <div key={ep.id} className={styles.episodeCard}>
                <img src={ep.image || "/placeholder.jpg"} alt={ep.episodeTitle} className={styles.cover} />

                <div className={styles.info} onClick={() => navigate(`/show/${ep.podcastId}`, { state: { genres: [] } })}>
                  <h3 className={styles.episodeTitle}>
                    Episode {ep.episodeIndex + 1}: {ep.episodeTitle}
                  </h3>

                  <p className={styles.meta}>
                    Season {ep.seasonNumber} • Added: {new Date(ep.addedAt).toLocaleString()}
                  </p>

                  {/* Progress display */}
                  <div style={{ marginTop: 8 }}>
                    {finished ? (
                      <span style={{ fontSize: 0.9, color: "var(--text-muted)" }}>✔ Completed</span>
                    ) : prog ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ height: 8, background: "var(--tag-bg)", borderRadius: 6, overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${percent}%`,
                                height: "100%",
                                background: "linear-gradient(90deg,var(--header-bg),var(--tag-bg))",
                              }}
                            />
                          </div>
                        </div>
                        <div style={{ minWidth: 70, textAlign: "right", fontSize: 12, color: "var(--text-muted)" }}>
                          {Math.round(percent)}%
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <button
                  className={styles.removeBtn}
                  onClick={() =>
                    toggleFavourite({
                      podcastId: ep.podcastId,
                      seasonIndex: ep.seasonIndex,
                      episodeIndex: ep.episodeIndex,
                    })
                  }
                  title="Remove"
                >
                  ✖
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}


