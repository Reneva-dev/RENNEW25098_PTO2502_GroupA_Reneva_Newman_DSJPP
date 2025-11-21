import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "./ToastContext";

const FavouritesContext = createContext();

export function FavouritesProvider({ children }) {
  const [favourites, setFavourites] = useState([]);
  const { showToast } = useToast();

  // Load favourites from localStorage on startup
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("favourites") || "[]");
      if (Array.isArray(saved)) {
        setFavourites(saved);
      }
    } catch (err) {
      console.error("Failed to load favourites:", err);
    }
  }, []);

  // Save favourites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("favourites", JSON.stringify(favourites));
  }, [favourites]);

  // Generate a unique ID for each favourited episode
  const makeId = (podcastId, seasonIndex, episodeIndex) =>
    `${podcastId}-${seasonIndex}-${episodeIndex}`;

  // Check if a given episode is already favourited
  const isFavourited = (podcastId, seasonIndex, episodeIndex) => {
    const id = makeId(podcastId, seasonIndex, episodeIndex);
    return favourites.some((fav) => fav.id === id);
  };

  // Toggle favourite status
  const toggleFavourite = (episodeData) => {
    const id = makeId(
      episodeData.podcastId,
      episodeData.seasonIndex,
      episodeData.episodeIndex
    );

    const isAlreadyFav = favourites.some((f) => f.id === id);

    if (isAlreadyFav) {
      // Remove from favourites
      const updated = favourites.filter((f) => f.id !== id);
      setFavourites(updated);

      showToast(
        `Removed "${episodeData.episodeTitle}"`,
        "error",
        () => setFavourites([...updated, { ...episodeData, id }]) // Undo
      );

      return;
    }

    // Add to favourites (with generated ID)
    const newFav = {
      ...episodeData,
      id,
      addedAt: Date.now(),
    };

    const updated = [...favourites, newFav];
    setFavourites(updated);

    showToast(
      `Added "${episodeData.episodeTitle}" ❤️`,
      "success",
      () => setFavourites(favourites) // Undo
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
