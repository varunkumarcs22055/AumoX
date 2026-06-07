import Link from "next/link";
import LogoO from "./LogoO";

type LogoProps = {
  variant?: "full" | "mark";
  className?: string;
  size?: number;
};

/**
 * The AUMOXO brand mark — inline SVG version. Transparent background so it
 * sits cleanly inside the navbar, on the orbital ring, or anywhere else
 * without the "black square" problem the JPEG creates.
 */
export function LogoMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="aumox-gold" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#F0DDA0" />
          <stop offset="35%" stopColor="#E5C76B" />
          <stop offset="70%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#B8941F" />
        </linearGradient>
      </defs>
      {/* Floating dot above the ring */}
      <circle cx="100" cy="34" r="7" fill="url(#aumox-gold)" />
      {/* Main ring with a graceful break at the top-right */}
      <path d="M 100 48 A 56 56 0 1 1 148 132" stroke="url(#aumox-gold)" strokeWidth="5.5" fill="none" strokeLinecap="round" />
      {/* The signature curling sweep tail */}
      <path d="M 148 132 Q 162 124 156 104" stroke="url(#aumox-gold)" strokeWidth="5.5" fill="none" strokeLinecap="round" />
      {/* The A — two diagonals meeting at apex (no crossbar) */}
      <path d="M 73 143 L 100 72 L 127 143" stroke="url(#aumox-gold)" strokeWidth="5.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Solid center dot inside the A */}
      <circle cx="100" cy="127" r="5" fill="url(#aumox-gold)" />
    </svg>
  );
}

/**
 * Navbar / site logo — SVG mark sized to match the wordmark text height,
 * with a gentle glowing aura on hover for a futuristic touch.
 */
export default function Logo({ className = "" }: LogoProps) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-3 ${className}`}
      aria-label="AUMOXO home"
    >
      <span
        className="relative inline-block transition-transform duration-300 group-hover:rotate-[10deg]"
        style={{ filter: "drop-shadow(0 0 14px rgba(212,175,55,0.35))" }}
      >
        <LogoMark size={52} className="h-12 w-12 lg:h-14 lg:w-14" />
      </span>

      <span className="flex flex-col leading-none">
        <span className="text-[20px] lg:text-[24px] font-semibold tracking-[0.16em] text-ink-100 whitespace-nowrap inline-flex items-center">
          AUM<LogoO size={0.85} spacing={0.04} />X<LogoO size={0.85} spacing={0.04} />
        </span>
        <span className="mt-1 text-[10px] tracking-[0.4em] uppercase text-gold-600 dark:text-gold-400/90">
          Think Infinite
        </span>
      </span>
    </Link>
  );
}
