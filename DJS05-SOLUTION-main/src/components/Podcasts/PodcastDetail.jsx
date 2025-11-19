.container {
  width: min(1100px, 90%);
  margin: 20px auto;
  color: var(--text);
}

.backButton {
  margin-bottom: 20px;
  padding: 6px 12px;
  background: var(--control-bg);
  border: 1px solid var(--muted-border);
  color: var(--text);
  border-radius: 6px;
  cursor: pointer;
}

.backButton:hover {
  background: var(--surface);
}

.header {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
}

.cover {
  width: 200px;
  height: 200px;
  border-radius: 12px;
  object-fit: cover;
}

.title {
  font-size: 2rem;
  margin-bottom: 10px;
}

.description {
  opacity: 0.85;
}

.metaInfo {
  margin-top: 20px;
}

.seasonInfo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.seasonDetails {
  margin-top: 30px;
}

.seasonIntro {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.left {
  display: flex;
  gap: 15px;
}

.seasonCover {
  width: 120px;
  height: 120px;
  border-radius: 10px;
}

.dropdown {
  padding: 8px;
  border-radius: 8px;
  font-size: 1rem;
  background: var(--control-bg);
  border: 1px solid var(--muted-border);
  color: var(--text);
}

.episodeList {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.episodeCard {
  display: flex;
  align-items: center;
  gap: 15px;
  background: var(--card-bg);
  padding: 14px;
  border-radius: 10px;
  border: 1px solid var(--muted-border);
  box-shadow: 0 2px 6px var(--shadow);
}

.episodeCover {
  width: 90px;
  height: 90px;
  border-radius: 8px;
}

.episodeInfo {
  flex-grow: 1;
}

.episodeTitle {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--text);
}

.episodeDesc {
  opacity: 0.8;
  margin-top: 4px;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.favouriteButton,
.playButton {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.6rem;
  color: var(--text);
}

.favouriteButton:hover,
.playButton:hover {
  transform: scale(1.2);
}

