/**
 * Stylized "O" glyph — a miniature of the AUMOXO logo mark (gold ring + floating dot),
 * sized and positioned to sit on the baseline like a real letter.
 */

let nextId = 0;
const getId = () => {
  nextId += 1;
  return `lo-${nextId}`;
};

type LogoOProps = {
  /** Glyph width in em relative to surrounding text. Default 0.72 */
  size?: number;
  className?: string;
};

export default function LogoO({ size = 0.72, className = "" }: LogoOProps) {
  const id = getId();
  // Total SVG height is taller than wide to leave room for the floating dot
  // above the cap line. The ring is positioned in the lower portion of the
  // viewBox so its visual center matches the x-height middle of nearby letters.
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
        // Aligns the ring's bottom with the surrounding text baseline.
        verticalAlign: `-${size * 0.22}em`,
      }}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0DDA0" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#B8941F" />
        </linearGradient>
      </defs>

      {/* Top floating dot — sits in the line-height area above the cap line */}
      <circle cx="50" cy="18" r="7" fill={`url(#${id})`} />

      {/* Ring — visually replaces the letter O, occupying baseline → cap height */}
      <circle
        cx="50"
        cy="82"
        r="40"
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
