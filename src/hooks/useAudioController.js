import { useRef, useCallback, useEffect } from "react";

/**
 * Centralized audio controller.
 * Guarantees only ONE audio element plays at a time.
 * Usage:
 *   const audio = useAudioController();
 *   audio.play("mograph", "/audio/drop-dead.mp3", { onTimeUpdate, onEnded });
 *   audio.stop("mograph");
 *   audio.play("ending", "/audio/anniversary.mp3", { loop: true });
 */
export function useAudioController() {
  const elementsRef = useRef({}); // key -> HTMLAudioElement
  const activeKeyRef = useRef(null);

  const getOrCreate = useCallback((key, src) => {
    if (!elementsRef.current[key]) {
      const el = new Audio(src);
      el.preload = "auto";
      elementsRef.current[key] = el;
    }
    return elementsRef.current[key];
  }, []);

  const stopAll = useCallback(() => {
    Object.values(elementsRef.current).forEach((el) => {
      el.pause();
    });
    activeKeyRef.current = null;
  }, []);

  const stop = useCallback((key) => {
    const el = elementsRef.current[key];
    if (el) {
      el.pause();
    }
    if (activeKeyRef.current === key) {
      activeKeyRef.current = null;
    }
  }, []);

  const play = useCallback(
    (key, src, { loop = false, onTimeUpdate, onEnded, volume = 1 } = {}) => {
      // Stop every other track first — never allow overlap.
      Object.entries(elementsRef.current).forEach(([k, el]) => {
        if (k !== key) el.pause();
      });

      const el = getOrCreate(key, src);
      el.loop = loop;
      el.volume = volume;

      if (onTimeUpdate) {
        el.ontimeupdate = () => onTimeUpdate(el.currentTime);
      }
      if (onEnded) {
        el.onended = onEnded;
      }

      activeKeyRef.current = key;
      const p = el.play();
      if (p && p.catch) {
        p.catch(() => {
          /* autoplay was blocked — will resume on next user gesture */
        });
      }
      return el;
    },
    [getOrCreate]
  );

  useEffect(() => {
    const elements = elementsRef.current;
    return () => {
      // Cleanup on unmount: stop everything, strip listeners.
      Object.values(elements).forEach((el) => {
        el.pause();
        el.ontimeupdate = null;
        el.onended = null;
        el.src = "";
      });
    };
  }, []);

  return { play, stop, stopAll };
}
