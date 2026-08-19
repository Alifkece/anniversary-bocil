import { useMemo } from "react";
import "../styles/falling-stars.css";

// Ambient twinkling stars + repeating shooting stars with varied
// position / timing / direction / speed, per spec.
export default function FallingStars() {
  const stars = useMemo(
    () =>
      Array.from({ length: 60 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 2,
        delay: Math.random() * 5,
        duration: 2.5 + Math.random() * 3,
      })),
    []
  );

  const shootingStars = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => ({
        id: i,
        top: 5 + Math.random() * 60,
        left: Math.random() * 70,
        delay: i * 2.3 + Math.random() * 2,
        duration: 1.6 + Math.random() * 1.4,
        angle: 18 + Math.random() * 20,
        scale: 0.7 + Math.random() * 0.8,
      })),
    []
  );

  return (
    <div className="falling-stars" aria-hidden="true">
      <div className="falling-stars__glow falling-stars__glow--a" />
      <div className="falling-stars__glow falling-stars__glow--b" />

      {stars.map((s) => (
        <span
          key={s.id}
          className="falling-stars__twinkle"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}

      {shootingStars.map((s) => (
        <span
          key={s.id}
          className="falling-stars__shooting"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            "--angle": `${s.angle}deg`,
            "--scale": s.scale,
          }}
        />
      ))}
    </div>
  );
}
