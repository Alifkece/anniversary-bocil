import { useEffect, useRef, useState } from "react";
import { endingMessages } from "../data/config.js";
import "../styles/ending-messages.css";

// Reveals kata-kata one at a time as the section scrolls into view,
// rather than all at once.
export default function EndingMessages() {
  const [visibleCount, setVisibleCount] = useState(0);
  const sectionRef = useRef(null);
  const timersRef = useRef([]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            endingMessages.forEach((_, i) => {
              const t = setTimeout(() => {
                setVisibleCount((c) => Math.max(c, i + 1));
              }, i * 1100);
              timersRef.current.push(t);
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <section className="ending-messages" ref={sectionRef}>
      {endingMessages.map((msg, i) => (
        <p
          key={i}
          className={`ending-messages__line ${i < visibleCount ? "ending-messages__line--visible" : ""}`}
        >
          {msg}
        </p>
      ))}
    </section>
  );
}
