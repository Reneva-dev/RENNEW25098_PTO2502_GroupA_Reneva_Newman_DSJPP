import { formatDate } from "../../utils/formatDate";
import { useNavigate } from "react-router-dom";
import styles from "./PodcastCard.module.css";
import GenreTags from "../UI/GenreTags";
import { useAudioPlayer } from "../../context/AudioPlayerContext"; // <-- added

/**
 * Renders a single podcast preview card with image, title, number of seasons,
 * genres (as styled tags), and the last updated date.
 */
export default function PodcastCard({ podcast }) {
  const navigate = useNavigate();
  const { loadAudio, play } = useAudioPlayer(); // <-- added

  const handleNavigate = () => {
    navigate(`/show/${podcast.id}`, { state: { genres: podcast.genres } });
  };

  const handlePlayPreview = (e) => {
    e.stopPropagation(); // prevent triggering navigation
    if (!podcast.audioPreviewUrl) {
      console.warn("No preview audio found on podcast:", podcast);
      return;
    }

    loadAudio(podcast.audioPreviewUrl, { title: podcast.title });
    play();
  };

  return (
    <div className={styles.card} onClick={handleNavigate}>
      <img src={podcast.image} alt={podcast.title} />

      <h3>{podcast.title}</h3>
      <p className={styles.seasons}>{podcast.seasons} seasons</p>

      <GenreTags genres={podcast.genres} />

      <p className={styles.updatedText}>
        Updated {formatDate(podcast.updated)}
      </p>

      {/* 🔊 Preview Play Button */}
      {podcast.audioPreviewUrl && (
        <button
          className={styles.previewButton}
          onClick={handlePlayPreview}
        >
          ▶ Preview
        </button>
      )}
    </div>
  );
}
