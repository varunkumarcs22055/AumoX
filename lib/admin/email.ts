/**
 * Transactional email via Resend (domain aumoxo.tech verified).
 * Every sender is best-effort: a mail failure must never break the underlying
 * operation, so all calls are wrapped and never throw.
 *
 * Needs RESEND_API_KEY. From address comes from CONTACT_EMAIL_FROM
 * (e.g. "AUMOXO <hello@aumoxo.tech>"), defaulting to hello@aumoxo.tech.
 */
import { Resend } from "resend";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aumoxo.tech";
const HOST = SITE.replace(/^https?:\/\//, "");
const FROM = process.env.CONTACT_EMAIL_FROM ?? "AUMOXO <hello@aumoxo.tech>";

export const emailEnabled = () => !!process.env.RESEND_API_KEY;

const esc = (s: string) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function send(to: string, subject: string, html: string, replyTo?: string): Promise<boolean> {
  if (!emailEnabled()) return false;
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({ from: FROM, to, subject, html, ...(replyTo ? { replyTo } : {}) });
    return true;
  } catch (e) {
    console.error("[email] send failed:", e);
    return false;
  }
}

function frame(heading: string, body: string, foot = "AUMOXO · aumoxo.tech · hello@aumoxo.tech") {
  return `
  <div style="font-family:Inter,Segoe UI,system-ui,sans-serif;background:#000;color:#fafafa;padding:32px">
    <div style="max-width:560px;margin:auto;background:#0a0a0a;border:1px solid rgba(212,175,55,.25);border-radius:16px;overflow:hidden">
      <div style="padding:28px 32px;text-align:center;background:linear-gradient(135deg,#F0DDA0,#D4AF37,#B8941F);color:#000">
        <div style="font-weight:300;font-size:26px;letter-spacing:.28em">AUMOX<span style="font-weight:600">O</span></div>
        <div style="font-size:10px;letter-spacing:.4em;text-transform:uppercase;margin-top:4px">Think Infinite</div>
      </div>
      <div style="padding:32px">
        <h1 style="font-size:20px;font-weight:500;margin:0 0 16px;color:#fafafa">${heading}</h1>
        ${body}
      </div>
      <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,.06);font-size:11px;color:#71717a">${foot}</div>
    </div>
  </div>`;
}

const btn = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;margin-top:8px;padding:12px 24px;border-radius:999px;background:linear-gradient(135deg,#F0DDA0,#D4AF37,#B8941F);color:#000;font-weight:600;text-decoration:none">${label}</a>`;

const p = (t: string) => `<p style="font-size:15px;line-height:1.7;color:#a1a1aa;font-weight:300;margin:0 0 14px">${t}</p>`;

/**
 * Send one broadcast/campaign email (admin composer). Wraps the plain-text
 * message in the branded shell, preserving paragraphs and line breaks. Returns
 * whether it sent. Recipients are emailed individually by the caller so no one
 * sees anyone else's address.
 */
export async function sendBroadcastEmail(to: string, subject: string, message: string, replyTo?: string) {
  const body = message
    .split(/\n{2,}/)
    .filter((para) => para.trim())
    .map((para) => p(esc(para).replace(/\n/g, "<br>")))
    .join("");
  return send(to, subject, frame(subject, body || p(esc(message))), replyTo || "hello@aumoxo.tech");
}

/** Welcome email with portal access for a new client. */
export async function sendClientWelcome(client: { company: string; name?: string; email: string }, password: string) {
  const first = client.name?.split(" ")[0] || client.company;
  const body =
    p(`Hi ${esc(first)},`) +
    p(`Your AUMOXO client portal is ready. You can track your project's progress, view quotations and invoices, download deliverables and message our team — all in one place.`) +
    `<div style="background:#000;border:1px solid rgba(212,175,55,.25);border-radius:12px;padding:18px;margin:6px 0 18px">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.15em;color:#71717a">Your AUMOXO portal login</div>
      <div style="font-size:14px;color:#fafafa;margin-top:8px">Portal: <b style="color:#E5C76B">${HOST}/client</b></div>
      <div style="font-size:14px;color:#fafafa;margin-top:4px">Email: <b>${esc(client.email)}</b></div>
      <div style="font-size:14px;color:#fafafa;margin-top:4px">Temporary password: <b style="color:#E5C76B">${esc(password)}</b></div>
    </div>` +
    p(`For your security, please sign in and change your password from the portal.`) +
    btn(`${SITE}/client`, "Open your portal →");
  return send(client.email, "Welcome to AUMOXO — your client portal is ready", frame("Your portal is ready", body));
}

/** Welcome email for a new employee — staff workspace access + credentials. */
export async function sendEmployeeWelcome(emp: { name: string; email: string; designation?: string }, password: string) {
  const first = emp.name?.split(" ")[0] || emp.name;
  const body =
    p(`Hi ${esc(first)},`) +
    p(`Welcome to the AUMOXO team${emp.designation ? ` as <b style="color:#fafafa">${esc(emp.designation)}</b>` : ""}! Your staff workspace is ready — clock in/out, manage your tasks, request leave, view payslips and the things issued to you, all in one place.`) +
    `<div style="background:#000;border:1px solid rgba(212,175,55,.25);border-radius:12px;padding:18px;margin:6px 0 18px">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.15em;color:#71717a">Your AUMOXO workspace login</div>
      <div style="font-size:14px;color:#fafafa;margin-top:8px">Workspace: <b style="color:#E5C76B">${HOST}/emp</b></div>
      <div style="font-size:14px;color:#fafafa;margin-top:4px">Email: <b>${esc(emp.email)}</b></div>
      <div style="font-size:14px;color:#fafafa;margin-top:4px">Temporary password: <b style="color:#E5C76B">${esc(password)}</b></div>
    </div>` +
    p(`Please sign in and change your password from the workspace. Glad to have you with us. 🚀`) +
    btn(`${SITE}/emp`, "Open your workspace →");
  return send(emp.email, "Welcome to AUMOXO — your workspace is ready", frame("Welcome aboard", body));
}

/** Internal notice to the team inbox (hello@aumoxo.tech). */
export async function notifyTeam(subject: string, lines: string[]) {
  const to = process.env.CONTACT_EMAIL_TO ?? "hello@aumoxo.tech";
  return send(to, subject, frame(subject, lines.map((l) => p(l)).join("")));
}

/** Friendly thank-you to a new newsletter subscriber. */
export async function sendSubscriberWelcome(email: string) {
  const body =
    p(`Thanks for subscribing to AUMOXO. 🎉`) +
    p(`You'll get our practical reads on AI, automation, CRM and building software that actually moves the needle — written for people running real businesses, not for other consultants.`) +
    btn(`${SITE}/insights`, "Read our insights →");
  return send(email, "You're subscribed — welcome to AUMOXO", frame("Welcome to AUMOXO", body));
}

/** New quotation awaiting the client's review. */
export async function sendQuotationEmail(client: { company: string; email: string }, q: { number: string; currency: string; total: number; projectName?: string }) {
  const body =
    p(`A new quotation is ready for your review${q.projectName ? ` for <b style="color:#fafafa">${esc(q.projectName)}</b>` : ""}.`) +
    `<div style="background:#000;border:1px solid rgba(212,175,55,.25);border-radius:12px;padding:18px;margin:6px 0 18px">
      <div style="font-size:14px;color:#fafafa">Quotation <b>${esc(q.number)}</b></div>
      <div style="font-size:22px;color:#E5C76B;font-weight:600;margin-top:6px">${q.currency} ${q.total.toLocaleString()}</div>
    </div>` +
    p(`You can accept or decline it directly in your portal.`) +
    btn(`${SITE}/client`, "Review quotation →");
  return send(client.email, `Quotation ${q.number} from AUMOXO`, frame("New quotation for you", body));
}

/** Invoice issued. */
export async function sendInvoiceEmail(client: { company: string; email: string }, inv: { number: string; currency: string; total: number; dueDate?: string }) {
  const body =
    p(`A new invoice has been issued to ${esc(client.company)}.`) +
    `<div style="background:#000;border:1px solid rgba(212,175,55,.25);border-radius:12px;padding:18px;margin:6px 0 18px">
      <div style="font-size:14px;color:#fafafa">Invoice <b>${esc(inv.number)}</b>${inv.dueDate ? ` · due ${esc(inv.dueDate)}` : ""}</div>
      <div style="font-size:22px;color:#E5C76B;font-weight:600;margin-top:6px">${inv.currency} ${inv.total.toLocaleString()}</div>
    </div>` +
    p(`View the full invoice and payment details in your portal.`) +
    btn(`${SITE}/client`, "View invoice →");
  return send(client.email, `Invoice ${inv.number} from AUMOXO`, frame("New invoice", body));
}

/** Payment received confirmation. */
export async function sendPaymentReceipt(client: { company: string; email: string }, payment: { currency: string; amount: number; method: string }, invoiceNumber: string) {
  const body =
    p(`We've recorded your payment — thank you.`) +
    `<div style="background:#000;border:1px solid rgba(34,197,94,.3);border-radius:12px;padding:18px;margin:6px 0 18px">
      <div style="font-size:22px;color:#86efac;font-weight:600">${payment.currency} ${payment.amount.toLocaleString()}</div>
      <div style="font-size:13px;color:#a1a1aa;margin-top:6px">For invoice <b style="color:#fafafa">${esc(invoiceNumber)}</b> · ${esc(payment.method)}</div>
    </div>` +
    p(`A full history is always available in your portal.`) +
    btn(`${SITE}/client`, "Open portal →");
  return send(client.email, `Payment received — ${invoiceNumber}`, frame("Payment received", body));
}
