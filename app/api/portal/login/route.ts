import { NextResponse } from "next/server";
import { z } from "zod";
import { clientsDb } from "@/lib/admin/db";
import {
  createClientToken,
  verifyPassword,
  CLIENT_COOKIE,
  CLIENT_TTL_SECONDS,
} from "@/lib/admin/auth";
import { logActorAction } from "@/lib/admin/audit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

// IP rate limit — 8 attempts / 15 min (clients mistype more than admins)
const hits = new Map<string, { count: number; reset: number }>();
function rateLimit(ip: string, limit = 8, windowMs = 15 * 60_000) {
  const now = Date.now();
  const e = hits.get(ip);
  if (!e || e.reset < now) {
    hits.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }
  if (e.count >= limit) return false;
  e.count += 1;
  return true;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again in a few minutes." },
      { status: 429 }
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
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const client = await clientsDb.findByEmail(parsed.data.email);
  // Identical error for unknown email / wrong password / disabled account —
  // no information leaks about which clients exist.
  const fail = () =>
    NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });

  if (!client || !client.active) return fail();
  if (!(await verifyPassword(parsed.data.password, client.passwordHash))) return fail();

  const token = await createClientToken(client.id);
  await logActorAction("client", client.company, "login", "session", `Client ${client.company} signed in to the portal`);
  const res = NextResponse.json({
    ok: true,
    client: { company: client.company, name: client.name },
  });
  res.cookies.set(CLIENT_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: CLIENT_TTL_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
