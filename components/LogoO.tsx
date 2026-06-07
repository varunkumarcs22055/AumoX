/**
 * "O" glyph styled after the AUMOXO logo mark — a clean closed gold ring
 * with the signature floating dot above. Sized to match the cap height of
 * neighbouring letters so it reads as a proper O in the wordmark.
 */

let nextId = 0;
const getId = () => {
  nextId += 1;
  return `lo-${nextId}`;
};

type LogoOProps = {
  /** Glyph width in em. Default 1.05 = slightly wider than a letter O for visual parity. */
  size?: number;
  /** Horizontal margin per side in em. */
  spacing?: number;
  className?: string;
};

export default function LogoO({
  size = 1.05,
  spacing = 0.06,
  className = "",
}: LogoOProps) {
  const id = getId();
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
        verticalAlign: `-${size * 0.2}em`,
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

      {/* Floating dot above — logo signature */}
      <circle cx="50" cy="10" r="6" fill={`url(#${id})`} />

      {/* Closed gold ring sized to fill viewBox so the O reads cap-high */}
      <circle
        cx="50"
        cy="58"
        r="40"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="8"
      />
    </svg>
  );
}
