import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { queriesDb, notificationsDb } from "@/lib/admin/db";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  company: z.string().max(160).optional(),
  phone: z.string().max(40).optional(),
  service: z.string().min(1).max(120),
  timeline: z.string().max(60).optional(),
  budget: z.string().max(60).optional(),
  message: z.string().min(10).max(5000),
  hp: z.string().max(0).optional(),
});

// naive in-memory rate limit (per Node process)
const hits = new Map<string, { count: number; reset: number }>();
function rateLimit(ip: string, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    hits.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Try again in a minute." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form fields." },
      { status: 400 }
    );
  }
  const data = parsed.data;

  // Honeypot — silently accept but don't send / don't save
  if (data.hp && data.hp.length > 0) {
    return NextResponse.json({ ok: true });
  }

  // 1) Persist to admin DB (visible in /admin/queries)
  try {
    await queriesDb.add({
      name: data.name,
      email: data.email,
      company: data.company,
      phone: data.phone,
      service: data.service,
      timeline: data.timeline,
      budget: data.budget,
      message: data.message,
    });
  } catch (err) {
    console.error("[AUMOXO contact] DB save failed:", err);
    // Continue anyway — email is still useful
  }

  // Event feed: new lead lands in the admin alerts
  try {
    await notificationsDb.push({
      audience: "admin",
      type: "lead",
      message: `New inquiry from ${data.name}${data.company ? ` (${data.company})` : ""} — ${data.service}`,
      link: "/admin/queries",
    });
  } catch (err) {
    console.error("[AUMOXO contact] notification failed:", err);
  }

  const to = process.env.CONTACT_EMAIL_TO ?? "hello@aumoxo.tech";
  const from = process.env.CONTACT_EMAIL_FROM ?? "onboarding@resend.dev";
  const apiKey = process.env.RESEND_API_KEY;

  // If no API key configured, log + accept (so the UI doesn't break in dev)
  if (!apiKey) {
    console.warn(
      "[AUMOXO contact] RESEND_API_KEY not set. Submission logged but not emailed:",
      data
    );
    return NextResponse.json({
      ok: true,
      note: "Saved (no email sent — set RESEND_API_KEY).",
    });
  }

  try {
    const resend = new Resend(apiKey);

    // 1) Notify the team
    await resend.emails.send({
      from: `AUMOXO Website <${from}>`,
      to,
      replyTo: data.email,
      subject: `New inquiry · ${data.service} · ${data.name}`,
      html: notifyHtml(data),
    });

    // 2) Auto-reply to the visitor
    await resend.emails.send({
      from: `AUMOXO <${from}>`,
      to: data.email,
      subject: "We've received your message — AUMOXO",
      html: autoReplyHtml(data),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[AUMOXO contact] Resend error:", err);
    return NextResponse.json(
      { error: "Email service unavailable. Please try again later." },
      { status: 502 }
    );
  }
}

function notifyHtml(d: z.infer<typeof schema>) {
  const row = (k: string, v?: string) =>
    v
      ? `<tr><td style="padding:8px 12px;color:#71717a;font-size:12px;text-transform:uppercase;letter-spacing:.1em;width:140px;vertical-align:top">${k}</td><td style="padding:8px 12px;color:#fafafa;font-size:14px">${escapeHtml(v)}</td></tr>`
      : "";
  return `
  <div style="font-family:Inter,system-ui,sans-serif;background:#000;color:#fafafa;padding:32px">
    <div style="max-width:640px;margin:auto;background:#0a0a0a;border:1px solid rgba(212,175,55,.2);border-radius:16px;overflow:hidden">
      <div style="padding:24px;background:linear-gradient(135deg,#F0DDA0,#D4AF37,#B8941F);color:#000">
        <div style="font-size:11px;letter-spacing:.3em;text-transform:uppercase">AUMOXO · New Inquiry</div>
        <div style="font-size:22px;margin-top:6px;font-weight:300">${escapeHtml(d.name)} from ${escapeHtml(d.company || "—")}</div>
      </div>
      <table style="width:100%;border-collapse:collapse;padding:16px">
        ${row("Name", d.name)}
        ${row("Email", d.email)}
        ${row("Company", d.company)}
        ${row("Phone", d.phone)}
        ${row("Service", d.service)}
        ${row("Timeline", d.timeline)}
        ${row("Budget", d.budget)}
      </table>
      <div style="padding:0 24px 24px">
        <div style="font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px">Message</div>
        <div style="background:#000;border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:16px;font-size:14px;line-height:1.6;white-space:pre-wrap">${escapeHtml(d.message)}</div>
      </div>
      <div style="padding:16px 24px;border-top:1px solid rgba(255,255,255,.06);font-size:11px;color:#52525b">
        Sent from aumoxo.tech · Reply directly to respond to ${escapeHtml(d.name)}.
      </div>
    </div>
  </div>`;
}

function autoReplyHtml(d: z.infer<typeof schema>) {
  return `
  <div style="font-family:Inter,system-ui,sans-serif;background:#000;color:#fafafa;padding:32px">
    <div style="max-width:560px;margin:auto;background:#0a0a0a;border:1px solid rgba(212,175,55,.2);border-radius:16px;overflow:hidden">
      <div style="padding:32px;text-align:center;background:linear-gradient(135deg,#F0DDA0,#D4AF37,#B8941F);color:#000">
        <div style="font-weight:300;font-size:28px;letter-spacing:.28em">AUMOX<span style="font-weight:500">O</span></div>
        <div style="font-size:10px;letter-spacing:.4em;text-transform:uppercase;margin-top:4px">Think Infinite</div>
      </div>
      <div style="padding:32px">
        <p style="font-size:16px;line-height:1.6;color:#fafafa;margin:0 0 16px">Hi ${escapeHtml(d.name.split(" ")[0] || d.name)},</p>
        <p style="font-size:15px;line-height:1.7;color:#a1a1aa;font-weight:300">
          Thanks for reaching out to AUMOXO. We've received your message about
          <strong style="color:#fafafa;font-weight:500">${escapeHtml(d.service)}</strong>
          and a specialist will respond within one working day.
        </p>
        <p style="font-size:15px;line-height:1.7;color:#a1a1aa;font-weight:300;margin-top:16px">
          In the meantime, feel free to explore our services and product platforms.
        </p>
        <div style="margin-top:24px;padding-top:24px;border-top:1px solid rgba(255,255,255,.06);font-size:13px;color:#71717a">
          Regards,<br>
          <span style="color:#D4AF37">The AUMOXO team</span>
        </div>
      </div>
    </div>
  </div>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
