// src/components/Recommended/RecommendedCarousel.jsx
import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./RecommendedCarousel.module.css";
import GenreTags from "../UI/GenreTags";

export default function RecommendedCarousel({ podcasts }) {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  // Random 10 podcasts — memoised so it doesn’t change during render
  const randomSelection = useMemo(() => {
    if (!podcasts || podcasts.length === 0) return [];

    // Shuffle + return first 10
    const shuffled = [...podcasts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
  }, [podcasts]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -250, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 250, behavior: "smooth" });
    }
  };

  const openShow = (id, genres) => {
    navigate(`/show/${id}`, { state: { genres } });
  };

  if (randomSelection.length === 0) return null;

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Recommended Shows For You</h2>

      <div className={styles.carouselContainer}>
        <button className={styles.arrowLeft} onClick={scrollLeft}>
          ‹
        </button>

        <div className={styles.carousel} ref={scrollRef}>
          {randomSelection.map((show) => (
            <div
              key={show.id}
              className={styles.card}
              onClick={() => openShow(show.id, show.genres)}
            >
              <img src={show.image} alt={show.title} className={styles.cover} />
              <h3 className={styles.title}>{show.title}</h3>
              <GenreTags genres={show.genres} />
            </div>
          ))}
        </div>

        <button className={styles.arrowRight} onClick={scrollRight}>
          ›
        </button>
      </div>
    </div>
  );
}
