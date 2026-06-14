import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clientsDb, invoicesDb, paymentsDb, invoiceTotal } from "@/lib/admin/db";
import { verifyClientToken, CLIENT_COOKIE } from "@/lib/admin/auth";
import { createOrder, razorpayEnabled, razorpayKeyId } from "@/lib/admin/razorpay";

/** Client starts paying an invoice — creates a Razorpay order for the amount due. */
export async function POST(req: Request) {
  const c = await cookies();
  const r = await verifyClientToken(c.get(CLIENT_COOKIE)?.value);
  if (!r.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const client = await clientsDb.findById(r.clientId);
  if (!client || !client.active) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!razorpayEnabled()) {
    return NextResponse.json({ error: "Online payments aren't enabled yet." }, { status: 503 });
  }

  const { invoiceId } = (await req.json()) as { invoiceId?: string };
  const invoices = await invoicesDb.list();
  const inv = invoices.find((i) => i.id === invoiceId && i.clientId === client.id && i.status !== "draft");
  if (!inv) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  if (inv.status === "paid") return NextResponse.json({ error: "This invoice is already paid." }, { status: 400 });

  const total = invoiceTotal(inv);
  const paid = (await paymentsDb.listByInvoice(inv.id)).reduce((s, p) => s + p.amount, 0);
  const outstanding = Math.round(Math.max(0, total - paid) * 100) / 100;
  if (outstanding <= 0) return NextResponse.json({ error: "Nothing is due on this invoice." }, { status: 400 });

  const currency = (inv.currency || "INR").toUpperCase();
  try {
    const order = await createOrder(Math.round(outstanding * 100), currency, inv.number, {
      invoiceId: inv.id,
      invoiceNumber: inv.number,
      clientId: client.id,
    });
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency,
      keyId: razorpayKeyId(),
      invoiceNumber: inv.number,
      name: client.company,
      email: client.email,
    });
  } catch (e) {
    console.error("[pay/order]", e);
    return NextResponse.json({ error: "Couldn't start the payment. Please try again." }, { status: 502 });
  }
}
