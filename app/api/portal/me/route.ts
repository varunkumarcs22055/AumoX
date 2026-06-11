import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clientsDb, projectsDb } from "@/lib/admin/db";
import { verifyClientToken, CLIENT_COOKIE } from "@/lib/admin/auth";

/**
 * Returns the logged-in client's profile and their projects
 * (phases, progress, update timeline). Client auth only.
 */
export async function GET() {
  const c = await cookies();
  const result = await verifyClientToken(c.get(CLIENT_COOKIE)?.value);
  if (!result.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clientsDb.findById(result.clientId);
  if (!client || !client.active) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await projectsDb.listByClient(client.id);
  return NextResponse.json({
    client: { company: client.company, name: client.name, email: client.email },
    projects,
  });
}
