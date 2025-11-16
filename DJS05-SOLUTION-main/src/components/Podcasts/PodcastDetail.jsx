import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PodcastDetail.module.css";
import { formatDate } from "../../utils/formatDate";
import GenreTags from "../UI/GenreTags";
import { useAudioPlayer } from "../../context/AudioPlayerContext";
import { useFavourites } from "../../context/FavouritesContext"; // <-- Import favourites context

export default function PodcastDetail({ podcast, genres }) {
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);
  const season = podcast.seasons[selectedSeasonIndex];
  const navigate = useNavigate();

  const { playEpisode } = useAudioPlayer();
  const { favourites, toggleFavourite } = useFavourites(); // <-- Use context

  // Play selected episode
  const handlePlayEpisode = (ep, index) => {
    playEpisode({
      title: ep.title,
      audioUrl: ep.file,
      podcastTitle: podcast.title,
      episodeNumber: index + 1,
    });
  };

  // Helper to check if an episode is favourited
  const isFavourited = (episode) => {
    // Assume episode id or title is unique identifier
    // You can customize this to use a better unique ID if available
    return favourites.some(
      (fav) =>
        fav.episodeTitle === episode.title &&
        fav.podcastId === podcast.id &&
        fav.seasonIndex === selectedSeasonIndex
    );
  };

  // Handle favourite toggle
  const handleToggleFavourite = (episode, index) => {
    toggleFavourite({
      podcastId: podcast.id,
      podcastTitle: podcast.title,
      seasonIndex: selectedSeasonIndex,
      seasonTitle: season.title,
      episodeIndex: index,
      episodeTitle: episode.title,
      episodeDescription: episode.description,
      episodeAudioUrl: episode.file,
      dateAdded: new Date().toISOString(),
      image: season.image, // For display purposes
    });
  };

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className={styles.header}>
        <img src={podcast.image} alt="Podcast Cover" className={styles.cover} />
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
                <strong>{podcast.seasons.length} Seasons</strong>
              </div>

              <div>
                <p>Total Episodes:</p>
                <strong>
                  {podcast.seasons.reduce((acc, s) => acc + s.episodes.length, 0)} Episodes
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.seasonDetails}>
        <div className={styles.seasonIntro}>
          <div className={styles.left}>
            <img className={styles.seasonCover} src={season.image} />
            <div>
              <h3>
                Season {selectedSeasonIndex + 1}: {season.title}
              </h3>
              <p>{season.description}</p>
              <p className={styles.releaseInfo}>{season.episodes.length} Episodes</p>
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

        <div className={styles.episodeList}>
          {season.episodes.map((ep, index) => (
            <div key={index} className={styles.episodeCard}>
              <img className={styles.episodeCover} src={season.image} alt="" />

              <div className={styles.episodeInfo}>
                <p className={styles.episodeTitle}>
                  Episode {index + 1}: {ep.title}
                </p>
                <p className={styles.episodeDesc}>{ep.description}</p>
              </div>

              {/* ▶ Inline play button */}
              <button className={styles.playButton} onClick={() => handlePlayEpisode(ep, index)}>
                ▶
              </button>

              {/* ❤️ Favourite toggle button */}
              <button
                className={styles.favouriteButton}
                onClick={() => handleToggleFavourite(ep, index)}
                aria-label={isFavourited(ep) ? "Unfavourite episode" : "Favourite episode"}
              >
                {isFavourited(ep) ? "❤️" : "🤍"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


