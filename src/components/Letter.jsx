import { letterContent } from "../data/config.js";
import "../styles/letter.css";

export default function Letter() {
  const paragraphs = letterContent
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="letter">
      <div className="letter__paper">
        {paragraphs.map((p, i) => (
          <p className="letter__paragraph" key={i} style={{ "--p-delay": `${i * 0.15}s` }}>
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}
