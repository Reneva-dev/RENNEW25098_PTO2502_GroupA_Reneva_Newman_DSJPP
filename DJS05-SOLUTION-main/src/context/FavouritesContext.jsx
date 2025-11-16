import { createContext, useContext, useEffect, useState } from "react";

const FavouritesContext = createContext();

export function FavouritesProvider({ children }) {
  const [favourites, setFavourites] = useState([]);

  // Load from localStorage once
  useEffect(() => {
    const stored = localStorage.getItem("favourites");
    if (stored) {
      setFavourites(JSON.parse(stored));
    }
  }, []);

  // Save whenever favourites change
  useEffect(() => {
    localStorage.setItem("favourites", JSON.stringify(favourites));
  }, [favourites]);

  // Generate a unique ID for each episode
  const makeId = (podcastId, seasonIndex, episodeIndex) => {
    return `${podcastId}-${seasonIndex}-${episodeIndex}`;
  };

  // Check if a given episode is already favourited
  const isFavourited = (podcastId, seasonIndex, episodeIndex) => {
    const id = makeId(podcastId, seasonIndex, episodeIndex);
    return favourites.some((fav) => fav.id === id);
  };

  // Add a favourite
  const addFavourite = (data) => {
    const id = makeId(data.podcastId, data.seasonIndex, data.episodeIndex);

    // Prevent duplicates
    if (favourites.some((f) => f.id === id)) return;

    const newFav = {
      ...data,
      id,
      addedAt: Date.now(),
    };

    setFavourites((prev) => [...prev, newFav]);
  };

  // Remove a favourite
  const removeFavourite = (podcastId, seasonIndex, episodeIndex) => {
    const id = makeId(podcastId, seasonIndex, episodeIndex);
    setFavourites((prev) => prev.filter((f) => f.id !== id));
  };

  // Toggle favourite
  const toggleFavourite = (data) => {
    const { podcastId, seasonIndex, episodeIndex } = data;

    if (isFavourited(podcastId, seasonIndex, episodeIndex)) {
      removeFavourite(podcastId, seasonIndex, episodeIndex);
    } else {
      addFavourite(data);
    }
  };

  const value = {
    favourites,
    addFavourite,
    removeFavourite,
    isFavourited,
    toggleFavourite,
  };

  return (
    <FavouritesContext.Provider value={value}>
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  return useContext(FavouritesContext);
}
