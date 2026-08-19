import { useState, useCallback, useRef } from "react";
import PinScreen from "./components/PinScreen.jsx";
import Mograph from "./components/Mograph.jsx";
import EndingExperience from "./components/EndingExperience.jsx";
import { useAudioController } from "./hooks/useAudioController.js";
import { lyrics, MOGRAPH_AUDIO, ENDING_AUDIO } from "./data/config.js";

// Stages of the whole experience.
const STAGE = {
  PIN: "PIN",
  TRANSITION_IN: "TRANSITION_IN",
  MOGRAPH: "MOGRAPH",
  TRANSITION_OUT: "TRANSITION_OUT",
  ENDING: "ENDING",
};

// App owns the ONE audio controller instance for the whole app.
// Mograph/EndingExperience receive playback state as props instead of
// creating their own controller — this guarantees only one <audio> per
// track ever exists, so audio #1 and audio #2 can never overlap.
export default function App() {
  const [stage, setStage] = useState(STAGE.PIN);
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
  const audio = useAudioController();
  const transitionTimer = useRef(null);

  const handleMographEnded = useCallback(() => {
    audio.stop("mograph");
    setStage(STAGE.TRANSITION_OUT);
    transitionTimer.current = setTimeout(() => {
      setStage(STAGE.ENDING);
      audio.play("ending", ENDING_AUDIO, { loop: true });
    }, 1200);
  }, [audio]);

  const handleMographTimeUpdate = useCallback((t) => {
    setActiveLyricIndex((prev) => {
      const idx = lyrics.findIndex((l) => t >= l.start && t < l.end);
      return idx !== prev ? idx : prev;
    });
  }, []);

  const handleUnlock = useCallback(() => {
    setStage(STAGE.TRANSITION_IN);
    // Let the unlock animation play, then start Mograph + audio #1.
    transitionTimer.current = setTimeout(() => {
      setStage(STAGE.MOGRAPH);
      audio.play("mograph", MOGRAPH_AUDIO, {
        onTimeUpdate: handleMographTimeUpdate,
        onEnded: handleMographEnded,
      });
    }, 900);
  }, [audio, handleMographTimeUpdate, handleMographEnded]);

  return (
    <div className="app-root">
      {stage === STAGE.PIN && <PinScreen onUnlock={handleUnlock} />}

      {(stage === STAGE.TRANSITION_IN || stage === STAGE.MOGRAPH) && (
        <Mograph
          active={stage === STAGE.MOGRAPH}
          entering={stage === STAGE.TRANSITION_IN}
          activeLyricIndex={activeLyricIndex}
        />
      )}

      {stage === STAGE.TRANSITION_OUT && <div className="veil-transition" />}

      {stage === STAGE.ENDING && <EndingExperience />}
    </div>
  );
}
