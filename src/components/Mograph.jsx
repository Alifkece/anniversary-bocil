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
// SCRAPBOOK DECORATION — small accents ATTACHED to individual
// photo frames (rendered as children of .mograph-photo-frame), so
// they inherit that frame's own translate/rotate/scale automatically
// — when the photo moves, the tape/label/doodle on it moves with it.
// Kept deliberately small/edge-anchored: the photo stays the hero.
// `photoIndex` -> which frame within the scene's photo list (0-based)
// `corner`     -> anchor point on that frame
// `delay`      -> extra stagger on top of the photo's own entrance
// ==========================================================
const SCENE_DECOR = [
  [
    { id: "s0-tape", photoIndex: 0, type: "tape", corner: "tl", rot: -8, delay: 0.08 },
    { id: "s0-label", photoIndex: 0, type: "label", corner: "bc", rot: -2, delay: 0.16, text: "MEMORY" },
    { id: "s0-star", photoIndex: 1, type: "doodle-star", corner: "tr", rot: 0, delay: 0.24, scale: 0.75 },
  ],
  [
    { id: "s1-tape", photoIndex: 0, type: "tape", corner: "tr", rot: 9, delay: 0.08 },
    { id: "s1-label", photoIndex: 1, type: "label", corner: "br", rot: 3, delay: 0.16, text: "DAY" },
    { id: "s1-arrow", photoIndex: 2, type: "doodle-arrow", corner: "tl", rot: -12, delay: 0.22, scale: 0.7 },
  ],
  [
    { id: "s2-tape", photoIndex: 0, type: "tape", corner: "tr", rot: -7, delay: 0.08 },
    { id: "s2-sticky", photoIndex: 1, type: "sticky", corner: "bl", rot: 6, delay: 0.16, text: "LOVE" },
  ],
  [
    { id: "s3-scribble", photoIndex: 0, type: "doodle-scribble", corner: "tl", rot: 6, delay: 0.1, scale: 0.7 },
    { id: "s3-tape", photoIndex: 1, type: "tape", corner: "bl", rot: -9, delay: 0.18 },
    { id: "s3-label", photoIndex: 2, type: "label", corner: "tr", rot: -4, delay: 0.24, text: "NOTE" },
    { id: "s3-clip", photoIndex: 2, type: "clip", corner: "br", rot: 4, delay: 0.3 },
  ],
  [
    { id: "s4-tape", photoIndex: 0, type: "tape", corner: "tl", rot: 8, delay: 0.08 },
    { id: "s4-label", photoIndex: 0, type: "label", corner: "bc", rot: -3, delay: 0.16, text: "ARCHIVE" },
    { id: "s4-star", photoIndex: 0, type: "doodle-star", corner: "tr", rot: 0, delay: 0.24, scale: 0.65 },
    { id: "s4-tape2", photoIndex: 1, type: "tape", corner: "tr", rot: -6, delay: 0.12 },
    { id: "s4-sticky2", photoIndex: 2, type: "sticky", corner: "bl", rot: 5, delay: 0.14, text: "PHOTO" },
  ],
  [
    { id: "s5-tape", photoIndex: 0, type: "tape", corner: "tr", rot: -10, delay: 0.08 },
    { id: "s5-label", photoIndex: 1, type: "label", corner: "bl", rot: 4, delay: 0.16, text: "DAY" },
  ],
  [
    { id: "s6-tape", photoIndex: 0, type: "tape", corner: "tl", rot: 10, delay: 0.08 },
    { id: "s6-scribble", photoIndex: 0, type: "doodle-scribble", corner: "bl", rot: -8, delay: 0.18, scale: 0.65 },
    { id: "s6-label", photoIndex: 1, type: "label", corner: "tr", rot: 3, delay: 0.14, text: "MEMORY" },
    { id: "s6-sticker", photoIndex: 2, type: "sticker", corner: "br", rot: 0, delay: 0.2 },
    { id: "s6-tape2", photoIndex: 2, type: "tape", corner: "tr", rot: -7, delay: 0.26 },
  ],
  [
    { id: "s7-arrow", photoIndex: 0, type: "doodle-arrow", corner: "tl", rot: 14, delay: 0.1, scale: 0.7 },
    { id: "s7-tape", photoIndex: 2, type: "tape", corner: "br", rot: -9, delay: 0.16 },
  ],
  [
    { id: "s8-tape", photoIndex: 1, type: "tape", corner: "tl", rot: 6, delay: 0.1 },
    { id: "s8-label", photoIndex: 1, type: "label", corner: "bc", rot: -2, delay: 0.2, text: "LOVE" },
  ],
];

// Warm light-flash accent on a handful of scene handoffs, in place of a
// plain fade — cycles through 3 tones so no two consecutive flashes match.
const SCENE_FLASH = [null, "amber", null, null, "rose", null, "white", null, "amber"];

const CORNER_STYLE = {
  tl: { top: "-9px", left: "-7px" },
  tr: { top: "-9px", right: "-7px" },
  bl: { bottom: "3px", left: "-9px" },
  br: { bottom: "3px", right: "-9px" },
  bc: { bottom: "-9px", left: "50%", "--d-center": "1" },
};

// Renders a single small accent, anchored to a corner of whichever
// .mograph-photo-frame it belongs to (see groupDecorByPhoto below) —
// it is a DOM child of that frame, so the frame's own transform
// (translate/rotate/scale from the camera + focus choreography)
// carries the accent along with the photo automatically.
function renderPhotoDecor(item, baseDelay) {
  const anchor = CORNER_STYLE[item.corner] || CORNER_STYLE.tl;
  const totalDelay = `${baseDelay + (item.delay ?? 0)}s`;
  const style = {
    ...anchor,
    "--d-rot": `${item.rot ?? 0}deg`,
    "--d-scale": item.scale ?? 1,
    "--d-delay": totalDelay,
    animationDelay: totalDelay,
  };
  const centered = anchor["--d-center"] ? " mograph-photo-decor--centered" : "";
  const micro =
    item.type === "tape" ? "decor-wiggle" : item.type === "sticker" ? "decor-bob" : item.type === "sticky" || item.type === "label" ? "decor-float" : "";

  switch (item.type) {
    case "tape":
      return <div key={item.id} className={`mograph-photo-decor${centered}`} style={style}><div className={`decor decor-tape ${micro}`} /></div>;
    case "sticky":
      return (
        <div key={item.id} className={`mograph-photo-decor${centered}`} style={style}>
          <div className={`decor decor-sticky ${micro}`}><span>{item.text}</span></div>
        </div>
      );
    case "label":
      return (
        <div key={item.id} className={`mograph-photo-decor${centered}`} style={style}>
          <div className={`decor decor-label ${micro}`}><span>{item.text}</span></div>
        </div>
      );
    case "sticker":
      return (
        <div key={item.id} className={`mograph-photo-decor${centered}`} style={style}>
          <div className={`decor decor-sticker ${micro}`}>✦</div>
        </div>
      );
    case "clip":
      return (
        <div key={item.id} className={`mograph-photo-decor${centered}`} style={style}>
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
        <div key={item.id} className={`mograph-photo-decor${centered}`} style={style}>
          <svg className="decor decor-doodle" viewBox="0 0 40 40" aria-hidden="true">
            <path pathLength="1" d="M20 4 L24 16 L36 16 L26 24 L30 36 L20 28 L10 36 L14 24 L4 16 L16 16 Z" />
          </svg>
        </div>
      );
    case "doodle-arrow":
      return (
        <div key={item.id} className={`mograph-photo-decor${centered}`} style={style}>
          <svg className="decor decor-doodle" viewBox="0 0 40 40" aria-hidden="true">
            <path pathLength="1" d="M4 30 C14 26 24 18 34 10 M24 8 L34 10 L32 20" />
          </svg>
        </div>
      );
    case "doodle-scribble":
      return (
        <div key={item.id} className={`mograph-photo-decor${centered}`} style={style}>
          <svg className="decor decor-doodle" viewBox="0 0 40 40" aria-hidden="true">
            <path pathLength="1" d="M4 20 C10 10 14 30 20 20 C26 10 30 30 36 20" />
          </svg>
        </div>
      );
    default:
      return null;
  }
}

// Groups a scene's decor list by photoIndex once, so Scene can just
// look up `decorByPhoto[i]` while mapping photos — no filtering per frame.
function groupDecorByPhoto(sceneKey) {
  const list = SCENE_DECOR[sceneKey % SCENE_DECOR.length] || [];
  const grouped = {};
  for (const item of list) {
    if (!grouped[item.photoIndex]) grouped[item.photoIndex] = [];
    grouped[item.photoIndex].push(item);
  }
  return grouped;
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
  const decorByPhoto = groupDecorByPhoto(sceneKey);
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
          {photos.map((src, i) => {
            const entranceDelay = i * 0.16;
            const decorItems = decorByPhoto[i] || [];
            return (
              <div className={`mograph-photo-frame mograph-photo-frame--${i}`} key={src + i}>
                <div
                  className="mograph-photo-frame__inner"
                  style={{ "--entrance-delay": `${entranceDelay}s` }}
                >
                  <img src={src} alt="" loading="eager" />
                </div>
                {decorItems.map((item) => renderPhotoDecor(item, entranceDelay))}
              </div>
            );
          })}

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
