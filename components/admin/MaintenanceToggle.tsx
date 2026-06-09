"use client";

import { useEffect, useState } from "react";
import { Power, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function MaintenanceToggle() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/maintenance", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setEnabled(!!d.maintenance?.enabled);
        setMessage(d.maintenance?.message ?? "");
      })
      .catch(() => setEnabled(false));
  }, []);

  async function update(next: { enabled: boolean; message?: string }) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const d = await res.json();
      if (d.maintenance) {
        setEnabled(d.maintenance.enabled);
        setMessage(d.maintenance.message ?? "");
        setSaved(true);
        setTimeout(() => setSaved(false), 1800);
      }
    } finally {
      setSaving(false);
    }
  }

  function toggle() {
    if (enabled === null) return;
    if (!enabled) {
      if (
        !confirm(
          "Put the public site into MAINTENANCE mode? All visitors (except /admin) will see a placeholder page until you turn it off."
        )
      )
        return;
    }
    update({ enabled: !enabled, message });
  }

  function saveMessage() {
    if (enabled === null) return;
    update({ enabled, message });
  }

  if (enabled === null) {
    return (
      <div className="card p-6 text-sm text-ink-400 flex items-center gap-2">
        <Loader2 size={14} className="animate-spin" /> Loading maintenance status…
      </div>
    );
  }

  return (
    <div className={`card p-6 gold-border ${enabled ? "ring-2 ring-red-500/40" : ""}`}>
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="flex items-start gap-4">
          <div
            className={`grid h-12 w-12 place-items-center rounded-lg border ${
              enabled
                ? "border-red-500/60 bg-red-500/10 text-red-300"
                : "border-gold-400/30 bg-gold-400/5 text-gold-300"
            }`}
          >
            <Power size={20} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-ink-100">Maintenance Mode</h3>
            <p className="mt-1 text-sm text-ink-300 font-light max-w-md">
              {enabled
                ? "Public site is currently CLOSED. Visitors see the maintenance placeholder. Admin remains accessible."
                : "Public site is OPEN. Toggle on to take it down for updates."}
            </p>
          </div>
        </div>
        <button
          onClick={toggle}
          disabled={saving}
          className={`shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all disabled:opacity-60 ${
            enabled
              ? "bg-red-500 text-white hover:bg-red-600"
              : "btn-gold"
          }`}
        >
          {saving ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Updating…
            </>
          ) : enabled ? (
            <>
              <CheckCircle2 size={14} /> Bring site back online
            </>
          ) : (
            <>
              <AlertCircle size={14} /> Close site for maintenance
            </>
          )}
        </button>
      </div>

      <div className="mt-6 pt-5 border-t border-line">
        <label className="block">
          <span className="block text-[11px] uppercase tracking-[0.25em] text-ink-300 mb-2">
            Maintenance message (optional)
          </span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="We're updating the site — back in 30 minutes."
            className="input min-h-[80px] resize-y"
            maxLength={400}
          />
        </label>
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={saveMessage}
            disabled={saving}
            className="btn-ghost text-sm !py-2 !px-4"
          >
            Save message
          </button>
          {saved && <span className="text-sm text-green-400">Saved ✓</span>}
        </div>
      </div>
    </div>
  );
}
