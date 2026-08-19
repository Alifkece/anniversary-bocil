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

// ==========================================================
// SCRAPBOOK DECORATION — purely visual set-dressing layered into
// the existing world alongside the photos. Hand-authored per scene
// (nothing random), each item pinned to a %-position with its own
// rotation/scale/entrance delay. `layer` controls stacking + parallax:
//   "bg"   -> behind the photos, drifts least
//   "deco" -> above the photos (tape/notes/labels), no extra drift
//   "fg"   -> topmost, drifts most (foreground read)
// Does not touch photos, layout, camera, or string systems.
// ==========================================================
const SCENE_DECOR = [
  [
    { id: "s0-paper", type: "paper", layer: "bg", top: "22%", left: "14%", rot: -6, scale: 1.05, delay: 0.1 },
    { id: "s0-tape", type: "tape", layer: "deco", top: "26%", left: "30%", rot: 10, delay: 0.5 },
    { id: "s0-label", type: "label", layer: "deco", top: "86%", left: "76%", rot: -3, delay: 0.7, text: "MEMORY" },
    { id: "s0-star", type: "doodle-star", layer: "fg", top: "10%", left: "86%", scale: 0.7, delay: 0.9 },
  ],
  [
    { id: "s1-paper", type: "paper", layer: "bg", top: "16%", left: "82%", rot: 5, scale: 0.9, delay: 0.1 },
    { id: "s1-label", type: "label", layer: "deco", top: "80%", left: "18%", rot: 4, delay: 0.4, text: "DAY" },
    { id: "s1-tape", type: "tape", layer: "deco", top: "32%", left: "54%", rot: -8, delay: 0.6 },
    { id: "s1-arrow", type: "doodle-arrow", layer: "fg", top: "46%", left: "48%", rot: 18, scale: 0.8, delay: 0.8 },
  ],
  [
    { id: "s2-sticky", type: "sticky", layer: "deco", top: "20%", left: "78%", rot: 6, scale: 0.9, delay: 0.2, text: "LOVE" },
    { id: "s2-tape", type: "tape", layer: "deco", top: "70%", left: "24%", rot: -9, delay: 0.45 },
    { id: "s2-heart", type: "doodle-heart", layer: "fg", top: "86%", left: "62%", rot: -6, scale: 0.7, delay: 0.7 },
  ],
  [
    { id: "s3-news", type: "newspaper", layer: "bg", top: "80%", left: "14%", rot: -7, scale: 0.9, delay: 0.15 },
    { id: "s3-clip", type: "clip", layer: "deco", top: "16%", left: "58%", rot: -4, scale: 0.9, delay: 0.35 },
    { id: "s3-label", type: "label", layer: "deco", top: "10%", left: "18%", rot: -5, delay: 0.5, text: "NOTE" },
    { id: "s3-scribble", type: "doodle-scribble", layer: "fg", top: "56%", left: "86%", rot: 10, scale: 0.7, delay: 0.75 },
  ],
  [
    { id: "s4-paper", type: "paper", layer: "bg", top: "8%", left: "10%", rot: -6, delay: 0.1 },
    { id: "s4-sticky", type: "sticky", layer: "deco", top: "84%", left: "70%", rot: 5, scale: 0.85, delay: 0.3, text: "ARCHIVE" },
    { id: "s4-tape", type: "tape", layer: "deco", top: "24%", left: "44%", rot: 11, delay: 0.5 },
    { id: "s4-label", type: "label", layer: "deco", top: "72%", left: "14%", rot: -7, delay: 0.65, text: "PHOTO" },
    { id: "s4-star", type: "doodle-star", layer: "fg", top: "14%", left: "84%", scale: 0.6, delay: 0.85 },
    { id: "s4-news", type: "newspaper", layer: "fg", top: "90%", left: "40%", rot: 5, scale: 0.75, delay: 1.0 },
  ],
  [
    { id: "s5-tape", type: "tape", layer: "fg", top: "18%", left: "72%", rot: -11, delay: 0.2 },
    { id: "s5-sticky", type: "sticky", layer: "deco", top: "82%", left: "20%", rot: 6, scale: 0.8, delay: 0.4, text: "DAY" },
    { id: "s5-paper", type: "paper", layer: "bg", top: "66%", left: "86%", rot: 6, scale: 0.85, delay: 0.15 },
  ],
  [
    { id: "s6-news", type: "newspaper", layer: "bg", top: "12%", left: "80%", rot: 7, scale: 0.95, delay: 0.1 },
    { id: "s6-sticker", type: "sticker", layer: "deco", top: "30%", left: "14%", delay: 0.3 },
    { id: "s6-tape", type: "tape", layer: "deco", top: "60%", left: "84%", rot: -13, delay: 0.45 },
    { id: "s6-label", type: "label", layer: "deco", top: "86%", left: "46%", rot: 3, delay: 0.6, text: "MEMORY" },
    { id: "s6-scribble", type: "doodle-scribble", layer: "fg", top: "44%", left: "8%", rot: -16, scale: 0.75, delay: 0.8 },
    { id: "s6-paper", type: "paper", layer: "fg", top: "8%", left: "30%", rot: -9, scale: 0.7, delay: 0.95 },
  ],
  [
    { id: "s7-sticker", type: "sticker", layer: "bg", top: "20%", left: "18%", delay: 0.15 },
    { id: "s7-arrow", type: "doodle-arrow", layer: "deco", top: "72%", left: "76%", rot: -28, scale: 0.75, delay: 0.5 },
    { id: "s7-sweep", type: "sweep", layer: "fg", delay: 0 },
  ],
  [
    { id: "s8-label", type: "label", layer: "deco", top: "80%", left: "75%", rot: -3, delay: 0.3, text: "LOVE" },
    { id: "s8-tape", type: "tape", layer: "deco", top: "16%", left: "26%", rot: 6, delay: 0.5 },
  ],
];

// Warm light-flash accent on a handful of scene handoffs, in place of a
// plain fade — cycles through 3 tones so no two consecutive flashes match.
const SCENE_FLASH = [null, "amber", null, null, "rose", null, "white", null, "amber"];

const DECOR_MICRO = {
  paper: "decor-float",
  newspaper: "decor-float",
  tape: "decor-wiggle",
  sticky: "decor-float",
  label: "decor-float",
  sticker: "decor-bob",
};

function renderDecor(item) {
  const style = {
    "--d-top": item.top,
    "--d-left": item.left,
    "--d-rot": `${item.rot ?? 0}deg`,
    "--d-scale": item.scale ?? 1,
    "--d-delay": `${item.delay ?? 0}s`,
  };
  const micro = DECOR_MICRO[item.type] || "";

  if (item.type === "sweep") {
    return <div key={item.id} className="decor-sweep" style={{ animationDelay: `${item.delay ?? 0}s` }} />;
  }

  switch (item.type) {
    case "paper":
      return (
        <div key={item.id} className="mograph-decor" style={style}>
          <div className={`decor decor-paper ${micro}`} />
        </div>
      );
    case "newspaper":
      return (
        <div key={item.id} className="mograph-decor" style={style}>
          <div className={`decor decor-newspaper ${micro}`} />
        </div>
      );
    case "tape":
      return (
        <div key={item.id} className="mograph-decor" style={style}>
          <div className={`decor decor-tape ${micro}`} />
        </div>
      );
    case "sticky":
      return (
        <div key={item.id} className="mograph-decor" style={style}>
          <div className={`decor decor-sticky ${micro}`}>
            <span>{item.text}</span>
          </div>
        </div>
      );
    case "label":
      return (
        <div key={item.id} className="mograph-decor" style={style}>
          <div className={`decor decor-label ${micro}`}>
            <span>{item.text}</span>
          </div>
        </div>
      );
    case "sticker":
      return (
        <div key={item.id} className="mograph-decor" style={style}>
          <div className={`decor decor-sticker ${micro}`}>✦</div>
        </div>
      );
    case "clip":
      return (
        <div key={item.id} className="mograph-decor" style={style}>
          <svg className="decor decor-clip" viewBox="0 0 24 40" aria-hidden="true">
            <path
              d="M6 10 V30 a6 6 0 0 0 12 0 V8 a4 4 0 0 0-8 0 V28"
              stroke="var(--gold-soft)"
              strokeWidth="2.4"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );
    case "doodle-star":
      return (
        <div key={item.id} className="mograph-decor" style={style}>
          <svg className="decor decor-doodle" viewBox="0 0 40 40" aria-hidden="true">
            <path pathLength="1" d="M20 4 L24 16 L36 16 L26 24 L30 36 L20 28 L10 36 L14 24 L4 16 L16 16 Z" />
          </svg>
        </div>
      );
    case "doodle-heart":
      return (
        <div key={item.id} className="mograph-decor" style={style}>
          <svg className="decor decor-doodle" viewBox="0 0 40 40" aria-hidden="true">
            <path pathLength="1" d="M20 34 C6 24 4 14 12 9 C17 6 20 10 20 14 C20 10 23 6 28 9 C36 14 34 24 20 34 Z" />
          </svg>
        </div>
      );
    case "doodle-arrow":
      return (
        <div key={item.id} className="mograph-decor" style={style}>
          <svg className="decor decor-doodle" viewBox="0 0 40 40" aria-hidden="true">
            <path pathLength="1" d="M4 30 C14 26 24 18 34 10 M24 8 L34 10 L32 20" />
          </svg>
        </div>
      );
    case "doodle-scribble":
      return (
        <div key={item.id} className="mograph-decor" style={style}>
          <svg className="decor decor-doodle" viewBox="0 0 40 40" aria-hidden="true">
            <path pathLength="1" d="M4 20 C10 10 14 30 20 20 C26 10 30 30 36 20" />
          </svg>
        </div>
      );
    default:
      return null;
  }
}

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
  const decor = SCENE_DECOR[sceneKey % SCENE_DECOR.length] || [];
  const decorBg = decor.filter((d) => d.layer === "bg");
  const decorDeco = decor.filter((d) => d.layer === "deco");
  const decorFg = decor.filter((d) => d.layer === "fg");
  const flashColor = SCENE_FLASH[sceneKey % SCENE_FLASH.length];

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
          {decorBg.length > 0 && (
            <div className="mograph-decor-layer mograph-decor-layer--bg" aria-hidden="true">
              {decorBg.map(renderDecor)}
            </div>
          )}
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
              <path
                className="mograph-string__path"
                d="M20,25 Q50,10 80,75"
                pathLength="1"
              />
            </svg>
          )}

          {decorDeco.length > 0 && (
            <div className="mograph-decor-layer mograph-decor-layer--deco" aria-hidden="true">
              {decorDeco.map(renderDecor)}
            </div>
          )}
          {decorFg.length > 0 && (
            <div className="mograph-decor-layer mograph-decor-layer--fg" aria-hidden="true">
              {decorFg.map(renderDecor)}
            </div>
          )}
        </div>

        {/* Warm vintage color grade + optional light-flash handoff,
            scoped to the photo composition only (never over lyrics) */}
        <div className="mograph-scene__grade" aria-hidden="true" />
        {flashColor && (
          <div className={`mograph-scene__flash mograph-scene__flash--${flashColor}`} aria-hidden="true" />
        )}
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
