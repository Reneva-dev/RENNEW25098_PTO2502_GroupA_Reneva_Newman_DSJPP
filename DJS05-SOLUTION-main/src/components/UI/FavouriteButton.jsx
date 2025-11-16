import { useFavourites } from "../../context/FavouritesContext";
import styles from "./FavouriteButton.module.css";

export default function FavouriteButton({ episode, showTitle, seasonNumber }) {
  const { addFavourite, removeFavourite, isFavourited } = useFavourites();

  const favData = {
    id: episode.guid || episode.id,         // unique episode ID
    title: episode.title,
    showTitle,
    seasonNumber,
    description: episode.description,
    audioUrl: episode.file,
    addedAt: Date.now(),
  };

  const isFav = isFavourited(favData.id);

  const toggleFavourite = () => {
    if (isFav) removeFavourite(favData.id);
    else addFavourite(favData);
  };

  return (
    <button
      className={`${styles.heartBtn} ${isFav ? styles.filled : ""}`}
      onClick={toggleFavourite}
      aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
    >
      {isFav ? "❤️" : "🤍"}
    </button>
  );
}
