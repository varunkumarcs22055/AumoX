"use client";

import { usePathname } from "next/navigation";

/**
 * Smooth page-to-page transition.
 * Keying the wrapper by pathname remounts the page subtree on every navigation,
 * which replays the CSS enter animation (`.page-transition` in globals.css).
 * Navbar / Footer / Chatbot live outside this wrapper so they stay put and only
 * the page content cross-fades — giving a smooth, premium route change.
 */
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Admin/portal shells use sticky/fixed positioning, which a transformed
  // wrapper would break — skip the transition there.
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/portal")) return <>{children}</>;
  return (
    <div key={pathname} className="page-transition">
      {children}
    </div>
  );
}
