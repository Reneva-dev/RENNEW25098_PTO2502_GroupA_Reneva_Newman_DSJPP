import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useToast } from "./ToastContext";

const FavouritesContext = createContext();

export function FavouritesProvider({ children }) {
  const [favourites, setFavourites] = useState([]);
  const { showToast } = useToast();

  // NEW: Prevent save from running before initial restore is done
  const hydrated = useRef(false);

  // Restore from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("favourites") || "[]");
    setFavourites(saved);

    // Mark hydration complete AFTER state is updated
    hydrated.current = true;
  }, []);

  // Save ONLY after hydration is complete
  useEffect(() => {
    if (!hydrated.current) return; // ⛔ Skip first StrictMode save

    localStorage.setItem("favourites", JSON.stringify(favourites));
  }, [favourites]);

  // SINGLE consistent ID
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

      showToast(`Removed "${episode.episodeTitle}"`, "error");
      return;
    }

    const newFav = {
      ...episode,
      id,
      addedAt: Date.now(),
    };

    setFavourites([...favourites, newFav]);
    showToast(`Added "${episode.episodeTitle}" ❤️`, "success");
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

