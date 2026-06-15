"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

/** Windowed page list: 1 … (p-1) p (p+1) … N, collapsing with ellipses. */
function pageWindow(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const lo = Math.max(2, page - 1);
  const hi = Math.min(totalPages - 1, page + 1);
  if (lo > 2) out.push("…");
  for (let i = lo; i <= hi; i++) out.push(i);
  if (hi < totalPages - 1) out.push("…");
  out.push(totalPages);
  return out;
}

/**
 * Reusable pager + "showing X–Y of Z" summary for admin lists.
 * Renders nothing when there's nothing to show; shows only the summary when a
 * single page fits. Pair with usePagedList.
 */
export default function Pagination({
  page,
  totalPages,
  total,
  from,
  to,
  onPage,
  unit = "items",
}: {
  page: number;
  totalPages: number;
  total: number;
  from: number;
  to: number;
  onPage: (p: number) => void;
  unit?: string;
}) {
  if (total === 0) return null;

  return (
    <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
      <span className="text-xs text-ink-500">
        Showing <span className="text-ink-300">{from}–{to}</span> of <span className="text-ink-300">{total}</span> {unit}
      </span>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPage(page - 1)}
            disabled={page <= 1}
            className="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink-300 hover:text-gold-300 hover:border-gold-400/40 disabled:opacity-40 disabled:hover:text-ink-300 disabled:hover:border-line transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft size={15} />
          </button>

          {pageWindow(page, totalPages).map((p, i) =>
            p === "…" ? (
              <span key={`e${i}`} className="px-1.5 text-ink-500 select-none">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPage(p)}
                aria-current={p === page ? "page" : undefined}
                className={`min-w-8 h-8 px-2.5 rounded-lg border text-sm transition-colors ${
                  p === page
                    ? "border-gold-400 text-gold-300 bg-gold-400/10"
                    : "border-line text-ink-400 hover:text-gold-300 hover:border-gold-400/40"
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => onPage(page + 1)}
            disabled={page >= totalPages}
            className="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink-300 hover:text-gold-300 hover:border-gold-400/40 disabled:opacity-40 disabled:hover:text-ink-300 disabled:hover:border-line transition-colors"
            aria-label="Next page"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
