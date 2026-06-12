import { cookies } from "next/headers";
import { verifySessionToken, AUTH_COOKIE } from "./auth";
import { adminsDb } from "./db";

export type AdminGuard =
  | { ok: true; role: "super" | "admin"; adminId?: string; name?: string }
  | { ok: false };

/**
 * Single auth gate for every admin API route.
 * - Super admin (master password) is always valid while the token lives.
 * - Sub-admins are re-checked against the store on EVERY request, so
 *   deactivating or deleting one locks them out instantly.
 */
export async function requireAdmin(): Promise<AdminGuard> {
  const c = await cookies();
  const r = await verifySessionToken(c.get(AUTH_COOKIE)?.value);
  if (!r.ok) return { ok: false };
  const role = r.session.role ?? "super";
  if (role === "admin") {
    if (!r.session.sub) return { ok: false };
    const a = await adminsDb.findById(r.session.sub);
    if (!a || !a.active) return { ok: false };
    return { ok: true, role: "admin", adminId: a.id, name: a.name };
  }
  return { ok: true, role: "super" };
}

/** Only the main (super) admin — used for managing admin accounts. */
export async function requireSuper(): Promise<AdminGuard> {
  const g = await requireAdmin();
  if (!g.ok || g.role !== "super") return { ok: false };
  return g;
}
