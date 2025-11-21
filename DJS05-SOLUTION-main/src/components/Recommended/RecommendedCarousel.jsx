// src/components/Recommended/RecommendedCarousel.jsx
import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./RecommendedCarousel.module.css";
import GenreTags from "../UI/GenreTags";

/**
 * A horizontally scrolling, infinite-loop recommended podcast carousel.
 *
 * Features:
 * - Randomized selection of 10 podcasts
 * - Cloned slides to create seamless infinite scrolling
 * - Auto-corrects scroll position when user reaches cloned boundaries
 * - Manual scroll arrows
 * - Clickable cards that navigate to podcast detail pages
 *
 * @param {Object} props
 * @param {Array<Object>} props.podcasts - Full list of available podcasts
 */

export default function RecommendedCarousel({ podcasts }) {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  // Random 10 podcasts — memoized
  const randomSelection = useMemo(() => {
    if (!podcasts || podcasts.length === 0) return [];
    const shuffled = [...podcasts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
  }, [podcasts]);

  // Clone slides for infinite loop
  const loopedSlides = useMemo(() => {
    return [...randomSelection, ...randomSelection];  
  }, [randomSelection]);

  // Jump back to center when reaching edges
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const cardWidth = 250;  // must match your scroll amount
    const totalWidth = cardWidth * loopedSlides.length;

    // Start in the *middle* of the cloned list
    container.scrollLeft = (totalWidth / 2) - container.clientWidth / 2;

    const handleScroll = () => {
      const maxScroll = totalWidth - container.clientWidth;

      // If user scrolls to the LEFT cloned area
      if (container.scrollLeft < cardWidth) {
        container.style.scrollBehavior = "auto";
        container.scrollLeft =
          (totalWidth / 2) + container.scrollLeft;
        container.style.scrollBehavior = "smooth";
      }

      // If user scrolls to the RIGHT cloned area
      if (container.scrollLeft > maxScroll - cardWidth) {
        container.style.scrollBehavior = "auto";
        container.scrollLeft =
          (totalWidth / 2) - (maxScroll - container.scrollLeft);
        container.style.scrollBehavior = "smooth";
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [loopedSlides]);

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
        <button className={styles.arrowLeft} onClick={scrollLeft}>‹</button>

        <div className={styles.carousel} ref={scrollRef}>
          {loopedSlides.map((show, index) => (
            <div
              key={index + show.id}
              className={styles.card}
              onClick={() => openShow(show.id, show.genres)}
            >
              <img src={show.image} alt={show.title} className={styles.cover} />
              <h3 className={styles.title}>{show.title}</h3>
              <GenreTags genres={show.genres} />
            </div>
          ))}
        </div>

        <button className={styles.arrowRight} onClick={scrollRight}>›</button>
      </div>
    </div>
  );
}
