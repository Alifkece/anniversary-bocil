import FallingStars from "./FallingStars.jsx";
import FloatingPhotos from "./FloatingPhotos.jsx";
import EndingMessages from "./EndingMessages.jsx";
import Envelope from "./Envelope.jsx";
import "../styles/ending-experience.css";

// A single continuous, scrollable night-sky world: falling stars stay
// alive in the fixed background the entire time, floating photos drift
// through it, and content (messages -> envelope -> letter) reveals as
// the user scrolls — one story, not separate pages.
export default function EndingExperience() {
  return (
    <div className="ending-experience">
      <FallingStars />
      <FloatingPhotos />

      <div className="ending-experience__content">
        <div className="ending-experience__spacer" />
        <EndingMessages />
        <Envelope />
        <div className="ending-experience__spacer ending-experience__spacer--end" />
      </div>
    </div>
  );
}
