// src/utils/progressStorage.js
export function makeProgressKey(podcastId, seasonIndex, episodeIndex) {
  return `listen-progress:${podcastId}-${seasonIndex}-${episodeIndex}`;
}

export function makeStatusKey(podcastId, seasonIndex, episodeIndex) {
  return `listen-status:${podcastId}-${seasonIndex}-${episodeIndex}`;
}

export function saveProgress(podcastId, seasonIndex, episodeIndex, currentTime, duration) {
  try {
    const key = makeProgressKey(podcastId, seasonIndex, episodeIndex);
    const payload = { currentTime, duration, lastUpdated: Date.now() };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (err) {
    console.error("saveProgress error:", err);
  }
}

export function loadProgress(podcastId, seasonIndex, episodeIndex) {
  try {
    const key = makeProgressKey(podcastId, seasonIndex, episodeIndex);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error("loadProgress error:", err);
    return null;
  }
}

export function markFinished(podcastId, seasonIndex, episodeIndex) {
  try {
    const key = makeStatusKey(podcastId, seasonIndex, episodeIndex);
    localStorage.setItem(key, JSON.stringify({ status: "finished", at: Date.now() }));

    // also set progress to duration if a progress entry exists
    const pKey = makeProgressKey(podcastId, seasonIndex, episodeIndex);
    const current = localStorage.getItem(pKey);
    if (current) {
      const parsed = JSON.parse(current);
      parsed.currentTime = parsed.duration || parsed.currentTime;
      parsed.lastUpdated = Date.now();
      localStorage.setItem(pKey, JSON.stringify(parsed));
    }
  } catch (err) {
    console.error("markFinished error:", err);
  }
}

export function getStatus(podcastId, seasonIndex, episodeIndex) {
  try {
    const key = makeStatusKey(podcastId, seasonIndex, episodeIndex);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error("getStatus error:", err);
    return null;
  }
}

export function resetAllProgress() {
  try {
    const keys = Object.keys(localStorage);
    for (const k of keys) {
      if (k.startsWith("listen-progress:") || k.startsWith("listen-status:")) {
        localStorage.removeItem(k);
      }
    }
  } catch (err) {
    console.error("resetAllProgress error:", err);
  }
}
