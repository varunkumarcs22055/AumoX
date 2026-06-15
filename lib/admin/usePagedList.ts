import { useEffect, useMemo, useState } from "react";

/**
 * Generic client-side search + pagination for admin lists.
 *
 * - `query` is matched as multiple AND terms against the string returned by
 *   `getText(item)` (case-insensitive), so "prakhar ui" matches a row whose
 *   text contains both words in any order.
 * - Define `getText` at module scope (stable reference) so filtering only
 *   recomputes when the items or query actually change.
 * - The page auto-resets to 1 whenever the query changes and clamps itself if
 *   the list shrinks below the current page (e.g. after a delete).
 *
 * Returns the current page's slice plus everything a pager needs, and the full
 * `filtered` array so callers can still do "select all matches".
 */
export function usePagedList<T>(
  items: T[],
  query: string,
  getText: (item: T) => string,
  pageSize = 8,
) {
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    const terms = q.split(/\s+/).filter(Boolean);
    return items.filter((it) => {
      const hay = getText(it).toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [items, query, getText]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Reset to the first page on a new search.
  useEffect(() => { setPage(1); }, [query]);
  // Keep the page in range if the underlying list shrinks.
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const start = total === 0 ? 0 : (page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  return {
    page,
    setPage,
    totalPages,
    total,
    pageItems,
    filtered,
    /** 1-based index of the first row on the page (0 when empty). */
    from: total === 0 ? 0 : start + 1,
    /** 1-based index of the last row on the page. */
    to: start + pageItems.length,
  };
}
