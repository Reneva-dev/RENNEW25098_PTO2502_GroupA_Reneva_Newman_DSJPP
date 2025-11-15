// src/context/AudioPlayerContext.jsx
import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from "react";

const AudioPlayerContext = createContext(null);

export const AudioPlayerProvider = ({ children }) => {
  const audioRef = useRef(new Audio());
  const [audioSrc, setAudioSrc] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState(null); // optional metadata
  const [pausedBecauseHidden, setPausedBecauseHidden] = useState(false);

  // Setup event listeners once
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

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
  }, []);

  // load audio source and metadata
  const loadAudio = useCallback((src, meta = {}) => {
    const audio = audioRef.current;
    if (!src) return;
    if (audio.src !== src) {
      audio.src = src;
      audio.load();
    }
    if (meta.title) setTitle(meta.title);
    setAudioSrc(src);
  }, []);

  const play = useCallback(async () => {
    try {
      await audioRef.current.play();
    } catch (err) {
      console.warn("Audio play blocked:", err);
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current.pause();
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, pause, play]);

  const seek = useCallback((time) => {
    const audio = audioRef.current;
    if (!audio.duration) return;
    audio.currentTime = Math.min(Math.max(0, Number(time)), audio.duration);
    setCurrentTime(audio.currentTime);
  }, []);

  const setVolume = useCallback((v) => {
    audioRef.current.volume = Math.max(0, Math.min(1, v));
  }, []);

  // NEW: Play episode helper to load and play an episode easily
  const playEpisode = useCallback(({ audioUrl, title: episodeTitle }) => {
    if (!audioUrl) return;
    loadAudio(audioUrl, { title: episodeTitle });
    play();
  }, [loadAudio, play]);

  // beforeunload confirmation when audio is playing
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isPlaying) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
      return undefined;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isPlaying]);

  // Optional: pause audio if tab hidden and resume on visible if was playing (safer UX)
  useEffect(() => {
    const handleVisibilityChange = () => {
      const audio = audioRef.current;
      if (document.hidden) {
        if (!audio.paused) {
          audio.pause();
          setPausedBecauseHidden(true);
        }
      } else {
        if (pausedBecauseHidden) {
          audio.play().catch(() => {});
          setPausedBecauseHidden(false);
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [pausedBecauseHidden]);

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
    playEpisode, // <-- new function exposed here
  };

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
};

// Hook to use the audio player context
export const useAudioPlayer = () => {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }
  return ctx;
};

