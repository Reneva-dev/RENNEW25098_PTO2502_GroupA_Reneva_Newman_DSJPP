import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "./ToastContext";

const FavouritesContext = createContext();

export function FavouritesProvider({ children }) {
  const [favourites, setFavourites] = useState([]);
  const { showToast } = useToast();

  // Load from localStorage (runs once)
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("favourites") || "[]");
      if (Array.isArray(saved)) {
        setFavourites(saved);
      }
    } catch {
      console.error("Failed to parse favourites from localStorage");
    }
  }, []);

  // Save to localStorage whenever favourites change
  useEffect(() => {
    localStorage.setItem("favourites", JSON.stringify(favourites));
  }, [favourites]);

  // Generate a consistent ID
  const makeId = (podcastId, seasonIndex, episodeIndex) =>
    `${podcastId}-${seasonIndex}-${episodeIndex}`;

  // Check if an episode is already favourited
  const isFavourited = (podcastId, seasonIndex, episodeIndex) => {
    const id = makeId(podcastId, seasonIndex, episodeIndex);
    return favourites.some((fav) => fav.id === id);
  };

  // Toggle favourite status
  const toggleFavourite = (episode) => {
    const id = makeId(
      episode.podcastId,
      episode.seasonIndex,
      episode.episodeIndex
    );

    const exists = favourites.some((f) => f.id === id);

    if (exists) {
      // Remove favourite
      setFavourites((prev) => prev.filter((f) => f.id !== id));

      // Undo uses functional set to avoid stale state
      showToast(
        `Removed "${episode.episodeTitle}"`,
        "error",
        () =>
          setFavourites((prev) => [
            ...prev,
            { ...episode, id, addedAt: Date.now() },
          ])
      );

      return;
    }

    // Build new favourite
    const newFav = {
      ...episode,
      id,
      addedAt: Date.now(),
    };

    // Add favourite
    setFavourites((prev) => [...prev, newFav]);

    // Undo uses functional set
    showToast(
      `Added "${episode.episodeTitle}" ❤️`,
      "success",
      () => setFavourites((prev) => prev.filter((f) => f.id !== id))
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
