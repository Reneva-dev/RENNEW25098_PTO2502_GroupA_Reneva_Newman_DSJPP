// src/components/Podcasts/PodcastDetail.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PodcastDetail.module.css";

import GenreTags from "../UI/GenreTags";
import { formatDate } from "../../utils/formatDate";

import { useAudioPlayer } from "../../context/AudioPlayerContext";
import { useFavourites } from "../../context/FavouritesContext";
import { loadProgress, getStatus as getListenStatus } from "../../utils/progressStorage";

export default function PodcastDetail({ podcast = {}, genres = [] }) {
  // Defensive defaults in case podcast is undefined when component first renders
  const seasons = podcast.seasons || [];
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);
  const season = seasons[selectedSeasonIndex] || { episodes: [], image: "" };
  const navigate = useNavigate();

  // Audio player API
  const {
    loadAudio,
    play,
    playEpisode, // convenience wrapper (exists in the provided context)
    getEpisodeProgress,
  } = useAudioPlayer();

  // Favourites API
  const { isFavourited, toggleFavourite } = useFavourites();

  // small helper to format seconds -> m:ss
  const fmt = (sec = 0) => {
    if (!isFinite(sec) || sec === null) return "0:00";
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    const m = Math.floor(sec / 60).toString();
    return `${m}:${s}`;
  };

  // Play handler with resume prompt (Option A)
  const handlePlayEpisode = async (ep, index) => {
    const audioUrl = ep?.file || ep?.audio || ""; // tolerant to field name
    if (!audioUrl) {
      console.warn("No audio URL for episode", ep);
      return;
    }

    // meta used by the audio player for progress tracking
    const meta = {
      title: ep.title,
      podcastId: podcast.id,
      seasonIndex: selectedSeasonIndex,
      episodeIndex: index,
    };

    // Get saved progress (if any)
    let saved = null;
    try {
      saved = getEpisodeProgress ? getEpisodeProgress(podcast.id, selectedSeasonIndex, index) : loadProgress(podcast.id, selectedSeasonIndex, index);
    } catch (err) {
      // fallback: try direct loader
      saved = loadProgress(podcast.id, selectedSeasonIndex, index);
    }

    const savedTime = saved?.currentTime ?? 0;
    const savedDuration = saved?.duration ?? 0;

    // If there's a meaningful saved time ( > 5s ) and not already finished, prompt user to resume
    if (savedTime > 5 && (!savedDuration || savedTime < (savedDuration - 3))) {
      const human = fmt(Math.floor(savedTime));
      const resume = window.confirm(`Resume "${ep.title}" at ${human}? (OK = resume, Cancel = start over)`);
      if (resume) {
        // Use playEpisode convenience wrapper if available
        if (typeof playEpisode === "function") {
          await playEpisode({
            audioUrl,
            title: ep.title,
            podcastId: podcast.id,
            seasonIndex: selectedSeasonIndex,
            episodeIndex: index,
            startAt: savedTime,
          });
        } else {
          // fallback: load and then play & seek
          loadAudio(audioUrl, meta, savedTime);
          try {
            await play();
          } catch (err) {
            console.warn("Play failed:", err);
          }
        }
        return;
      }
      // else user chose to start over; fall through to default startAt = 0
    }

    // Default: start from beginning
    if (typeof playEpisode === "function") {
      await playEpisode({
        audioUrl,
        title: ep.title,
        podcastId: podcast.id,
        seasonIndex: selectedSeasonIndex,
        episodeIndex: index,
        startAt: 0,
      });
    } else {
      loadAudio(audioUrl, meta, 0);
      try {
        await play();
      } catch (err) {
        console.warn("Play failed:", err);
      }
    }
  };

  // Defensive render guards while data loads
  if (!podcast || !podcast.seasons) {
    return <div className={styles.container}>Loading podcast...</div>;
  }

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
                <strong>{seasons.length}</strong>
              </div>

              <div>
                <p>Total Episodes:</p>
                <strong>
                  {seasons.reduce((acc, s) => acc + (s.episodes?.length || 0), 0)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEASON SELECTOR */}
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
            {seasons.map((s, i) => (
              <option key={i} value={i}>
                Season {i + 1}
              </option>
            ))}
          </select>
        </div>

        {/* EPISODES */}
        <div className={styles.episodeList}>
          {season.episodes.map((ep, index) => {
            // determine favourite status
            const fav = isFavourited ? isFavourited(podcast.id, selectedSeasonIndex, index) : false;

            // progress info (safely loaded)
            const prog = loadProgress(podcast.id, selectedSeasonIndex, index);
            const percent =
              prog && prog.duration ? Math.min(100, Math.round((prog.currentTime / prog.duration) * 100)) : 0;

            // finished status
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

                  {/* Progress indicator / finished badge */}
                  <div style={{ marginTop: 8 }}>
                    {finished ? (
                      <span style={{ fontSize: 0.9, color: "var(--text-muted)" }}>✔ Completed</span>
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

                {/* Favourite Button */}
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

                {/* Play Button */}
                <button
                  className={styles.playButton}
                  onClick={() => handlePlayEpisode(ep, index)}
                  aria-label={`Play ${ep.title}`}
                >
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
