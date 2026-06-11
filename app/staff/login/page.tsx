"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/Logo";

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed. Please try again.");
        return;
      }
      router.push("/staff");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-base grid place-items-center px-6 hero-gradient">
      <div className="absolute inset-0 grid-overlay opacity-40" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-grid place-items-center">
            <LogoMark size={72} />
          </div>
          <h1 className="mt-4 font-display text-3xl font-extralight text-ink-100">
            Staff Workspace
          </h1>
          <p className="mt-2 text-sm text-ink-300 font-light">
            Tasks, attendance, leave and payslips — one place.
          </p>
        </div>

        <form onSubmit={onSubmit} className="card p-8 gold-border space-y-5">
          <label className="block">
            <span className="block text-[11px] uppercase tracking-[0.25em] text-ink-300 mb-2">
              Work email
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              className="input"
              placeholder="you@aumoxo.tech"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="block text-[11px] uppercase tracking-[0.25em] text-ink-300 mb-2">
              Password
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Signing in…
              </>
            ) : (
              <>
                <Lock size={15} /> Sign in <ArrowRight size={15} />
              </>
            )}
          </button>

          <p className="text-xs text-ink-400 font-light text-center pt-2">
            Accounts are created by the AUMOXO admin.
          </p>
        </form>
      </div>
    </div>
  );
}
