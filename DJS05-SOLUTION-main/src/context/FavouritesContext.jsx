import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "./ToastContext";

const FavouritesContext = createContext();

export function FavouritesProvider({ children }) {
  const [favourites, setFavourites] = useState([]);
  const { showToast } = useToast();

  // Restore saved favourites
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("favourites") || "[]");
    setFavourites(saved);
  }, []);

  // Save on update
  useEffect(() => {
    localStorage.setItem("favourites", JSON.stringify(favourites));
  }, [favourites]);

  const makeId = (podcastId, seasonIndex, episodeIndex) =>
    `${podcastId}-${seasonIndex}-${episodeIndex}`;

  const isFavourited = (podcastId, seasonIndex, episodeIndex) => {
    const id = makeId(podcastId, seasonIndex, episodeIndex);
    return favourites.some((fav) => fav.id === id);
  };

  const toggleFavourite = (episode) => {
    const exists = favourites.some((f) => f.id === episode.id);

    if (exists) {
      setFavourites(favourites.filter((f) => f.id !== episode.id));

      showToast(
        `Removed "${episode.episodeTitle}"`,
        "error",
        () => setFavourites([...favourites, episode])
      );

      return;
    }

    setFavourites([...favourites, episode]);

    showToast(
      `Added "${episode.episodeTitle}" ❤️`,
      "success",
      () =>
        setFavourites(
          favourites.filter((f) => f.id !== episode.id)
        )
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
