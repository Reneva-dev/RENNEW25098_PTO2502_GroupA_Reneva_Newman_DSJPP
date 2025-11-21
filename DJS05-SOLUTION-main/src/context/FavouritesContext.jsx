import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "./ToastContext";

const FavouritesContext = createContext();

export function FavouritesProvider({ children }) {
  const [favourites, setFavourites] = useState([]);
  const { showToast } = useToast();

  // Restore from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("favourites") || "[]");
    setFavourites(saved);
  }, []);

  // Save whenever favourites change
  useEffect(() => {
    localStorage.setItem("favourites", JSON.stringify(favourites));
  }, [favourites]);

  // SINGLE, CONSISTENT ID FORMAT
  const makeId = (podcastId, seasonIndex, episodeIndex) =>
    `${podcastId}-${seasonIndex}-${episodeIndex}`;

  // Check if favourited
  const isFavourited = (podcastId, seasonIndex, episodeIndex) => {
    const id = makeId(podcastId, seasonIndex, episodeIndex);
    return favourites.some((fav) => fav.id === id);
  };

  // Toggle favourite
  const toggleFavourite = (episode) => {
    const id = makeId(
      episode.podcastId,
      episode.seasonIndex,
      episode.episodeIndex
    );

    const exists = favourites.some((f) => f.id === id);

    if (exists) {
      const updated = favourites.filter((f) => f.id !== id);
      setFavourites(updated);

      showToast(
        `Removed "${episode.episodeTitle}"`,
        "error",
        () => setFavourites([...favourites, { ...episode, id }])
      );

      return;
    }

    const newFav = {
      ...episode,
      id,
      addedAt: Date.now(),
    };

    setFavourites([...favourites, newFav]);

    showToast(
      `Added "${episode.episodeTitle}" ❤️`,
      "success",
      () =>
        setFavourites(favourites.filter((f) => f.id !== id))
    );
  };

  return (
    <FavouritesContext.Provider
      value={{ favourites, toggleFavourite, isFavourited }}
    >
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  return useContext(FavouritesContext);
}
