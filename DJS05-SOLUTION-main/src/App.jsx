import { Routes, Route } from "react-router-dom";
import Header from "./components/UI/Header";
import Home from "./pages/Home";
import ShowDetail from "./pages/ShowDetail";
import { PodcastProvider } from "./context/PodcastContext";
import AudioPlayer from "./components/UI/AudioPlayer"; // <-- added import

/**
 * Root component of the Podcast Explorer app.
 *
 * - Wraps the application in the `PodcastProvider` context for global state.
 * - Includes the `Header` component, displayed on all pages.
 * - Defines client-side routes using React Router:
 *    - "/" renders the `Home` page
 *    - "/show/:id" renders the `ShowDetail` page for a specific podcast
 *
 * - Includes a persistent AudioPlayer fixed at the bottom of the screen.
 */
export default function App() {
  return (
    <>
      <Header />
      <PodcastProvider>
        {/* MAIN WRAPPER - adds bottom padding so the audio player doesn't overlap content */}
        <div style={{ paddingBottom: "90px" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/show/:id" element={<ShowDetail />} />
          </Routes>
        </div>

        {/* 🌟 Persistent Global Audio Player */}
        <AudioPlayer />
      </PodcastProvider>
    </>
  );
}

