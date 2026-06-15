import { NextResponse } from "next/server";
import crypto from "crypto";
import { requireAdmin } from "@/lib/admin/guard";

/**
 * Returns a short-lived signature so the browser can upload a file DIRECTLY to
 * Cloudinary (bypassing our server's ~4.5 MB body limit — essential for video).
 * Admin-only: the API secret never leaves the server; we only hand out a signed
 * timestamp+folder. Cloudinary rejects anything not covered by the signature.
 */
const ALLOWED_FOLDERS = ["aumoxo/insights", "aumoxo/solutions", "aumoxo/media", "aumoxo/emp"];

// Turn a label (e.g. an employee or project name) into a safe Cloudinary
// public_id: lowercase, only [a-z0-9-_], collapsed dashes, capped length.
function slugId(raw?: string): string | undefined {
  if (!raw) return undefined;
  const s = raw.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
  return s || undefined;
}

export async function POST(req: Request) {
  if (!(await requireAdmin()).ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Cloudinary is not configured." }, { status: 503 });
  }

  const { folder, publicId } = (await req.json().catch(() => ({}))) as { folder?: string; publicId?: string };
  const safeFolder = ALLOWED_FOLDERS.includes(folder || "") ? folder! : "aumoxo/media";
  const cleanId = slugId(publicId);
  const timestamp = Math.round(Date.now() / 1000);

  // Cloudinary signs the alphabetically-sorted params (minus file/api_key) + secret
  const params: Record<string, string | number> = { folder: safeFolder, timestamp };
  if (cleanId) params.public_id = cleanId;
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  const signature = crypto.createHash("sha1").update(toSign + apiSecret).digest("hex");

  return NextResponse.json({ cloudName, apiKey, timestamp, folder: safeFolder, publicId: cleanId, signature });
}
