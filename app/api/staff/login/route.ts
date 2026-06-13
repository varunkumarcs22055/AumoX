import { NextResponse } from "next/server";
import { z } from "zod";
import { employeesDb } from "@/lib/admin/db";
import {
  createStaffToken,
  verifyPassword,
  STAFF_COOKIE,
  STAFF_TTL_SECONDS,
} from "@/lib/admin/auth";
import { logActorAction } from "@/lib/admin/audit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

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
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
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

  const emp = await employeesDb.findByEmail(parsed.data.email);
  const fail = () =>
    NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
  if (!emp || !emp.active) return fail();
  if (!(await verifyPassword(parsed.data.password, emp.passwordHash))) return fail();

  const token = await createStaffToken(emp.id);
  await logActorAction("staff", emp.name, "login", "session", `${emp.name} signed in to the staff workspace`);
  const res = NextResponse.json({ ok: true, employee: { name: emp.name } });
  res.cookies.set(STAFF_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: STAFF_TTL_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
