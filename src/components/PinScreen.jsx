import { useState, useCallback, useRef, useEffect } from "react";
import { ACCESS_PIN } from "../data/config.js";
import "../styles/pin-screen.css";

const LENGTH = ACCESS_PIN.length;

export default function PinScreen({ onUnlock }) {
  const [digits, setDigits] = useState("");
  const [shake, setShake] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = useCallback(
    (e) => {
      const value = e.target.value.replace(/\D/g, "").slice(0, LENGTH);
      setDigits(value);

      if (value.length === LENGTH) {
        if (value === ACCESS_PIN) {
          setUnlocking(true);
          setTimeout(() => onUnlock(), 550);
        } else {
          setShake(true);
          setTimeout(() => {
            setShake(false);
            setDigits("");
          }, 500);
        }
      }
    },
    [onUnlock]
  );

  return (
    <div className={`pin-screen ${unlocking ? "pin-screen--unlocking" : ""}`}>
      <div className="pin-screen__sky">
        {Array.from({ length: 40 }).map((_, i) => (
          <span
            key={i}
            className="pin-screen__star"
            style={{
              "--x": `${Math.random() * 100}%`,
              "--y": `${Math.random() * 100}%`,
              "--delay": `${Math.random() * 4}s`,
              "--size": `${1 + Math.random() * 2}px`,
            }}
          />
        ))}
        <div className="pin-screen__glow pin-screen__glow--a" />
        <div className="pin-screen__glow pin-screen__glow--b" />
      </div>

      <div className={`pin-screen__card ${shake ? "pin-screen__card--shake" : ""}`}>
        <p className="pin-screen__eyebrow">an anniversary, waiting</p>
        <h1 className="pin-screen__title">masukkan kode</h1>

        <div
          className="pin-screen__dots"
          onClick={() => inputRef.current?.focus()}
        >
          {Array.from({ length: LENGTH }).map((_, i) => (
            <span
              key={i}
              className={`pin-screen__dot ${
                i < digits.length ? "pin-screen__dot--filled" : ""
              }`}
            />
          ))}
        </div>

        <input
          ref={inputRef}
          className="pin-screen__hidden-input"
          type="tel"
          inputMode="numeric"
          autoComplete="off"
          value={digits}
          onChange={handleChange}
          aria-label="Masukkan PIN"
        />

        {shake && <p className="pin-screen__feedback">coba lagi ya ✦</p>}
      </div>
    </div>
  );
}
