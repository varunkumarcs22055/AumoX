"use client";

import React, { useCallback, useEffect, useRef } from "react";

/**
 * Calendly scheduling — popup button (hero) + inline embed (contact page).
 * The Calendly script + CSS are loaded ON DEMAND (only when a visitor opens the
 * popup or lands on a page with the embed), so they never weigh down first paint.
 */

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget(opts: { url: string }): void;
      initInlineWidget(opts: { url: string; parentElement: HTMLElement }): void;
    };
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/aumoxo/30min";
// Theme the widget to match the site (gold accent on a dark surface). Unsupported
// params are simply ignored by Calendly, so this is safe on any plan.
const THEME = "hide_gdpr_banner=1&background_color=0b0b0c&text_color=e6e6e9&primary_color=d4af37";
export const CALENDLY_URL = `${BASE_URL}?${THEME}`;

let loaderPromise: Promise<void> | null = null;

function loadCalendly(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Calendly) return Promise.resolve();
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise<void>((resolve, reject) => {
    // Stylesheet (popup overlay + widget chrome)
    if (!document.querySelector("link[data-calendly]")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://assets.calendly.com/assets/external/widget.css";
      link.setAttribute("data-calendly", "true");
      document.head.appendChild(link);
    }
    // Script
    const existing = document.querySelector("script[data-calendly]") as HTMLScriptElement | null;
    if (existing) {
      if (window.Calendly) resolve();
      else existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    script.setAttribute("data-calendly", "true");
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Calendly failed to load"));
    document.body.appendChild(script);
  });
  return loaderPromise;
}

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  url?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

/** Button that opens the Calendly scheduling popup. */
export function CalendlyButton({ children, className, url = CALENDLY_URL, ...rest }: ButtonProps) {
  const onClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      loadCalendly()
        .then(() => window.Calendly?.initPopupWidget({ url }))
        .catch(() => {
          // If the widget can't load (blocked/offline), fall back to the booking page.
          window.open(url, "_blank", "noopener,noreferrer");
        });
    },
    [url]
  );
  return (
    <button type="button" onClick={onClick} className={className} {...rest}>
      {children}
    </button>
  );
}

/** Full inline scheduling embed (contact page). */
export function CalendlyInline({ url = CALENDLY_URL, className = "", height = 700 }: { url?: string; className?: string; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    loadCalendly().then(() => {
      if (cancelled || !ref.current) return;
      ref.current.innerHTML = ""; // guard against double-init (React strict mode)
      window.Calendly?.initInlineWidget({ url, parentElement: ref.current });
    });
    return () => { cancelled = true; };
  }, [url]);

  return <div ref={ref} className={className} style={{ minWidth: 320, height }} aria-label="Calendly scheduling" />;
}
