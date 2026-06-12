"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, AlertCircle, Loader2, Mail } from "lucide-react";
import { LogoMark } from "@/components/Logo";

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, email: email.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed");
        setLoading(false);
        return;
      }
      const from = search.get("from") || "/admin";
      router.push(from);
    } catch {
      setError("Network error. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-base text-ink-100 grid place-items-center px-6 hero-gradient">
      <div className="w-full max-w-md card p-10 gold-border">
        <div className="flex items-center gap-3 justify-center">
          <LogoMark size={48} />
        </div>
        <div className="text-center mt-5 text-[11px] uppercase tracking-[0.35em] text-gold-400">Admin Console</div>
        <h1 className="mt-3 text-center font-display text-3xl font-extralight text-ink-100">Sign in</h1>
        <p className="mt-2 text-center text-sm text-ink-300 font-light">
          Restricted area · staff only
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="block text-[11px] uppercase tracking-[0.25em] text-ink-300 mb-2">
              Admin email <span className="text-ink-500 normal-case tracking-normal">(owner: leave empty)</span>
            </span>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-400/70" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-11"
                placeholder="Only for team admin accounts"
                autoComplete="username"
              />
            </div>
          </label>
          <label className="block">
            <span className="block text-[11px] uppercase tracking-[0.25em] text-ink-300 mb-2">Password</span>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-400/70" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-11"
                placeholder="Enter admin password"
                autoFocus
                required
              />
            </div>
          </label>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full disabled:opacity-60"
          >
            {loading ? (<><Loader2 size={16} className="animate-spin" /> Signing in…</>) : "Sign in"}
          </button>
        </form>

        <div className="mt-8 text-center text-[10px] text-ink-400 tracking-[0.2em] uppercase">
          AUMOXO · Think Infinite
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-base" />}>
      <LoginInner />
    </Suspense>
  );
}
