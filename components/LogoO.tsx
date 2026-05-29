/**
 * Stylized "O" glyph — a miniature of the AUMOXO logo mark (gold ring + floating dot),
 * sized so the ring fills the cap-height of surrounding text and sits on the baseline.
 *
 * Geometry math (in viewBox units, width = `size` em, viewBox 100×130):
 *   - Ring  cx=50, cy=89, r=41  → ring bottom at y=130 (= baseline)
 *                                  ring top    at y=48  (≈ cap height)
 *   - Dot   cx=50, cy=18, r=8   → floats above the cap line into the line box
 *
 * The component also adds horizontal margin to play well with the .wordmark
 * letter-spacing (0.28em → 0.14em on each side of the glyph).
 */

let nextId = 0;
const getId = () => {
  nextId += 1;
  return `lo-${nextId}`;
};

type LogoOProps = {
  /** Glyph width in em. Default 0.85 matches uppercase cap height visual mass. */
  size?: number;
  /** Letter-spacing compensation in em (each side). Default 0.14em matches wordmark. */
  spacing?: number;
  className?: string;
};

export default function LogoO({
  size = 0.85,
  spacing = 0.14,
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

      {/* Top floating dot — sits above cap height, inside the line box */}
      <circle cx="50" cy="18" r="8" fill={`url(#${id})`} />

      {/* Ring — bottom touches baseline, top at cap height */}
      <circle
        cx="50"
        cy="89"
        r="41"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="7"
        strokeDasharray="232 18"
        strokeDashoffset="-56"
        strokeLinecap="round"
      />
    </svg>
  );
}
