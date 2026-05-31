/**
 * Stylized "O" glyph — a miniature of the AUMOXO logo mark (gold ring + small floating dot),
 * tuned to sit cleanly inline next to capital letters at the same visual cap-height.
 */

let nextId = 0;
const getId = () => {
  nextId += 1;
  return `lo-${nextId}`;
};

type LogoOProps = {
  /** Width and height in em. Default 0.9 matches uppercase cap height in Inter. */
  size?: number;
  /** Letter-spacing compensation in em (each side). Default 0.12em. */
  spacing?: number;
  className?: string;
};

export default function LogoO({
  size = 0.9,
  spacing = 0.12,
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

      {/* Small dot — sits just above the ring (close, not floating high) */}
      <circle cx="50" cy="12" r="5" fill={`url(#${id})`} />

      {/* Ring — fills the cap-height area, slightly lower to sit on baseline */}
      <circle
        cx="50"
        cy="55"
        r="40"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="7"
        strokeDasharray="228 22"
        strokeDashoffset="-58"
        strokeLinecap="round"
      />
    </svg>
  );
}
