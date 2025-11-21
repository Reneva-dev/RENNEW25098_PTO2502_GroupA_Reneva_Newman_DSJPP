// src/context/FavouritesContext.jsx

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useToast } from "./ToastContext";

/**
 * @typedef FavouriteEpisode
 * @property {string} podcastId
 * @property {string} podcastTitle
 * @property {number} seasonIndex
 * @property {number} seasonNumber
 * @property {number} episodeIndex
 * @property {string} episodeTitle
 * @property {string} image
 * @property {string} id - Unique composite ID (podcast-season-episode)
 * @property {number} addedAt - Timestamp
 */

/**
 * React Context storing all favourited episodes
 * and helper functions for adding/removing episodes.
 */
const FavouritesContext = createContext(null);

/**
 * Provides favourite episode state to the entire app,
 * including:
 * - Persistent saving in localStorage
 * - Unique ID system
 * - Toast notifications
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
export function FavouritesProvider({ children }) {
  /** @type {[FavouriteEpisode[], Function]} */
  const [favourites, setFavourites] = useState([]);

  const { showToast } = useToast();

  /**
   * Tracks whether the initial hydration from localStorage
   * has completed. Prevents React StrictMode double-render
   * from clearing data.
   *
   * @type {React.MutableRefObject<boolean>}
   */
  const hydrated = useRef(false);

  // ---------------------------------------------------------------------------
  // Restore from localStorage (runs once)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("favourites") || "[]");

    setFavourites(saved);

    // Mark as hydrated AFTER favourites are restored
    hydrated.current = true;
  }, []);

  // ---------------------------------------------------------------------------
  // Save to localStorage (but ONLY after hydrate)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!hydrated.current) return; // ⛔ Prevents wiping data on React's first render

    localStorage.setItem("favourites", JSON.stringify(favourites));
  }, [favourites]);

  // ---------------------------------------------------------------------------
  // Utilities
  // ---------------------------------------------------------------------------

  /**
   * Creates a consistent unique ID for an episode.
   *
   * @param {string} podcastId
   * @param {number} seasonIndex
   * @param {number} episodeIndex
   * @returns {string}
   */
  const makeId = (podcastId, seasonIndex, episodeIndex) =>
    `${podcastId}-${seasonIndex}-${episodeIndex}`;

  /**
   * Checks if an episode is already favourited.
   *
   * @param {string} podcastId
   * @param {number} seasonIndex
   * @param {number} episodeIndex
   * @returns {boolean}
   */
  const isFavourited = (podcastId, seasonIndex, episodeIndex) => {
    const id = makeId(podcastId, seasonIndex, episodeIndex);
    return favourites.some((fav) => fav.id === id);
  };

  /**
   * Adds or removes a favourite episode.
   *
   * @param {Omit<FavouriteEpisode, "id" | "addedAt">} episode
   */
  const toggleFavourite = (episode) => {
    const id = makeId(
      episode.podcastId,
      episode.seasonIndex,
      episode.episodeIndex
    );

    const exists = favourites.some((f) => f.id === id);

    // Remove if exists
    if (exists) {
      const updated = favourites.filter((f) => f.id !== id);
      setFavourites(updated);

      showToast(`Removed "${episode.episodeTitle}"`, "error");
      return;
    }

    // Add new favourite
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

/**
 * React hook for accessing the favourites context.
 *
 * @returns {{
 *   favourites: FavouriteEpisode[],
 *   toggleFavourite: Function,
 *   isFavourited: Function
 * }}
 */
export function useFavourites() {
  return useContext(FavouritesContext);
}


