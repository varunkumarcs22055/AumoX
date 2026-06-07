/**
 * "O" glyph styled after the AUMOXO logo mark — a clean closed gold ring
 * with the signature floating dot above. Sits inline as a letter inside
 * the AUMOXO wordmark.
 */

let nextId = 0;
const getId = () => {
  nextId += 1;
  return `lo-${nextId}`;
};

type LogoOProps = {
  /** Glyph width in em. Default 0.9 to match cap height. */
  size?: number;
  /** Horizontal margin per side in em. */
  spacing?: number;
  className?: string;
};

export default function LogoO({
  size = 0.9,
  spacing = 0.04,
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
        verticalAlign: `-${size * 0.16}em`,
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
      <circle cx="50" cy="14" r="5" fill={`url(#${id})`} />

      {/* Clean closed ring — reads as a proper "O" letter */}
      <circle
        cx="50"
        cy="56"
        r="38"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="7"
      />
    </svg>
  );
}
