import { useEffect, useRef } from "react";

/**
 * Lightweight live refresh: calls `fn` on an interval, but only while the tab
 * is visible (so backgrounded tabs don't hammer the server), and immediately
 * when the user switches back to the tab. Keeps portals/dashboards up to date
 * without anyone hitting refresh.
 */
export function usePoll(fn: () => void, ms = 15000, enabled = true) {
  const saved = useRef(fn);
  saved.current = fn;

  useEffect(() => {
    if (!enabled) return;
    const run = () => { if (typeof document === "undefined" || document.visibilityState === "visible") saved.current(); };
    const id = setInterval(run, ms);
    const onVisible = () => { if (document.visibilityState === "visible") saved.current(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", onVisible); };
  }, [ms, enabled]);
}
