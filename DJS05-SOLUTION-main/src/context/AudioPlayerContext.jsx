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

const AudioPlayerContext = createContext(null);

export const AudioPlayerProvider = ({ children }) => {
  const audioRef = useRef(new Audio());
  const [audioSrc, setAudioSrc] = useState(null);
  const [title, setTitle] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  // meta identifiers for the currently loaded episode
  const currentMeta = useRef({ podcastId: null, seasonIndex: null, episodeIndex: null });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      const { podcastId, seasonIndex, episodeIndex } = currentMeta.current;
      if (podcastId != null && seasonIndex != null && episodeIndex != null) {
        // Save progress (avoid heavy throttling for now — fine for small apps)
        saveProgress(podcastId, seasonIndex, episodeIndex, audio.currentTime, audio.duration || duration);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
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

  // Load audio src and meta; optionally start at `startAt` seconds
  const loadAudio = useCallback((src, meta = {}, startAt = 0) => {
    const audio = audioRef.current;
    if (!src) return;
    // Only reset src if different (keeps currentTime if same source)
    if (audio.src !== src) {
      audio.src = src;
      audio.load();
    }
    if (meta.title) setTitle(meta.title);
    setAudioSrc(src);

    currentMeta.current = {
      podcastId: meta.podcastId ?? null,
      seasonIndex: typeof meta.seasonIndex === "number" ? meta.seasonIndex : null,
      episodeIndex: typeof meta.episodeIndex === "number" ? meta.episodeIndex : null,
    };

    if (startAt > 0) {
      const audioEl = audioRef.current;
      const trySeek = () => {
        try {
          audioEl.currentTime = Math.min(startAt, audioEl.duration || startAt);
        } catch {}
      };
      if (audioEl.readyState >= 1) {
        trySeek();
      } else {
        const once = () => {
          trySeek();
          audioEl.removeEventListener("loadedmetadata", once);
        };
        audioEl.addEventListener("loadedmetadata", once);
      }
    }
  }, []);

  // Convenience: load and play an episode; accepts meta and optional startAt
  const playEpisode = useCallback(
    async ({ audioUrl, title: epTitle, podcastId, seasonIndex, episodeIndex, startAt = 0 }) => {
      const meta = {
        title: epTitle,
        podcastId,
        seasonIndex,
        episodeIndex,
      };
      loadAudio(audioUrl, meta, startAt);
      try {
        await audioRef.current.play();
      } catch (err) {
        console.warn("Audio play blocked:", err);
      }
    },
    [loadAudio]
  );

  const play = useCallback(async () => {
    try {
      await audioRef.current.play();
    } catch (err) {
      console.warn("Audio play blocked:", err);
    }
  }, []);

  const pause = useCallback(() => audioRef.current.pause(), []);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, pause, play]);

  const seek = useCallback((time) => {
    const audio = audioRef.current;
    try {
      audio.currentTime = Math.min(Math.max(0, Number(time)), audio.duration || time);
      setCurrentTime(audio.currentTime);
    } catch (err) {
      // ignore if seeking fails (metadata not loaded)
      setCurrentTime(Number(time));
    }
  }, []);

  const setVolume = useCallback((v) => {
    audioRef.current.volume = Math.max(0, Math.min(1, v));
  }, []);

  const getEpisodeProgress = useCallback((podcastId, seasonIndex, episodeIndex) => {
    try {
      return loadProgress(podcastId, seasonIndex, episodeIndex);
    } catch {
      return null;
    }
  }, []);

  const resetAllProgress = useCallback(() => {
    resetProgressStorage();
  }, []);

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
    playEpisode, // <-- convenience wrapper for callers that expect it
  };

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
};

export const useAudioPlayer = () => {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  return ctx;
};


