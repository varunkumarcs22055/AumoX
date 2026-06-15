import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { verifyStaffToken, STAFF_COOKIE } from "@/lib/admin/auth";

const ALLOWED = ["aumoxo/staff", "aumoxo/receipts"];

/** Signed Cloudinary upload for staff (profile photos, expense receipts). */
export async function POST(req: Request) {
  const c = await cookies();
  const r = await verifyStaffToken(c.get(STAFF_COOKIE)?.value);
  if (!r.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return NextResponse.json({ error: "Cloudinary not configured." }, { status: 503 });

  const { folder } = (await req.json().catch(() => ({}))) as { folder?: string };
  const safeFolder = ALLOWED.includes(folder || "") ? folder! : "aumoxo/staff";
  const timestamp = Math.round(Date.now() / 1000);
  const toSign = `folder=${safeFolder}&timestamp=${timestamp}`;
  const signature = crypto.createHash("sha1").update(toSign + apiSecret).digest("hex");
  return NextResponse.json({ cloudName, apiKey, timestamp, folder: safeFolder, signature });
}
