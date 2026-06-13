/**
 * File storage for the deliverables vault.
 *
 * Primary: Supabase Storage (REST API, no SDK — just fetch). Fallback: Vercel
 * Blob (lazy-imported) for backward compatibility. Once SUPABASE_URL +
 * SUPABASE_SERVICE_ROLE_KEY are set, uploads go to Supabase and the Vercel Blob
 * store is never written to again — so it can't fill up or get suspended.
 *
 * Required env vars to use Supabase Storage:
 *   SUPABASE_URL                 e.g. https://abcdxyz.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY    Settings → API → service_role (server only!)
 *   SUPABASE_BUCKET              optional, defaults to "deliverables"
 */

const SB_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const BUCKET = process.env.SUPABASE_BUCKET || "deliverables";

export const SUPABASE_STORAGE_ENABLED = !!(SB_URL && SB_KEY);

// Encode each path segment but keep the slashes that define folders.
const enc = (p: string) => p.split("/").map(encodeURIComponent).join("/");

let bucketEnsured = false;
async function ensureBucket() {
  if (bucketEnsured) return;
  // Create the bucket if it doesn't exist yet (public for direct download URLs).
  // A 400 "already exists" is expected on subsequent calls — ignored.
  try {
    await fetch(`${SB_URL}/storage/v1/bucket`, {
      method: "POST",
      headers: { Authorization: `Bearer ${SB_KEY}`, apikey: SB_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
    });
  } catch {
    /* non-fatal */
  }
  bucketEnsured = true;
}

/** Upload a file and return its public URL. `objectPath` is relative to the bucket. */
export async function uploadFile(
  objectPath: string,
  file: File,
  contentType: string
): Promise<{ url: string }> {
  if (SUPABASE_STORAGE_ENABLED) {
    await ensureBucket();
    const buf = Buffer.from(await file.arrayBuffer());
    const res = await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${enc(objectPath)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SB_KEY}`,
        apikey: SB_KEY,
        "Content-Type": contentType,
        "x-upsert": "true",
      },
      body: buf,
    });
    if (!res.ok) {
      throw new Error(`Supabase upload failed (${res.status}): ${await res.text()}`);
    }
    return { url: `${SB_URL}/storage/v1/object/public/${BUCKET}/${enc(objectPath)}` };
  }

  // Fallback: Vercel Blob (lazy import so it's not loaded when Supabase is used)
  const { put } = await import("@vercel/blob");
  const blob = await put(`${BUCKET}/${objectPath}`, file, { access: "public", contentType });
  return { url: blob.url };
}

/** Best-effort physical delete. Accepts the stored public URL. */
export async function deleteFileByUrl(url: string): Promise<void> {
  try {
    if (SUPABASE_STORAGE_ENABLED && url.includes(`/storage/v1/object/public/${BUCKET}/`)) {
      const objectPath = url.split(`/public/${BUCKET}/`)[1];
      if (objectPath) {
        await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${objectPath}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${SB_KEY}`, apikey: SB_KEY },
        });
      }
    } else if (url.includes("blob.vercel-storage.com")) {
      const { del } = await import("@vercel/blob");
      await del(url);
    }
  } catch {
    /* non-fatal — the DB record is removed regardless */
  }
}
