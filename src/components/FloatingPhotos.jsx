import { useMemo } from "react";
import { ENDING_PHOTOS } from "../data/config.js";
import "../styles/floating-photos.css";

// 10 photos drifting through the night sky as memory fragments —
// varied position, size, speed, rotation, and loop timing.
export default function FloatingPhotos() {
  const items = useMemo(
    () =>
      ENDING_PHOTOS.map((src, i) => ({
        src,
        id: i,
        left: 6 + ((i * 9.7) % 88),
        size: 64 + ((i * 13) % 3) * 18,
        duration: 16 + (i % 5) * 4,
        delay: -(i * 3.4),
        drift: i % 2 === 0 ? 1 : -1,
        rotate: -8 + ((i * 7) % 16),
      })),
    []
  );

  return (
    <div className="floating-photos" aria-hidden="true">
      {items.map((p) => (
        <div
          className="floating-photos__item"
          key={p.id}
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            "--drift": p.drift,
            "--rotate": `${p.rotate}deg`,
          }}
        >
          <img src={p.src} alt="" loading="lazy" />
        </div>
      ))}
    </div>
  );
}
