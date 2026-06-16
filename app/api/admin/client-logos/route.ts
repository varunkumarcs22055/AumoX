import { NextResponse } from "next/server";
import { clientLogosDb, newId, type ClientLogo } from "@/lib/admin/db";
import { requireAdmin } from "@/lib/admin/guard";
import { logAdminAction } from "@/lib/admin/audit";

async function isAuthed() {
  return (await requireAdmin()).ok;
}

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const logos = (await clientLogosDb.list()).sort((a, b) => a.order - b.order);
  return NextResponse.json({ logos });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as Partial<ClientLogo>;
  if (!body.logo || !/^https?:\/\//.test(body.logo)) {
    return NextResponse.json({ error: "A logo image is required" }, { status: 400 });
  }

  const all = await clientLogosDb.list();
  const existing = body.id ? all.find((l) => l.id === body.id) : undefined;

  const logo: ClientLogo = {
    id: body.id || newId(),
    name: (body.name || "").trim().slice(0, 80),
    logo: body.logo.slice(0, 600),
    url: body.url?.trim().slice(0, 400) || undefined,
    order: typeof body.order === "number" ? body.order : existing?.order ?? all.length,
    createdAt: existing?.createdAt || new Date().toISOString(),
  };

  await clientLogosDb.upsert(logo);
  await logAdminAction(existing ? "update" : "create", "client-logo", `${existing ? "Updated" : "Added"} company logo${logo.name ? ` "${logo.name}"` : ""}`);
  const logos = (await clientLogosDb.list()).sort((a, b) => a.order - b.order);
  return NextResponse.json({ logo, logos });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const existing = (await clientLogosDb.list()).find((l) => l.id === id);
  await clientLogosDb.remove(id);
  await logAdminAction("delete", "client-logo", `Deleted company logo${existing?.name ? ` "${existing.name}"` : ""}`);
  const logos = (await clientLogosDb.list()).sort((a, b) => a.order - b.order);
  return NextResponse.json({ ok: true, logos });
}
