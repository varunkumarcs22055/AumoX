"use client";

import { useState } from "react";
import { Loader2, Lock, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { LogoMark } from "@/components/Logo";

/**
 * Forced first-login password change. Shows as a blocking modal when the
 * account was created (or reset) by an admin — the temporary password was
 * emailed, so we require the person to set their own before continuing.
 * Calls the given endpoint with { current, next } and clears the server-side
 * mustChangePassword flag; onDone refreshes the page's data.
 */
export default function FirstLoginPasswordGate({
  open,
  endpoint,
  onDone,
  context,
}: {
  open: boolean;
  endpoint: string;
  onDone: () => void | Promise<void>;
  context: "portal" | "workspace";
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  if (!open) return null;

  async function submit() {
    setErr("");
    if (!current) { setErr("Enter the temporary password from your welcome email."); return; }
    if (next.length < 8) { setErr("Your new password must be at least 8 characters."); return; }
    if (next !== confirm) { setErr("The new passwords don't match."); return; }
    if (next === current) { setErr("Please choose a password different from the temporary one."); return; }
    setSaving(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(data.error ?? "Couldn't update your password. Please try again."); return; }
      await onDone();
    } finally {
      setSaving(false);
    }
  }

  const where = context === "portal" ? "client portal" : "workspace";
  const type = show ? "text" : "password";

  return (
    <div className="modal-backdrop fixed inset-0 z-[100] grid place-items-center bg-black/85 backdrop-blur-md p-4">
      <div className="modal-card w-full max-w-md card gold-border p-7 sm:p-8">
        <div className="flex items-center gap-3">
          <LogoMark size={38} />
          <div>
            <div className="text-sm font-medium tracking-wider text-ink-100">AUMOXO</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-gold-400">Secure your account</div>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-gold-400/25 bg-gold-400/5 p-4">
          <ShieldCheck size={18} className="text-gold-400 shrink-0 mt-0.5" />
          <p className="text-sm text-ink-200 font-light leading-relaxed">
            Welcome! We emailed you a temporary password to sign in. For your security,
            please set your own password before you continue to your {where}.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="block text-[11px] uppercase tracking-[0.25em] text-ink-300 mb-2">Temporary password</span>
            <input
              type={type}
              className="input"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
              placeholder="From your welcome email"
            />
          </label>
          <label className="block">
            <span className="block text-[11px] uppercase tracking-[0.25em] text-ink-300 mb-2">New password (8+ chars)</span>
            <div className="relative">
              <input
                type={type}
                className="input pr-11"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-gold-300"
                aria-label={show ? "Hide passwords" : "Show passwords"}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>
          <label className="block">
            <span className="block text-[11px] uppercase tracking-[0.25em] text-ink-300 mb-2">Confirm new password</span>
            <input
              type={type}
              className="input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            />
          </label>
        </div>

        {err && <p className="mt-4 text-sm text-red-400">{err}</p>}

        <button
          onClick={submit}
          disabled={saving}
          className="btn-gold w-full mt-6 !py-3 disabled:opacity-60"
        >
          {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Lock size={16} /> Set my password & continue</>}
        </button>
      </div>
    </div>
  );
}
