import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken, AUTH_COOKIE, AUTH_TTL_SECONDS } from "@/lib/admin/auth";

const schema = z.object({ password: z.string().min(1).max(200) });

// IP-based rate limit (in-memory, per Node process)
// 5 attempts per 15-minute window. Locks the IP out for the rest of the window
// once exceeded — well-resourced brute force becomes infeasible.
const hits = new Map<string, { count: number; reset: number }>();
function rateLimit(ip: string, limit = 5, windowMs = 15 * 60_000) {
  const now = Date.now();
  const e = hits.get(ip);
  if (!e || e.reset < now) {
    hits.set(ip, { count: 1, reset: now + windowMs });
    return { ok: true, retryInSec: 0 };
  }
  if (e.count >= limit) {
    return { ok: false, retryInSec: Math.ceil((e.reset - now) / 1000) };
  }
  e.count += 1;
  return { ok: true, retryInSec: 0 };
}

// Constant-time string comparison (Edge-safe, no node:crypto)
function safeEqualStrings(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const rl = rateLimit(ip);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${Math.ceil(rl.retryInSec / 60)} min.` },
      { status: 429, headers: { "Retry-After": String(rl.retryInSec) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  const expected = process.env.ADMIN_PASSWORD || "aumox-admin";
  // Constant-time compare — no timing side-channel
  if (!safeEqualStrings(parsed.data.password, expected)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict", // hardened: no CSRF possible from another origin
    path: "/",
    maxAge: AUTH_TTL_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
