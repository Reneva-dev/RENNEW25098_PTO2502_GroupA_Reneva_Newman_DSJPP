import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "./ToastContext";

const FavouritesContext = createContext();

export function FavouritesProvider({ children }) {
  console.log("%c[FAVOURITES] Provider mounted", "color: orange; font-weight: bold;");

  const [favourites, setFavourites] = useState([]);
  const { showToast } = useToast();

  // -----------------------------
  // 1️⃣ RESTORE SAVED FAVOURITES
  // -----------------------------
  useEffect(() => {
    console.log("%c[FAVOURITES] useEffect(restore) running...", "color: yellow");

    try {
      const raw = localStorage.getItem("favourites");
      console.log("[FAVOURITES] Raw localStorage:", raw);

      const saved = JSON.parse(raw || "[]");
      console.log("[FAVOURITES] Parsed favourites:", saved);

      if (Array.isArray(saved)) {
        setFavourites(saved);
        console.log("%c[FAVOURITES] Restored favourites into state", "color: lightgreen");
      } else {
        console.warn("[FAVOURITES] Saved data was not an array — resetting.");
        setFavourites([]);
      }
    } catch (err) {
      console.error("[FAVOURITES] Failed to parse localStorage:", err);
      setFavourites([]);
    }
  }, []);

  // -----------------------------
  // 2️⃣ SAVE FAVOURITES TO LOCAL STORAGE
  // -----------------------------
  useEffect(() => {
    console.log("%c[FAVOURITES] useEffect(save) triggered", "color: cyan");
    console.log("[FAVOURITES] Saving to localStorage:", favourites);

    try {
      localStorage.setItem("favourites", JSON.stringify(favourites));
      console.log("%c[FAVOURITES] Successfully saved", "color: lightgreen");
    } catch (err) {
      console.error("[FAVOURITES] Failed to save:", err);
    }
  }, [favourites]);

  // -----------------------------
  // ID HELPER
  // -----------------------------
  const makeId = (podcastId, seasonIndex, episodeIndex) => {
    const id = `${podcastId}-${seasonIndex}-${episodeIndex}`;
    console.log("[FAVOURITES] makeId →", id);
    return id;
  };

  // -----------------------------
  // CHECK IF EPISODE IS FAVOURITED
  // -----------------------------
  const isFavourited = (podcastId, seasonIndex, episodeIndex) => {
    const id = makeId(podcastId, seasonIndex, episodeIndex);
    const exists = favourites.some((fav) => fav.id === id);
    console.log(`[FAVOURITES] isFavourited(${id}) →`, exists);
    return exists;
  };

  // -----------------------------
  // TOGGLE FAVOURITE
  // -----------------------------
  const toggleFavourite = (episode) => {
    console.log("%c[FAVOURITES] toggleFavourite called", "color: violet; font-weight: bold;");
    console.log("[FAVOURITES] Episode received:", episode);

    const id = makeId(episode.podcastId, episode.seasonIndex, episode.episodeIndex);

    const exists = favourites.some((f) => f.id === id);

    if (exists) {
      console.log("[FAVOURITES] Episode exists — removing");
      const updated = favourites.filter((f) => f.id !== id);
      console.log("[FAVOURITES] After removal:", updated);

      setFavourites(updated);

      showToast(
        `Removed "${episode.episodeTitle}"`,
        "error",
        () => {
          console.log("[FAVOURITES] Undo removal — restoring");
          setFavourites([...favourites, { ...episode, id }]);
        }
      );

      return;
    }

    // ADD NEW
    const newFav = {
      ...episode,
      id,
      addedAt: Date.now(),
    };

    console.log("[FAVOURITES] Adding new favourite:", newFav);
    setFavourites([...favourites, newFav]);

    showToast(
      `Added "${episode.episodeTitle}" ❤️`,
      "success",
      () => {
        console.log("[FAVOURITES] Undo add — removing");
        setFavourites(favourites.filter((f) => f.id !== id));
      }
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
