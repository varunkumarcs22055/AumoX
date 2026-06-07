import Link from "next/link";
import Image from "next/image";

type LogoProps = {
  variant?: "full" | "mark";
  className?: string;
  size?: number;
};

/**
 * The actual AUMOXO brand mark — kept as an SVG recreation for places that
 * need a transparent / scalable icon (favicon overlays, hero center, About).
 * For the live navbar we use the real provided logo image (see Logo below).
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
      <circle cx="100" cy="34" r="7" fill="url(#aumox-gold)" />
      <path d="M 100 48 A 56 56 0 1 1 148 132" stroke="url(#aumox-gold)" strokeWidth="5.5" fill="none" strokeLinecap="round" />
      <path d="M 148 132 Q 162 124 156 104" stroke="url(#aumox-gold)" strokeWidth="5.5" fill="none" strokeLinecap="round" />
      <path d="M 73 143 L 100 72 L 127 143" stroke="url(#aumox-gold)" strokeWidth="5.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="100" cy="127" r="5" fill="url(#aumox-gold)" />
    </svg>
  );
}

/**
 * The navbar / site logo — uses the actual brand image the user supplied.
 * Black background of the JPEG sits on top of any page background, but
 * `mix-blend-mode: lighten` makes the black bleed into dark pages and
 * preserves gold visibility. On light pages the image renders as a
 * "branded card" with its natural black backdrop.
 */
export default function Logo({ className = "" }: LogoProps) {
  // Crop the supplied 1024×1024 LOGO.jpeg to show just the gold mark
  // (top ~45% of the image — where the circle + A glyph sits) and pair
  // it with a clean "AUMOXO" wordmark + "THINK INFINITE" tagline beside.
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-3 group ${className}`}
      aria-label="AUMOXO home"
    >
      <span className="relative block h-11 w-11 lg:h-12 lg:w-12 overflow-hidden rounded-md">
        {/* Dark mode — let the JPEG's black bg blend into the page */}
        <Image
          src="/logo.jpeg"
          alt=""
          width={120}
          height={120}
          priority
          className="hidden dark:block h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
          style={{ objectPosition: "center 22%", mixBlendMode: "lighten" }}
        />
        {/* Light mode — show as a branded mini card with subtle shadow */}
        <Image
          src="/logo.jpeg"
          alt=""
          width={120}
          height={120}
          priority
          className="dark:hidden h-full w-full object-cover shadow-[0_2px_6px_rgba(0,0,0,0.15)] transition-transform duration-300 group-hover:scale-[1.05]"
          style={{ objectPosition: "center 22%" }}
        />
      </span>

      <span className="flex flex-col leading-none">
        <span className="text-[19px] font-semibold tracking-[0.18em] text-ink-100 whitespace-nowrap">
          AUMOXO
        </span>
        <span className="mt-1 text-[9px] tracking-[0.35em] uppercase text-gold-600 dark:text-gold-400/85">
          Think Infinite
        </span>
      </span>
    </Link>
  );
}
