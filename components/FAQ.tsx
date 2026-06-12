"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export type FAQItem = { q: string; a: string };

/** Smooth accordion — pairs with FAQPage JSON-LD for Google rich results. */
export default function FAQ({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line rounded-2xl border border-line overflow-hidden">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="bg-bg-base">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-6 p-6 lg:p-7 text-left group"
              aria-expanded={isOpen}
            >
              <span className={`text-lg font-light transition-colors ${isOpen ? "text-gold-300" : "text-ink-100 group-hover:text-gold-300"}`}>
                {item.q}
              </span>
              <Plus
                size={20}
                className={`shrink-0 text-gold-400 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
              />
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="px-6 lg:px-7 pb-6 lg:pb-7 text-ink-300 font-light leading-relaxed max-w-3xl">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
