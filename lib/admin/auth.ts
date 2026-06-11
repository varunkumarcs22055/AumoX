/**
 * Admin auth — HMAC-signed session cookie. Implemented with the Web
 * Crypto API so it works in both Edge (middleware) and Node (API routes)
 * runtimes.
 *
 * Cookie value format: `<base64url-payload>.<base64url-hmac-sig>`
 *
 * Without the secret an attacker cannot forge a valid cookie. The secret
 * is sourced from `AUTH_SECRET`, falling back to a hash of `ADMIN_PASSWORD`
 * so the site is usable without an extra env var.
 */

const COOKIE_NAME = "aumox_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

const enc = new TextEncoder();
const dec = new TextDecoder();

function getSecretMaterial(): string {
  const explicit = process.env.AUTH_SECRET;
  if (explicit && explicit.length >= 16) return explicit;
  // Use the admin password as keying material (mixed with a static seed so
  // the derived secret isn't equal to the password). 16+ chars recommended
  // for production via AUTH_SECRET env var.
  const pw = process.env.ADMIN_PASSWORD || "aumox-admin";
  return `aumoxo-static-seed-v1::${pw}`;
}

// ---------- base64url helpers (no Buffer — works on Edge) ----------
function b64urlFromBytes(bytes: ArrayBuffer | Uint8Array): string {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
  // btoa is available in both Node 18+ and Edge
  const b64 = btoa(bin);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlToBytes(s: string): Uint8Array {
  let str = s.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function b64urlFromString(s: string): string {
  return b64urlFromBytes(enc.encode(s));
}
function stringFromB64url(s: string): string {
  return dec.decode(b64urlToBytes(s));
}

// Constant-time byte comparison (Edge-safe)
function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(getSecretMaterial()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export type Session = { iat: number; exp: number };

export async function createSessionToken(ttlMs = SESSION_TTL_MS): Promise<string> {
  const now = Date.now();
  const payload: Session = { iat: now, exp: now + ttlMs };
  const payloadB64 = b64urlFromString(JSON.stringify(payload));
  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payloadB64));
  return `${payloadB64}.${b64urlFromBytes(sig)}`;
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<{ ok: true; session: Session } | { ok: false; reason: string }> {
  if (!token || typeof token !== "string") return { ok: false, reason: "missing" };
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "malformed" };
  const [payloadB64, sigB64] = parts;

  let providedSig: Uint8Array;
  try {
    providedSig = b64urlToBytes(sigB64);
  } catch {
    return { ok: false, reason: "decode_failed" };
  }

  const key = await getKey();
  const expectedSig = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, enc.encode(payloadB64))
  );

  if (!timingSafeEqualBytes(expectedSig, providedSig))
    return { ok: false, reason: "sig_mismatch" };

  let session: Session;
  try {
    session = JSON.parse(stringFromB64url(payloadB64));
  } catch {
    return { ok: false, reason: "payload_parse" };
  }

  if (!session.exp || session.exp < Date.now())
    return { ok: false, reason: "expired" };
  return { ok: true, session };
}

export const AUTH_COOKIE = COOKIE_NAME;
export const AUTH_TTL_SECONDS = Math.floor(SESSION_TTL_MS / 1000);

/* ============================================================
   CLIENT PORTAL AUTH — separate cookie + token audience.
   Same HMAC scheme; payload carries role:"client" and the
   client id (sub) so portal APIs know who is logged in.
   ============================================================ */

export const CLIENT_COOKIE = "aumox_client_session";
const CLIENT_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
export const CLIENT_TTL_SECONDS = Math.floor(CLIENT_TTL_MS / 1000);

export type ClientSession = { iat: number; exp: number; sub: string; role: "client" };

export async function createClientToken(
  clientId: string,
  ttlMs = CLIENT_TTL_MS
): Promise<string> {
  const now = Date.now();
  const payload: ClientSession = { iat: now, exp: now + ttlMs, sub: clientId, role: "client" };
  const payloadB64 = b64urlFromString(JSON.stringify(payload));
  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payloadB64));
  return `${payloadB64}.${b64urlFromBytes(sig)}`;
}

export async function verifyClientToken(
  token: string | undefined | null
): Promise<{ ok: true; clientId: string } | { ok: false; reason: string }> {
  if (!token || typeof token !== "string") return { ok: false, reason: "missing" };
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "malformed" };
  const [payloadB64, sigB64] = parts;

  let providedSig: Uint8Array;
  try {
    providedSig = b64urlToBytes(sigB64);
  } catch {
    return { ok: false, reason: "decode_failed" };
  }

  const key = await getKey();
  const expectedSig = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, enc.encode(payloadB64))
  );
  if (!timingSafeEqualBytes(expectedSig, providedSig))
    return { ok: false, reason: "sig_mismatch" };

  let session: ClientSession;
  try {
    session = JSON.parse(stringFromB64url(payloadB64));
  } catch {
    return { ok: false, reason: "payload_parse" };
  }
  if (session.role !== "client" || !session.sub)
    return { ok: false, reason: "wrong_audience" };
  if (!session.exp || session.exp < Date.now())
    return { ok: false, reason: "expired" };
  return { ok: true, clientId: session.sub };
}

/* ============================================================
   STAFF (EMPLOYEE) AUTH — third audience for the staff app.
   ============================================================ */

export const STAFF_COOKIE = "aumox_staff_session";
const STAFF_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days
export const STAFF_TTL_SECONDS = Math.floor(STAFF_TTL_MS / 1000);

export type StaffSession = { iat: number; exp: number; sub: string; role: "staff" };

export async function createStaffToken(
  employeeId: string,
  ttlMs = STAFF_TTL_MS
): Promise<string> {
  const now = Date.now();
  const payload: StaffSession = { iat: now, exp: now + ttlMs, sub: employeeId, role: "staff" };
  const payloadB64 = b64urlFromString(JSON.stringify(payload));
  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payloadB64));
  return `${payloadB64}.${b64urlFromBytes(sig)}`;
}

export async function verifyStaffToken(
  token: string | undefined | null
): Promise<{ ok: true; employeeId: string } | { ok: false; reason: string }> {
  if (!token || typeof token !== "string") return { ok: false, reason: "missing" };
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "malformed" };
  const [payloadB64, sigB64] = parts;

  let providedSig: Uint8Array;
  try {
    providedSig = b64urlToBytes(sigB64);
  } catch {
    return { ok: false, reason: "decode_failed" };
  }
  const key = await getKey();
  const expectedSig = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, enc.encode(payloadB64))
  );
  if (!timingSafeEqualBytes(expectedSig, providedSig))
    return { ok: false, reason: "sig_mismatch" };

  let session: StaffSession;
  try {
    session = JSON.parse(stringFromB64url(payloadB64));
  } catch {
    return { ok: false, reason: "payload_parse" };
  }
  if (session.role !== "staff" || !session.sub)
    return { ok: false, reason: "wrong_audience" };
  if (!session.exp || session.exp < Date.now())
    return { ok: false, reason: "expired" };
  return { ok: true, employeeId: session.sub };
}

/* ---------- Password hashing (PBKDF2-SHA256, Web Crypto) ---------- */

const PBKDF2_ITERATIONS = 100_000;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return `v1:${b64urlFromBytes(salt)}:${PBKDF2_ITERATIONS}:${b64urlFromBytes(bits)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [v, saltB64, iterStr, hashB64] = stored.split(":");
    if (v !== "v1") return false;
    const salt = b64urlToBytes(saltB64);
    const iterations = parseInt(iterStr, 10);
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );
    const bits = new Uint8Array(
      await crypto.subtle.deriveBits(
        { name: "PBKDF2", salt: salt as BufferSource, iterations, hash: "SHA-256" },
        keyMaterial,
        256
      )
    );
    return timingSafeEqualBytes(bits, b64urlToBytes(hashB64));
  } catch {
    return false;
  }
}
