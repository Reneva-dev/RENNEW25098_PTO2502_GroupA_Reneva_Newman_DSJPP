import { Routes, Route } from "react-router-dom";
import Header from "./components/UI/Header";
import Home from "./pages/Home";
import ShowDetail from "./pages/ShowDetail";

import { PodcastProvider } from "./context/PodcastContext";
import { AudioPlayerProvider } from "./context/AudioPlayerContext";
import { FavouritesProvider } from "./context/FavouritesContext"; // <-- NEW

import FavouritesPage from "./pages/FavouritesPage"; // <-- NEW IMPORT

import AudioPlayer from "./components/UI/AudioPlayer";

export default function App() {
  return (
    <>
      <Header />

      {/* Wrap entire app inside all providers */}
      <PodcastProvider>
        <AudioPlayerProvider>
          <FavouritesProvider>

            {/* MAIN WRAPPER - adds bottom padding so the audio player doesn't overlap content */}
            <div style={{ paddingBottom: "90px" }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/show/:id" element={<ShowDetail />} />
                <Route path="/favourites" element={<FavouritesPage />} /> {/* <-- NEW ROUTE */}
              </Routes>
            </div>

            {/* 🌟 Persistent Global Audio Player */}
            <AudioPlayer />

          </FavouritesProvider>
        </AudioPlayerProvider>
      </PodcastProvider>
    </>
  );
}
