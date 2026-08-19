import { useMemo } from "react";
import { lyrics, MOGRAPH_PHOTOS } from "../data/config.js";
import "../styles/mograph.css";

// Photo composition patterns per scene — cycles through variety (1,2,3,4,5 foto).
const COMPOSITIONS = ["one", "two", "three", "four", "five"];

// Deterministically pick photo(s) for a given scene index.
function photosForScene(sceneIndex) {
  const compKey = COMPOSITIONS[sceneIndex % COMPOSITIONS.length];
  const count =
    compKey === "one" ? 1 : compKey === "two" ? 2 : compKey === "three" ? 3 : compKey === "four" ? 4 : 5;
  const photos = [];
  for (let i = 0; i < count; i++) {
    const idx = (sceneIndex * 3 + i) % MOGRAPH_PHOTOS.length;
    photos.push(MOGRAPH_PHOTOS[idx]);
  }
  return { compKey, photos };
}

// Pure presentational component. All timing is driven by App via
// `activeLyricIndex`, which is derived from the single shared audio
// controller's currentTime — this component never touches audio itself.
export default function Mograph({ active, entering, activeLyricIndex }) {
  return (
    <div className={`mograph ${entering ? "mograph--enter" : ""} ${active ? "mograph--active" : ""}`}>
      <div className="mograph__stage">
        {lyrics.map((line, i) => {
          if (i !== activeLyricIndex) return null;
          const { compKey, photos } = photosForScene(i);
          return <Scene key={i} sceneKey={i} compKey={compKey} photos={photos} text={line.text} />;
        })}
        {activeLyricIndex === -1 && <div className="mograph__intro-glow" aria-hidden="true" />}
      </div>

      <div className="mograph__vignette" />
      <div className="mograph__grain" />
    </div>
  );
}

function Scene({ sceneKey, compKey, photos, text }) {
  const lines = useMemo(() => (text || "").split("\n").filter(Boolean), [text]);

  return (
    <div className={`mograph-scene mograph-scene--${compKey}`} key={sceneKey}>
      <div className="mograph-scene__photos">
        {photos.map((src, i) => (
          <div className={`mograph-photo mograph-photo--${i}`} key={src + i}>
            <img src={src} alt="" loading="eager" />
          </div>
        ))}
      </div>

      <div className="mograph-scene__type">
        {lines.length > 0 ? (
          lines.map((line, li) => (
            <p className="mograph-type-line" key={li} style={{ "--line-delay": `${li * 0.12}s` }}>
              {line.split(" ").map((word, wi) => (
                <span
                  className="mograph-type-word"
                  key={wi}
                  style={{ "--word-delay": `${li * 0.12 + wi * 0.05}s` }}
                >
                  {word}&nbsp;
                </span>
              ))}
            </p>
          ))
        ) : (
          <p className="mograph-type-line mograph-type-line--placeholder">✦</p>
        )}
      </div>
    </div>
  );
}
