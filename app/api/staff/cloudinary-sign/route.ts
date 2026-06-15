import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { verifyStaffToken, STAFF_COOKIE } from "@/lib/admin/auth";

const ALLOWED = ["aumoxo/staff", "aumoxo/emp", "aumoxo/receipts"];

// Safe Cloudinary public_id from a label (e.g. the employee's name → "varun-thakur").
function slugId(raw?: string): string | undefined {
  if (!raw) return undefined;
  const s = raw.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
  return s || undefined;
}

/** Signed Cloudinary upload for staff (profile photos, expense receipts). */
export async function POST(req: Request) {
  const c = await cookies();
  const r = await verifyStaffToken(c.get(STAFF_COOKIE)?.value);
  if (!r.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return NextResponse.json({ error: "Cloudinary not configured." }, { status: 503 });

  const { folder, publicId } = (await req.json().catch(() => ({}))) as { folder?: string; publicId?: string };
  const safeFolder = ALLOWED.includes(folder || "") ? folder! : "aumoxo/emp";
  const cleanId = slugId(publicId);
  const timestamp = Math.round(Date.now() / 1000);

  // Sign the alphabetically-sorted params (Cloudinary requirement).
  const params: Record<string, string | number> = { folder: safeFolder, timestamp };
  if (cleanId) params.public_id = cleanId;
  const toSign = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&");
  const signature = crypto.createHash("sha1").update(toSign + apiSecret).digest("hex");
  return NextResponse.json({ cloudName, apiKey, timestamp, folder: safeFolder, publicId: cleanId, signature });
}
