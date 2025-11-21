// src/context/AudioPlayerContext.jsx

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  saveProgress,
  loadProgress,
  markFinished,
  resetAllProgress as resetProgressStorage,
} from "../utils/progressStorage";

/**
 * @typedef {Object} EpisodeMeta
 * @property {string|null} podcastId
 * @property {number|null} seasonIndex
 * @property {number|null} episodeIndex
 * @property {string} [title]
 * @property {string} [audioUrl]
 */

const AudioPlayerContext = createContext(null);

/**
 * Provides global audio playback control, persistent listening progress,
 * resume functionality, and completion tracking for all episodes.
 *
 * Stores progress in localStorage using helper utilities found in
 * `progressStorage.js`.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export const AudioPlayerProvider = ({ children }) => {
  /** @type {React.MutableRefObject<HTMLAudioElement>} */
  const audioRef = useRef(new Audio());

  const [audioSrc, setAudioSrc] = useState(null);
  const [title, setTitle] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  /** @type {React.MutableRefObject<EpisodeMeta>} */
  const currentMeta = useRef({
    podcastId: null,
    seasonIndex: null,
    episodeIndex: null,
  });

  // ---------------------------------------------------------------------
  // Event Listeners
  // ---------------------------------------------------------------------

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    /** Handle time updates & save progress */
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);

      const { podcastId, seasonIndex, episodeIndex } = currentMeta.current;

      if (podcastId != null && seasonIndex != null && episodeIndex != null) {
        saveProgress(
          podcastId,
          seasonIndex,
          episodeIndex,
          audio.currentTime,
          audio.duration || duration
        );
      }
    };

    /** Metadata available (duration, etc.) */
    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    /** When an episode finishes, mark completed */
    const handleEnded = () => {
      setIsPlaying(false);

      const { podcastId, seasonIndex, episodeIndex } = currentMeta.current;

      if (podcastId != null && seasonIndex != null && episodeIndex != null) {
        markFinished(podcastId, seasonIndex, episodeIndex);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [duration]);

  // ---------------------------------------------------------------------
  // Load Audio
  // ---------------------------------------------------------------------

  /**
   * Load an episode into the audio element. Can resume from a saved timestamp.
   *
   * @param {string} src - The episode's audio URL.
   * @param {EpisodeMeta} meta - Identifying metadata used to save progress.
   * @param {number} [startAt=0] - Optional resume position in seconds.
   */
  const loadAudio = useCallback((src, meta = {}, startAt = 0) => {
    const audio = audioRef.current;
    if (!src) return;

    // Load new file if changed
    if (audio.src !== src) {
      audio.src = src;
      audio.load();
    }

    if (meta.title) setTitle(meta.title);
    setAudioSrc(src);

    // Store identifiers for progress saving
    currentMeta.current = {
      podcastId: meta.podcastId ?? null,
      seasonIndex:
        typeof meta.seasonIndex === "number" ? meta.seasonIndex : null,
      episodeIndex:
        typeof meta.episodeIndex === "number" ? meta.episodeIndex : null,
    };

    // Resume where you left off
    if (startAt > 0) {
      const audioEl = audioRef.current;

      const trySeek = () => {
        const safeTime =
          startAt <= audioEl.duration ? startAt : audioEl.duration;
        audioEl.currentTime = safeTime;
      };

      if (audioEl.readyState >= 1) trySeek();
      else {
        const once = () => {
          trySeek();
          audioEl.removeEventListener("loadedmetadata", once);
        };
        audioEl.addEventListener("loadedmetadata", once);
      }
    }
  }, []);

  // ---------------------------------------------------------------------
  // Basic Controls
  // ---------------------------------------------------------------------

  /**
   * Start playback.
   */
  const play = useCallback(async () => {
    try {
      await audioRef.current.play();
    } catch (err) {
      console.warn("Audio play blocked:", err);
    }
  }, []);

  /**
   * Pause playback.
   */
  const pause = useCallback(() => {
    audioRef.current.pause();
  }, []);

  /**
   * Toggle between play/pause.
   */
  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, pause, play]);

  /**
   * Seek to a specific time.
   * @param {number} time - Seconds to skip to
   */
  const seek = useCallback((time) => {
    const audio = audioRef.current;

    if (!audio.duration && time > 0) {
      audio.currentTime = time;
      setCurrentTime(time);
      return;
    }

    audio.currentTime = Math.min(
      Math.max(0, Number(time)),
      audio.duration || time
    );

    setCurrentTime(audio.currentTime);
  }, []);

  /**
   * Adjust playback volume.
   * @param {number} v - Number between 0 and 1.
   */
  const setVolume = useCallback((v) => {
    const volume = Math.max(0, Math.min(1, v));
    audioRef.current.volume = volume;
  }, []);

  // ---------------------------------------------------------------------
  // Progress Utilities
  // ---------------------------------------------------------------------

  /**
   * Retrieves saved listening progress for an episode.
   *
   * @param {string} podcastId
   * @param {number} seasonIndex
   * @param {number} episodeIndex
   * @returns {Object|null} progress object
   */
  const getEpisodeProgress = useCallback(
    (podcastId, seasonIndex, episodeIndex) => {
      try {
        return loadProgress(podcastId, seasonIndex, episodeIndex);
      } catch {
        return null;
      }
    },
    []
  );

  /**
   * Clears all saved listening data from localStorage.
   */
  const resetAllProgress = useCallback(() => {
    resetProgressStorage();
  }, []);

  // ---------------------------------------------------------------------
  // Context Value
  // ---------------------------------------------------------------------

  const value = {
    audioRef,
    audioSrc,
    title,
    isPlaying,
    currentTime,
    duration,
    loadAudio,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    getEpisodeProgress,
    resetAllProgress,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

/**
 * Hook to access the AudioPlayer context.
 * @returns {ReturnType<typeof AudioPlayerProvider>}
 */
export const useAudioPlayer = () => {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx)
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  return ctx;
};

