import { useMemo } from "react";
import { lyrics, MOGRAPH_PHOTOS, MOGRAPH_BACKGROUNDS } from "../data/config.js";
import "../styles/mograph.css";

// ==========================================================
// SCENE CHOREOGRAPHY — deterministic, hand-authored mapping.
// One entry per lyric line (9 scenes total). Nothing here is
// randomized or auto-generated: every scene explicitly states
// which photos it uses, which layout arrangement, which virtual
// camera movement, and whether a string/connector appears.
//
// `photos`  -> indices into MOGRAPH_PHOTOS (0-based)
// `layout`  -> one of the layout presets defined in mograph.css
// `camera`  -> one of the camera movement presets in mograph.css
// `string`  -> [fromPhotoPositionInScene, toPhotoPositionInScene] or null
// ==========================================================
const SCENE_DATA = [
  { photos: [0, 1], layout: "duo-diagonal", camera: "push-in-slow", string: null },
  { photos: [2, 3, 4], layout: "trio-cascade", camera: "pan-right-zoom-out", string: [0, 1] },
  { photos: [5, 6], layout: "duo-stack", camera: "push-in-diagonal", string: null },
  { photos: [7, 8, 9], layout: "trio-scatter", camera: "diagonal-sweep", string: [1, 2] },
  { photos: [10, 11, 12], layout: "trio-arc", camera: "pull-out-reveal", string: null },
  { photos: [13, 14], layout: "duo-cross", camera: "pan-left-zoom", string: [0, 1] },
  { photos: [0, 2, 4], layout: "trio-cascade", camera: "diagonal-reveal", string: null },
  { photos: [6, 8, 10], layout: "trio-scatter", camera: "zoom-out-layered", string: [0, 2] },
  { photos: [12, 14], layout: "duo-diagonal", camera: "cinematic-close", string: null },
];

// Typewriter pacing for the cinematic subtitle effect. Purely cosmetic —
// does not touch lyric timestamps, audio timing, or lyric data structure.
const TYPE_CHAR_STEP = 0.028; // seconds between each character "keystroke"
const TYPE_LINE_GAP = 0.18; // pause before the next wrapped line starts typing

// Resolve a scene's photo index list into actual photo sources.
// Falls back gracefully (clamped/looped) if MOGRAPH_PHOTOS is ever
// shorter than expected, so a config edit never crashes the app.
function resolveScenePhotos(sceneIndex) {
  const data = SCENE_DATA[sceneIndex % SCENE_DATA.length];
  const photos = data.photos.map((idx) => MOGRAPH_PHOTOS[idx % MOGRAPH_PHOTOS.length]);
  return { ...data, photos };
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
          const { layout, camera, string, photos } = resolveScenePhotos(i);
          const background = MOGRAPH_BACKGROUNDS[i % MOGRAPH_BACKGROUNDS.length];
          const duration = Math.max(line.end - line.start, 1);
          return (
            <Scene
              key={i}
              sceneKey={i}
              layout={layout}
              camera={camera}
              string={string}
              photos={photos}
              background={background}
              duration={duration}
              text={line.text}
            />
          );
        })}
        {activeLyricIndex === -1 && <div className="mograph__intro-glow" aria-hidden="true" />}
      </div>

      <div className="mograph__vignette" />
      <div className="mograph__grain" />
    </div>
  );
}

function Scene({ sceneKey, layout, camera, string, photos, background, duration, text }) {
  const lines = useMemo(() => (text || "").split("\n").filter(Boolean), [text]);

  return (
    <div
      className={`mograph-scene mograph-scene--${layout}`}
      key={sceneKey}
      style={{ "--scene-duration": `${duration}s` }}
    >
      {/* BACKGROUND LAYER — full-bleed environment for this scene */}
      <div
        className="mograph-scene__bg"
        style={{ backgroundImage: `url(${background})` }}
        aria-hidden="true"
      >
        <div className="mograph-scene__bg-overlay" />
      </div>

      {/* CAMERA VIEWPORT — clips the world so it can pan/zoom freely */}
      <div className="mograph-scene__viewport">
        <div className={`mograph-scene__world mograph-cam--${camera}`}>
          {photos.map((src, i) => (
            <div className={`mograph-photo-frame mograph-photo-frame--${i}`} key={src + i}>
              <div
                className="mograph-photo-frame__inner"
                style={{ "--entrance-delay": `${i * 0.16}s` }}
              >
                <img src={src} alt="" loading="eager" />
              </div>
            </div>
          ))}

          {string && (
            <svg
              className={`mograph-string mograph-string--${layout}-${string[0]}-${string[1]}`}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path className="mograph-string__path" d="M20,25 Q50,10 80,75" />
            </svg>
          )}
        </div>
      </div>

      {/* LYRICS — cinematic subtitle, typed on character-by-character,
          anchored below the photo composition, never over it */}
      <div className="mograph-scene__lyrics">
        {lines.length > 0 ? (
          lines.map((line, li) => {
            const priorCharCount = lines
              .slice(0, li)
              .reduce((acc, l) => acc + l.length, 0);
            const lineStartDelay =
              priorCharCount * TYPE_CHAR_STEP + li * TYPE_LINE_GAP;
            return (
              <p className="mograph-type-line" key={li}>
                {Array.from(line).map((ch, ci) => (
                  <span
                    className="mograph-type-char"
                    key={ci}
                    style={{
                      "--char-delay": `${lineStartDelay + ci * TYPE_CHAR_STEP}s`,
                    }}
                  >
                    {ch === " " ? "\u00A0" : ch}
                  </span>
                ))}
              </p>
            );
          })
        ) : (
          <p className="mograph-type-line mograph-type-line--placeholder">✦</p>
        )}
      </div>
    </div>
  );
}
