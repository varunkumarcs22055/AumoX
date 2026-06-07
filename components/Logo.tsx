import Link from "next/link";
import LogoO from "./LogoO";

type LogoProps = {
  variant?: "full" | "mark";
  className?: string;
  size?: number;
};

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

      {/* Floating top dot */}
      <circle cx="100" cy="34" r="7" fill="url(#aumox-gold)" />

      {/* Main ring — open at the top-right with a graceful break */}
      <path
        d="M 100 48 A 56 56 0 1 1 148 132"
        stroke="url(#aumox-gold)"
        strokeWidth="5.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* The signature sweep — curling tail extending from the right break */}
      <path
        d="M 148 132 Q 162 124 156 104"
        stroke="url(#aumox-gold)"
        strokeWidth="5.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* The A — two diagonal strokes meeting at apex (no crossbar) */}
      <path
        d="M 73 143 L 100 72 L 127 143"
        stroke="url(#aumox-gold)"
        strokeWidth="5.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Solid center dot inside the A — replaces the crossbar */}
      <circle cx="100" cy="127" r="5" fill="url(#aumox-gold)" />
    </svg>
  );
}

export default function Logo({ variant = "full", className = "" }: LogoProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-3 group ${className}`}
      aria-label="AUMOXO home"
    >
      <LogoMark size={36} className="transition-transform duration-300 group-hover:rotate-[8deg]" />
      {variant === "full" && (
        <div className="flex flex-col leading-none">
          <span className="wordmark text-[17px] text-ink-100 whitespace-nowrap">
            AUM<LogoO />X<LogoO />
          </span>
          <span className="mt-[3px] text-[8px] tracking-[0.35em] uppercase text-gold-400/80">
            Think Infinite
          </span>
        </div>
      )}
    </Link>
  );
}
