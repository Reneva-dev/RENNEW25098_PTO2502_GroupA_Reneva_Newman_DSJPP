// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Header from "./components/UI/Header";
import Home from "./pages/Home";
import ShowDetail from "./pages/ShowDetail";

import { ThemeProvider } from "./context/ThemeContext";
import { PodcastProvider } from "./context/PodcastContext";
import { AudioPlayerProvider } from "./context/AudioPlayerContext";
import { FavouritesProvider } from "./context/FavouritesContext";
import { ToastProvider } from "./context/ToastContext";

import AudioPlayer from "./components/UI/AudioPlayer";
import FavouritesPage from "./pages/FavouritesPage";
import Toast from "./components/UI/Toast";

export default function App() {
  return (
    <>
      <ThemeProvider>
        <ToastProvider>
          <FavouritesProvider>
            <AudioPlayerProvider>
              <PodcastProvider>

                {/* Header MUST be inside ThemeProvider */}
                <Header />

                <div style={{ paddingBottom: "90px" }}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/show/:id" element={<ShowDetail />} />
                    <Route path="/favourites" element={<FavouritesPage />} />
                  </Routes>
                </div>

                <AudioPlayer />
                <Toast />

              </PodcastProvider>
            </AudioPlayerProvider>
          </FavouritesProvider>
        </ToastProvider>
      </ThemeProvider>
    </>
  );
}

