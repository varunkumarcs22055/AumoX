import { auditDb, type AuditActor } from "./db";
import { requireAdmin } from "./guard";

/**
 * Activity trail. Every mutating action records one entry so the main (super)
 * admin gets a full report of what happened, by whom, and how.
 *
 * `logAdminAction` resolves the acting admin from the session itself — call
 * sites stay a single line and never have to thread the actor through. It is
 * deliberately fire-and-forget safe: a logging failure must never break the
 * underlying operation, so every call is wrapped by the helpers below.
 */
export async function logAdminAction(action: string, entity: string, detail?: string) {
  try {
    const g = await requireAdmin();
    const actorType: AuditActor = g.ok ? g.role : "system";
    const actorName = g.ok ? (g.role === "admin" ? g.name || "Admin" : "Owner") : "Unknown";
    await auditDb.push({ actorType, actorName, action, entity, detail });
  } catch {
    /* never let auditing break the actual request */
  }
}

/** For client / staff / visitor actions where the actor is already known. */
export async function logActorAction(
  actorType: AuditActor,
  actorName: string,
  action: string,
  entity: string,
  detail?: string
) {
  try {
    await auditDb.push({ actorType, actorName, action, entity, detail });
  } catch {
    /* swallow */
  }
}
