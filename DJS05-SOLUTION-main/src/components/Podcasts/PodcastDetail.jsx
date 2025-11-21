// src/components/Podcasts/PodcastDetail.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PodcastDetail.module.css";
import GenreTags from "../UI/GenreTags";
import { formatDate } from "../../utils/formatDate";
import { formatTime } from "../../utils/formatDate"; // if your formatDate exports formatTime; otherwise you can add a small helper below

import { useAudioPlayer } from "../../context/AudioPlayerContext";
import { useFavourites } from "../../context/FavouritesContext";
import { loadProgress, getStatus as getListenStatus } from "../../utils/progressStorage";

export default function PodcastDetail({ podcast, genres }) {
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);
  const season = podcast.seasons[selectedSeasonIndex];
  const navigate = useNavigate();

  const { loadAudio, play, seek, getEpisodeProgress } = useAudioPlayer();
  const { isFavourited, toggleFavourite } = useFavourites();

  // small helper to format seconds -> m:ss
  const fmt = (sec = 0) => {
    if (!isFinite(sec)) return "0:00";
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    const m = Math.floor(sec / 60).toString();
    return `${m}:${s}`;
  };

  const handlePlayEpisode = async (ep, index) => {
    // ep.file assumed to be audio URL
    const meta = {
      title: ep.title,
      podcastId: podcast.id,
      seasonIndex: selectedSeasonIndex,
      episodeIndex: index,
    };

    // load saved progress
    const saved = getEpisodeProgress(podcast.id, selectedSeasonIndex, index);
    const savedTime = saved?.currentTime ?? 0;
    const duration = saved?.duration ?? 0;

    // if user has a significant savedTime ( > 5s ) and not already finished, prompt
    const finishedThreshold = 3; // small threshold to treat near-zero as not started
    if (savedTime > 5 && (!duration || savedTime < (duration - 3))) {
      const human = fmt(savedTime);
      const resume = window.confirm(`Resume "${ep.title}" at ${human}? (OK = resume, Cancel = start over)`);
      if (resume) {
        // load audio and seek to savedTime then play
        loadAudio(ep.file, meta, savedTime);
        try {
          await play();
        } catch {}
        return;
      }
      // else user asked to start over: load at 0
    }

    // default: load and play from start
    loadAudio(ep.file, meta, 0);
    try {
      await play();
    } catch {}
  };

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* HEADER */}
      <div className={styles.header}>
        <img src={podcast.image} className={styles.cover} alt={`${podcast.title} cover`} />

        <div>
          <h1 className={styles.title}>{podcast.title}</h1>
          <p className={styles.description}>{podcast.description}</p>

          <div className={styles.metaInfo}>
            <div className={styles.seasonInfo}>
              <div>
                <p>Genres</p>
                <GenreTags genres={genres} />
              </div>

              <div>
                <p>Last Updated:</p>
                <strong>{formatDate(podcast.updated)}</strong>
              </div>

              <div>
                <p>Total Seasons:</p>
                <strong>{podcast.seasons.length}</strong>
              </div>

              <div>
                <p>Total Episodes:</p>
                <strong>
                  {podcast.seasons.reduce((acc, s) => acc + s.episodes.length, 0)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Season Selector */}
      <div className={styles.seasonDetails}>
        <div className={styles.seasonIntro}>
          <div className={styles.left}>
            <img src={season.image} className={styles.seasonCover} alt={`${season.title} cover`} />
            <div>
              <h3>
                Season {selectedSeasonIndex + 1}: {season.title}
              </h3>
              <p>{season.description}</p>
              <p className={styles.releaseInfo}>
                {season.episodes.length} Episodes
              </p>
            </div>
          </div>

          <select
            value={selectedSeasonIndex}
            onChange={(e) => setSelectedSeasonIndex(Number(e.target.value))}
            className={styles.dropdown}
          >
            {podcast.seasons.map((s, i) => (
              <option key={i} value={i}>
                Season {i + 1}
              </option>
            ))}
          </select>
        </div>

        {/* Episode List */}
        <div className={styles.episodeList}>
          {season.episodes.map((ep, index) => {
            const fav = isFavourited(podcast.id, selectedSeasonIndex, index);
            const prog = loadProgress(podcast.id, selectedSeasonIndex, index);
            const percent =
              prog && prog.duration ? Math.min(100, Math.round((prog.currentTime / prog.duration) * 100)) : 0;
            const status = getListenStatus ? getListenStatus(podcast.id, selectedSeasonIndex, index) : null;
            const finished = status && status.status === "finished";

            return (
              <div key={index} className={styles.episodeCard}>
                <img src={season.image} className={styles.episodeCover} alt={`Episode ${index + 1} cover`} />

                <div className={styles.episodeInfo}>
                  <p className={styles.episodeTitle}>
                    Episode {index + 1}: {ep.title}
                  </p>
                  <p className={styles.episodeDesc}>{ep.description}</p>

                  {/* Progress indicator + finished */}
                  <div style={{ marginTop: 8 }}>
                    {finished ? (
                      <span style={{ fontSize: 0.85, color: "var(--text-muted)" }}>✔ Completed</span>
                    ) : prog ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ height: 6, background: "var(--tag-bg)", borderRadius: 6, overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${percent}%`,
                                height: "100%",
                                background: "linear-gradient(90deg,var(--header-bg),var(--tag-bg))",
                              }}
                            />
                          </div>
                        </div>
                        <div style={{ minWidth: 60, textAlign: "right", fontSize: 12, color: "var(--text-muted)" }}>
                          {fmt(Math.floor(prog.currentTime))} / {fmt(Math.floor(prog.duration || 0))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Favourite button */}
                <button
                  className={styles.favouriteButton}
                  onClick={() =>
                    toggleFavourite({
                      podcastId: podcast.id,
                      podcastTitle: podcast.title,
                      seasonIndex: selectedSeasonIndex,
                      seasonNumber: selectedSeasonIndex + 1,
                      episodeIndex: index,
                      episodeTitle: ep.title,
                      image: season.image,
                    })
                  }
                  aria-label={fav ? "Remove favourite" : "Add favourite"}
                >
                  {fav ? "❤️" : "🤍"}
                </button>

                {/* Play button */}
                <button className={styles.playButton} onClick={() => handlePlayEpisode(ep, index)}>
                  ▶
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


