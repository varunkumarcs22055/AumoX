/**
 * Stylized "O" glyph — a miniature of the AUMOXO logo mark (gold ring + floating dot)
 * for use inline inside the wordmark. Each instance gets a unique gradient id.
 */

let nextId = 0;
const getId = () => {
  nextId += 1;
  return `lo-${nextId}`;
};

type LogoOProps = {
  /** Width relative to surrounding text height (em). Default 0.78 */
  size?: number;
  /** Vertical offset (em) to align with cap line. Default -0.06 */
  baseline?: number;
  /** Force light/dark stroke color. Defaults to gold gradient. */
  className?: string;
};

export default function LogoO({
  size = 0.78,
  baseline = -0.06,
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
        verticalAlign: `${baseline}em`,
      }}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0DDA0" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#B8941F" />
        </linearGradient>
      </defs>

      {/* Top floating dot */}
      <circle cx="50" cy="14" r="6.5" fill={`url(#${id})`} />

      {/* Broken ring (matches the logo mark) */}
      <circle
        cx="50"
        cy="80"
        r="42"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="6"
        strokeDasharray="240 18"
        strokeDashoffset="-58"
        strokeLinecap="round"
      />
    </svg>
  );
}
