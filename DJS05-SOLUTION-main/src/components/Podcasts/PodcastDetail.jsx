import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PodcastDetail.module.css";
import GenreTags from "../UI/GenreTags";
import { formatDate } from "../../utils/formatDate";

import { useAudioPlayer } from "../../context/AudioPlayerContext";
import { useFavourites } from "../../context/FavouritesContext";

export default function PodcastDetail({ podcast, genres }) {
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);
  const season = podcast.seasons[selectedSeasonIndex];
  const navigate = useNavigate();

  const { playEpisode } = useAudioPlayer();
  const { isFavourited, toggleFavourite } = useFavourites();

  const handlePlayEpisode = (ep, index) => {
    playEpisode({
      title: ep.title,
      audioUrl: ep.file,
      podcastTitle: podcast.title,
      episodeNumber: index + 1,
    });
  };

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* HEADER */}
      <div className={styles.header}>
        <img src={podcast.image} className={styles.cover} alt="" />

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
                  {podcast.seasons.reduce(
                    (acc, s) => acc + s.episodes.length,
                    0
                  )}
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
            <img src={season.image} className={styles.seasonCover} alt="" />
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

        {/* EPISODES */}
        <div className={styles.episodeList}>
          {season.episodes.map((ep, index) => {
            const fav = isFavourited(podcast.id, selectedSeasonIndex, index);

            return (
              <div key={index} className={styles.episodeCard}>
                <img src={season.image} className={styles.episodeCover} alt="" />

                <div className={styles.episodeInfo}>
                  <p className={styles.episodeTitle}>
                    Episode {index + 1}: {ep.title}
                  </p>
                  <p className={styles.episodeDesc}>{ep.description}</p>
                </div>

                {/* ❤️ */}
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
                >
                  {fav ? "❤️" : "🤍"}
                </button>

                {/* ▶ */}
                <button
                  className={styles.playButton}
                  onClick={() => handlePlayEpisode(ep, index)}
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

