/**
 * Stylized "O" glyph — a miniature of the AUMOXO logo mark
 * (gold ring + floating dot above) for inline use in the wordmark.
 *
 * Geometry (viewBox 100×130, taller than wide so the dot can float above):
 *   Ring  cx=50 cy=80 r=42  → spans y=38–122 (≈ cap-height once scaled)
 *   Dot   cx=50 cy=14 r=7   → floats above the ring like the real logo
 *
 * Alignment math (size=0.85em → SVG height 1.105em):
 *   Ring bottom is at 122/130 of SVG height = 1.038em from SVG top.
 *   We set vertical-align: -0.067em so SVG bottom sits 0.067em below baseline,
 *   which puts ring bottom exactly on the text baseline.
 */

let nextId = 0;
const getId = () => {
  nextId += 1;
  return `lo-${nextId}`;
};

type LogoOProps = {
  /** Width in em. Default 0.85 visually matches uppercase cap height. */
  size?: number;
  /** Horizontal margin per side in em (compensates for wordmark letter-spacing). */
  spacing?: number;
  className?: string;
};

export default function LogoO({
  size = 0.85,
  spacing = 0.13,
  className = "",
}: LogoOProps) {
  const id = getId();
  return (
    <svg
      viewBox="0 0 100 130"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{
        display: "inline-block",
        width: `${size}em`,
        height: `${size * 1.3}em`,
        verticalAlign: `-${(size * 1.3) - size * 1.22}em`, // = size * 0.08em — puts ring bottom on baseline
        margin: `0 ${spacing}em`,
      }}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0DDA0" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#B8941F" />
        </linearGradient>
      </defs>

      {/* Floating dot — above the ring, like the original logo mark */}
      <circle cx="50" cy="14" r="7" fill={`url(#${id})`} />

      {/* Broken ring — visually replaces the letter O */}
      <circle
        cx="50"
        cy="80"
        r="42"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="6"
        strokeDasharray="240 22"
        strokeDashoffset="-60"
        strokeLinecap="round"
      />
    </svg>
  );
}
