// src/components/UI/AudioPlayer.jsx
import React, { useEffect, useState } from "react";
import { useAudioPlayer } from "../../context/AudioPlayerContext";
import styles from "./AudioPlayer.module.css";

function formatTime(sec = 0) {
  if (!isFinite(sec)) return "0:00";
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  const m = Math.floor(sec / 60).toString();
  return `${m}:${s}`;
}

export default function AudioPlayer() {
  const {
    audioSrc,
    title,
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    togglePlay,
    seek,
  } = useAudioPlayer();

  const [seekValue, setSeekValue] = useState(0);

  // sync local seekValue with context currentTime
  useEffect(() => {
    setSeekValue(currentTime);
  }, [currentTime]);

  const onSeekChange = (e) => {
    const val = Number(e.target.value);
    setSeekValue(val);
  };

  const onSeekCommit = (e) => {
    const val = Number(e.target.value);
    seek(val);
  };

  if (!audioSrc) {
    // Optionally render a small bar prompting to play something
    return null;
  }

  return (
    <div className={styles.player} aria-hidden={false}>
      <div className={styles.content}>
        <div className={styles.left}>
          <div className={styles.meta}>
            <div className={styles.title}>{title || "Playing"}</div>
            <div className={styles.source}>{audioSrc && audioSrc.split("/").pop()}</div>
          </div>
        </div>

        <div className={styles.center}>
          <button
            className={styles.playBtn}
            onClick={() => {
              togglePlay();
            }}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? "❚❚" : "►"}
          </button>

          <div className={styles.progress}>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step="0.1"
              value={seekValue}
              onChange={onSeekChange}
              onMouseUp={onSeekCommit}
              onTouchEnd={onSeekCommit}
              aria-label="Seek"
            />
            <div className={styles.time}>
              <span>{formatTime(seekValue)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        <div className={styles.right}>
          <button
            onClick={() => {
              // quick rewind 10s
              const target = Math.max(0, currentTime - 10);
              seek(target);
            }}
            className={styles.smallBtn}
            aria-label="Rewind 10 seconds"
          >
            «10s
          </button>

          <button
            onClick={() => {
              // quick forward 30s
              const target = Math.min(duration || 0, currentTime + 30);
              seek(target);
            }}
            className={styles.smallBtn}
            aria-label="Forward 30 seconds"
          >
            30s»
          </button>
        </div>
      </div>
    </div>
  );
}
