/**
 * Razorpay server helpers — order creation, signature verification, payment
 * lookup. The key SECRET never leaves the server; only the public key id is
 * handed to the browser for Checkout.
 *
 * Env vars:
 *   RAZORPAY_KEY_ID       e.g. rzp_test_xxx or rzp_live_xxx
 *   RAZORPAY_KEY_SECRET   from Razorpay → Settings → API Keys (secret!)
 */
import crypto from "crypto";

const KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

export const razorpayEnabled = () => !!(KEY_ID && KEY_SECRET);
export const razorpayKeyId = () => KEY_ID;

function authHeader() {
  return "Basic " + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64");
}

/** Create an order. `amount` is in the smallest currency unit (paise for INR). */
export async function createOrder(
  amount: number,
  currency: string,
  receipt: string,
  notes?: Record<string, string>
) {
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({ amount, currency, receipt: receipt.slice(0, 40), notes, payment_capture: 1 }),
  });
  if (!res.ok) throw new Error(`Razorpay order failed (${res.status}): ${await res.text()}`);
  return res.json() as Promise<{ id: string; amount: number; currency: string }>;
}

/** Verify the checkout signature: HMAC_SHA256(order_id|payment_id, secret). */
export function verifySignature(orderId: string, paymentId: string, signature: string): boolean {
  if (!orderId || !paymentId || !signature) return false;
  const expected = crypto.createHmac("sha256", KEY_SECRET).update(`${orderId}|${paymentId}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Fetch a captured payment to read its exact amount/status (server-trusted). */
export async function fetchPayment(paymentId: string) {
  const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
    headers: { Authorization: authHeader() },
  });
  if (!res.ok) throw new Error(`Razorpay payment lookup failed (${res.status})`);
  return res.json() as Promise<{ id: string; amount: number; currency: string; status: string; method?: string }>;
}
