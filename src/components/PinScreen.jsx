import { useState, useCallback, useEffect, useRef } from "react";
import { ACCESS_PIN } from "../data/config.js";
import "../styles/pin-screen.css";

const LENGTH = ACCESS_PIN.length;

const KEYS = [
  { type: "digit", value: "1" },
  { type: "digit", value: "2" },
  { type: "digit", value: "3" },
  { type: "digit", value: "4" },
  { type: "digit", value: "5" },
  { type: "digit", value: "6" },
  { type: "digit", value: "7" },
  { type: "digit", value: "8" },
  { type: "digit", value: "9" },
  { type: "backspace" },
  { type: "digit", value: "0" },
  { type: "check" },
];

function BackspaceIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M8.5 5h10A2.5 2.5 0 0 1 21 7.5v9A2.5 2.5 0 0 1 18.5 19h-10L3 12l5.5-7z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M13 9.5l4 5M17 9.5l-4 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M4.5 12.5l4.5 4.5L19.5 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PinScreen({ onUnlock }) {
  const [digits, setDigits] = useState("");
  const [shake, setShake] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [locked, setLocked] = useState(false);
  const [pressedKey, setPressedKey] = useState(null);

  // Refs mirror state so the physical-keyboard fallback listener (added once)
  // always reads fresh values without needing to re-bind on every keystroke.
  const digitsRef = useRef(digits);
  const lockedRef = useRef(locked);
  const unlockingRef = useRef(unlocking);
  digitsRef.current = digits;
  lockedRef.current = locked;
  unlockingRef.current = unlocking;

  const validate = useCallback(
    (value) => {
      if (value === ACCESS_PIN) {
        setLocked(true);
        setUnlocking(true);
        setTimeout(() => onUnlock(), 550);
      } else {
        setLocked(true);
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setDigits("");
          setLocked(false);
        }, 500);
      }
    },
    [onUnlock]
  );

  const pressDigit = useCallback(
    (d) => {
      if (lockedRef.current || unlockingRef.current) return;
      setDigits((prev) => {
        if (prev.length >= LENGTH) return prev;
        const next = prev + d;
        if (next.length === LENGTH) {
          // Defer so this render commits (digit shows) before validating.
          setTimeout(() => validate(next), 120);
        }
        return next;
      });
    },
    [validate]
  );

  const pressBackspace = useCallback(() => {
    if (lockedRef.current || unlockingRef.current) return;
    setDigits((prev) => prev.slice(0, -1));
  }, []);

  const pressCheck = useCallback(() => {
    if (lockedRef.current || unlockingRef.current) return;
    if (digitsRef.current.length === LENGTH) validate(digitsRef.current);
  }, [validate]);

  // Physical/device numeric keyboard still works as a fallback — the keypad
  // is just no longer the only way in, unlike the old off-screen hidden
  // <input> which some mobile browsers refuse to focus/open a keyboard for
  // when it has zero width/height, silently swallowing every tap.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (/^[0-9]$/.test(e.key)) {
        pressDigit(e.key);
      } else if (e.key === "Backspace") {
        pressBackspace();
      } else if (e.key === "Enter") {
        pressCheck();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pressDigit, pressBackspace, pressCheck]);

  const handleKeyTap = (key) => {
    if (locked || unlocking) return;
    setPressedKey(key.type === "digit" ? key.value : key.type);
    window.clearTimeout(handleKeyTap._t);
    handleKeyTap._t = window.setTimeout(() => setPressedKey(null), 160);

    if (key.type === "digit") pressDigit(key.value);
    else if (key.type === "backspace") pressBackspace();
    else if (key.type === "check") pressCheck();
  };

  const complete = digits.length === LENGTH;

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

      <div
        className={`pin-screen__card ${shake ? "pin-screen__card--shake" : ""} ${
          unlocking ? "pin-screen__card--success" : ""
        }`}
      >
        <p className="pin-screen__eyebrow">an anniversary, waiting</p>
        <h1 className="pin-screen__title">masukkan kode</h1>

        <div className="pin-screen__dots" aria-hidden="true">
          {Array.from({ length: LENGTH }).map((_, i) => (
            <span
              key={i}
              className={`pin-screen__dot ${
                i < digits.length ? "pin-screen__dot--filled" : ""
              }`}
            />
          ))}
        </div>

        <div className="pin-screen__feedback-slot">
          {shake && <p className="pin-screen__feedback">oops, coba lagi ya</p>}
        </div>

        <div
          className={`pin-screen__keypad ${
            locked || unlocking ? "pin-screen__keypad--disabled" : ""
          }`}
          role="group"
          aria-label="Keypad PIN"
        >
          {KEYS.map((key, i) => {
            const isActive =
              key.type === "digit"
                ? pressedKey === key.value
                : pressedKey === key.type;
            if (key.type === "backspace") {
              return (
                <button
                  key={i}
                  type="button"
                  className={`pin-screen__key pin-screen__key--action ${
                    isActive ? "pin-screen__key--pressed" : ""
                  }`}
                  onClick={() => handleKeyTap(key)}
                  aria-label="Hapus digit terakhir"
                  disabled={digits.length === 0}
                >
                  <BackspaceIcon />
                </button>
              );
            }
            if (key.type === "check") {
              return (
                <button
                  key={i}
                  type="button"
                  className={`pin-screen__key pin-screen__key--action ${
                    complete ? "pin-screen__key--ready" : ""
                  } ${isActive ? "pin-screen__key--pressed" : ""}`}
                  onClick={() => handleKeyTap(key)}
                  aria-label="Konfirmasi PIN"
                  disabled={!complete}
                >
                  <CheckIcon />
                </button>
              );
            }
            return (
              <button
                key={i}
                type="button"
                className={`pin-screen__key ${
                  isActive ? "pin-screen__key--pressed" : ""
                }`}
                onClick={() => handleKeyTap(key)}
                aria-label={`Angka ${key.value}`}
              >
                {key.value}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
