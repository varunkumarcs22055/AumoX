/**
 * Printable business documents (invoice / quotation) — client-side only.
 * Opens a branded A4 document in a new window and triggers the print
 * dialog, which doubles as "Save as PDF" in every modern browser.
 */

export type PrintItem = { description: string; qty: number; rate: number };

export type PrintDoc = {
  kind: "INVOICE" | "QUOTATION";
  number: string;
  issueDate: string;
  dueDate?: string;       // invoices
  validUntil?: string;    // quotations
  status?: string;        // "paid" stamps the doc
  billTo: { company: string; name?: string; email?: string };
  projectName?: string;
  currency: string;
  items: PrintItem[];
  taxPercent?: number;
  discountPercent?: number;
  notes?: string;         // invoice notes / quotation terms
  bankDetails?: string;
};

const sym = (c: string) => (c === "INR" ? "₹" : c === "USD" ? "$" : c === "EUR" ? "€" : c + " ");
const money = (cur: string, n: number) =>
  `${sym(cur)}${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function fmtDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

export function printDocument(doc: PrintDoc) {
  const subtotal = doc.items.reduce((s, it) => s + (it.qty || 0) * (it.rate || 0), 0);
  const discount = subtotal * ((doc.discountPercent || 0) / 100);
  const taxable = subtotal - discount;
  const tax = taxable * ((doc.taxPercent || 0) / 100);
  const total = Math.round((taxable + tax) * 100) / 100;
  const isPaid = doc.status === "paid";

  const rows = doc.items
    .filter((it) => it.description?.trim())
    .map(
      (it, i) => `
      <tr>
        <td class="muted">${String(i + 1).padStart(2, "0")}</td>
        <td>${esc(it.description)}</td>
        <td class="num">${it.qty}</td>
        <td class="num">${money(doc.currency, it.rate)}</td>
        <td class="num">${money(doc.currency, it.qty * it.rate)}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${doc.kind} ${esc(doc.number)} — AUMOXO</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background: #fff; padding: 48px 56px; font-size: 13px; line-height: 1.5; }
  .top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #c9a227; padding-bottom: 24px; }
  .brand { font-size: 26px; letter-spacing: 8px; font-weight: 300; }
  .brand small { display: block; font-size: 9px; letter-spacing: 4px; color: #c9a227; margin-top: 4px; }
  .doctype { text-align: right; }
  .doctype h1 { font-size: 22px; font-weight: 300; letter-spacing: 6px; color: #555; }
  .doctype .no { font-size: 14px; margin-top: 6px; font-weight: 600; }
  .stamp { display: inline-block; margin-top: 8px; padding: 3px 14px; border: 2px solid ${isPaid ? "#1c8a43" : "#c9a227"}; color: ${isPaid ? "#1c8a43" : "#946f00"}; font-size: 11px; letter-spacing: 3px; font-weight: 700; border-radius: 4px; }
  .meta { display: flex; justify-content: space-between; margin-top: 28px; gap: 24px; }
  .meta h3 { font-size: 9px; letter-spacing: 3px; color: #999; text-transform: uppercase; margin-bottom: 6px; }
  .meta .block { max-width: 50%; }
  .meta .right { text-align: right; }
  table { width: 100%; border-collapse: collapse; margin-top: 32px; }
  th { text-align: left; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #999; padding: 10px 8px; border-bottom: 2px solid #e5e5e5; }
  td { padding: 11px 8px; border-bottom: 1px solid #efefef; vertical-align: top; }
  .num { text-align: right; white-space: nowrap; }
  th.num { text-align: right; }
  .muted { color: #aaa; }
  .totals { margin-top: 18px; margin-left: auto; width: 280px; }
  .totals .row { display: flex; justify-content: space-between; padding: 5px 8px; }
  .totals .grand { border-top: 2px solid #c9a227; margin-top: 6px; padding-top: 10px; font-size: 17px; font-weight: 600; }
  .note { margin-top: 36px; padding: 16px 20px; background: #faf7ef; border-left: 3px solid #c9a227; white-space: pre-wrap; }
  .note h3 { font-size: 9px; letter-spacing: 3px; color: #946f00; text-transform: uppercase; margin-bottom: 6px; }
  .foot { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e5e5e5; display: flex; justify-content: space-between; font-size: 10px; color: #999; letter-spacing: 1px; }
  @media print { body { padding: 24px 28px; } }
</style>
</head>
<body>
  <div class="top">
    <div class="brand">AUMOXO<small>THINK INFINITE</small></div>
    <div class="doctype">
      <h1>${doc.kind}</h1>
      <div class="no">${esc(doc.number)}</div>
      ${isPaid ? `<span class="stamp">PAID</span>` : doc.kind === "QUOTATION" ? `<span class="stamp">${esc((doc.status || "").toUpperCase() || "QUOTE")}</span>` : ""}
    </div>
  </div>

  <div class="meta">
    <div class="block">
      <h3>${doc.kind === "INVOICE" ? "Billed to" : "Prepared for"}</h3>
      <strong>${esc(doc.billTo.company)}</strong><br/>
      ${doc.billTo.name ? esc(doc.billTo.name) + "<br/>" : ""}
      ${doc.billTo.email ? esc(doc.billTo.email) : ""}
      ${doc.projectName ? `<div style="margin-top:8px"><h3>Project</h3>${esc(doc.projectName)}</div>` : ""}
    </div>
    <div class="block right">
      <h3>Issued</h3>${fmtDate(doc.issueDate)}
      ${doc.dueDate ? `<h3 style="margin-top:10px">Payment due</h3>${fmtDate(doc.dueDate)}` : ""}
      ${doc.validUntil ? `<h3 style="margin-top:10px">Valid until</h3>${fmtDate(doc.validUntil)}` : ""}
    </div>
  </div>

  <table>
    <thead>
      <tr><th>#</th><th>Description</th><th class="num">Qty</th><th class="num">Rate</th><th class="num">Amount</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <div class="row"><span>Subtotal</span><span>${money(doc.currency, subtotal)}</span></div>
    ${discount > 0 ? `<div class="row"><span>Discount (${doc.discountPercent}%)</span><span>−${money(doc.currency, discount)}</span></div>` : ""}
    ${tax > 0 ? `<div class="row"><span>GST (${doc.taxPercent}%)</span><span>${money(doc.currency, tax)}</span></div>` : ""}
    <div class="row grand"><span>Total</span><span>${money(doc.currency, total)}</span></div>
  </div>

  ${doc.notes ? `<div class="note"><h3>${doc.kind === "INVOICE" ? "Notes" : "Terms"}</h3>${esc(doc.notes)}</div>` : ""}
  ${doc.bankDetails && !isPaid && doc.kind === "INVOICE" ? `<div class="note"><h3>Payment details</h3>${esc(doc.bankDetails)}</div>` : ""}

  <div class="foot">
    <span>AUMOXO · aumoxo.tech</span>
    <span>hello@aumoxo.tech</span>
    <span>Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
  </div>
  <script>window.onload = function(){ window.print(); };</script>
</body>
</html>`;

  const w = window.open("", "_blank", "width=900,height=1100");
  if (!w) {
    alert("Allow pop-ups to print this document.");
    return;
  }
  w.document.write(html);
  w.document.close();
}
