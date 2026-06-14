import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/guard";
import { logActorAction } from "@/lib/admin/audit";
import { sendBroadcastEmail, emailEnabled } from "@/lib/admin/email";
import { sentEmailsDb } from "@/lib/admin/db";

/**
 * Broadcast composer — send an email to one or more selected recipients.
 * Available to ANY admin (normal or main). Each recipient is emailed
 * individually so addresses are never exposed to one another.
 */
export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!emailEnabled()) {
    return NextResponse.json({ error: "Email isn't configured (RESEND_API_KEY missing)." }, { status: 503 });
  }

  const { subject, message, emails } = (await req.json()) as {
    subject?: string;
    message?: string;
    emails?: string[];
  };

  if (!subject?.trim()) return NextResponse.json({ error: "Subject is required" }, { status: 400 });
  if (!message?.trim()) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  // De-dupe + validate, cap to a sane batch size per send
  const valid = Array.from(
    new Set((emails || []).map((e) => String(e).trim().toLowerCase()).filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)))
  ).slice(0, 500);

  if (valid.length === 0) {
    return NextResponse.json({ error: "Select at least one recipient" }, { status: 400 });
  }

  let sent = 0;
  let failed = 0;
  for (const to of valid) {
    const ok = await sendBroadcastEmail(to, subject.trim().slice(0, 200), message.slice(0, 10000));
    ok ? sent++ : failed++;
  }

  const actorName = guard.role === "admin" ? guard.name || "Admin" : "Owner";
  await logActorAction(guard.role, actorName, "broadcast", "email", `Sent "${subject.trim().slice(0, 80)}" to ${sent} recipient(s)${failed ? ` (${failed} failed)` : ""}`);

  // Record in sent history so it can be reused / edited / resent
  await sentEmailsDb.push({
    subject: subject.trim().slice(0, 200),
    message: message.slice(0, 10000),
    emails: valid,
    sent,
    failed,
    sentByType: guard.role,
    sentByName: actorName,
  });

  return NextResponse.json({ ok: true, sent, failed, total: valid.length });
}
