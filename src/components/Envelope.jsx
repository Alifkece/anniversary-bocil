import { useState } from "react";
import Letter from "./Letter.jsx";
import "../styles/envelope.css";

export default function Envelope() {
  const [opened, setOpened] = useState(false);

  return (
    <section className="envelope-section">
      {!opened && (
        <button
          className="envelope"
          onClick={() => setOpened(true)}
          aria-label="Buka surat"
        >
          <span className="envelope__glow" />
          <span className="envelope__body">
            <span className="envelope__flap" />
            <span className="envelope__seal">✦</span>
          </span>
          <span className="envelope__hint">ketuk untuk membuka</span>
        </button>
      )}

      {opened && (
        <div className="envelope__opened">
          <div className="envelope__flap-open" />
          <Letter />
        </div>
      )}
    </section>
  );
}
