/**
 * "O" glyph styled after the AUMOXO logo mark — a clean closed gold ring
 * with the signature floating dot above. Geometry is tuned so the ring
 * bottom sits exactly on the text baseline, matching neighbouring letters.
 */

let nextId = 0;
const getId = () => {
  nextId += 1;
  return `lo-${nextId}`;
};

type LogoOProps = {
  /** Glyph width in em. Default 0.95 ≈ cap height of surrounding letters. */
  size?: number;
  /** Horizontal margin per side in em. */
  spacing?: number;
  className?: string;
};

export default function LogoO({
  size = 0.95,
  spacing = 0.05,
  className = "",
}: LogoOProps) {
  const id = getId();
  // viewBox is built so that:
  //   • the ring's bottom edge touches y=100 (the SVG bottom)
  //   • with vertical-align: baseline (default for inline replaced elements),
  //     the SVG bottom sits ON the text baseline → ring bottom = baseline,
  //     matching letters like A, U, M, X.
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{
        display: "inline-block",
        width: `${size}em`,
        height: `${size}em`,
        verticalAlign: "baseline",
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

      {/* Floating dot above */}
      <circle cx="50" cy="12" r="6" fill={`url(#${id})`} />

      {/* Ring — bottom at y=98 so it sits on baseline */}
      <circle
        cx="50"
        cy="60"
        r="38"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="7.5"
      />
    </svg>
  );
}
