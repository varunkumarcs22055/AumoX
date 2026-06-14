import { NextResponse } from "next/server";
import { z } from "zod";
import { subscribersDb, notificationsDb } from "@/lib/admin/db";

const schema = z.object({ email: z.string().email().max(160) });

// naive in-memory rate limit (per Node process)
const hits = new Map<string, { count: number; reset: number }>();
function rateLimit(ip: string, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  const e = hits.get(ip);
  if (!e || e.reset < now) { hits.set(ip, { count: 1, reset: now + windowMs }); return true; }
  if (e.count >= limit) return false;
  e.count += 1;
  return true;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }
  const added = await subscribersDb.add(parsed.data.email);
  if (added) {
    await notificationsDb.push({
      audience: "admin",
      type: "subscriber",
      message: `New newsletter subscriber: ${parsed.data.email}`,
      link: "/admin/email",
    });
  }
  // Always succeed (don't reveal whether the email was already subscribed)
  return NextResponse.json({ ok: true });
}
