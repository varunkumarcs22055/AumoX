import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createSessionToken,
  AUTH_COOKIE,
  AUTH_TTL_SECONDS,
  SUBADMIN_TTL_MS,
  verifyPassword,
} from "@/lib/admin/auth";
import { adminsDb } from "@/lib/admin/db";
import { logActorAction } from "@/lib/admin/audit";

// Two ways in: master password alone (super admin / owner), or
// email + password for a sub-admin account created by the owner.
const schema = z.object({
  password: z.string().min(1).max(200),
  email: z.string().email().max(160).optional().or(z.literal("")),
});

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

  // Identical error for every failure mode — leaks nothing about accounts
  const fail = () => NextResponse.json({ error: "Incorrect credentials" }, { status: 401 });

  let token: string;
  let maxAge = AUTH_TTL_SECONDS;
  let who: { role: "super" | "admin"; name?: string };

  if (parsed.data.email) {
    // Sub-admin login (account created by the owner)
    const account = await adminsDb.findByEmail(parsed.data.email);
    if (!account || !account.active) return fail();
    if (!(await verifyPassword(parsed.data.password, account.passwordHash))) return fail();
    token = await createSessionToken(SUBADMIN_TTL_MS, { role: "admin", sub: account.id });
    maxAge = Math.floor(SUBADMIN_TTL_MS / 1000);
    who = { role: "admin", name: account.name };
  } else {
    // Owner login — master password, constant-time compare
    const expected = process.env.ADMIN_PASSWORD || "aumox-admin";
    if (!safeEqualStrings(parsed.data.password, expected)) return fail();
    token = await createSessionToken(undefined, { role: "super" });
    who = { role: "super" };
  }

  await logActorAction(
    who.role,
    who.role === "admin" ? who.name || "Admin" : "Owner",
    "login",
    "session",
    `${who.role === "admin" ? `Sub-admin ${who.name}` : "Owner"} signed in to the admin panel`
  );

  const res = NextResponse.json({ ok: true, ...who });
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict", // hardened: no CSRF possible from another origin
    path: "/",
    maxAge,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
