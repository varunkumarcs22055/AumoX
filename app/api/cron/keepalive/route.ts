import { NextResponse } from "next/server";
import { pgPing } from "@/lib/admin/pg";

// Daily Vercel Cron hit. A trivial query keeps free Postgres projects (Supabase)
// from auto-pausing after a week of inactivity, and warms the Neon standby.
// Vercel sends `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is set.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  const db = await pgPing();
  return NextResponse.json({ ok: true, db, at: new Date().toISOString() });
}
