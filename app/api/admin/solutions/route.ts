import { NextResponse } from "next/server";
import { solutionsDb, newId, type Solution, type SolutionMedia } from "@/lib/admin/db";
import { requireAdmin } from "@/lib/admin/guard";
import { logAdminAction } from "@/lib/admin/audit";

async function isAuthed() {
  return (await requireAdmin()).ok;
}

function sanitizeMedia(input: unknown): SolutionMedia[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((m): m is SolutionMedia => !!m && typeof m.url === "string" && m.url.startsWith("http"))
    .map((m): SolutionMedia => ({ type: m.type === "video" ? "video" : "image", url: m.url.slice(0, 600) }))
    .slice(0, 20);
}

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ solutions: await solutionsDb.list() });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as Partial<Solution>;
  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const all = await solutionsDb.list();
  const existing = body.id ? all.find((s) => s.id === body.id) : undefined;

  const solution: Solution = {
    id: body.id || newId(),
    title: body.title.trim().slice(0, 140),
    category: (body.category || "Other").slice(0, 40),
    summary: (body.summary || "").slice(0, 240),
    description: (body.description || "").slice(0, 4000),
    coverImage: body.coverImage?.slice(0, 600) || undefined,
    media: sanitizeMedia(body.media),
    tags: Array.isArray(body.tags) ? body.tags.map((t) => String(t).slice(0, 40)).slice(0, 12) : [],
    link: body.link?.slice(0, 400) || undefined,
    order: typeof body.order === "number" ? body.order : existing?.order ?? all.length,
    published: body.published ?? existing?.published ?? true,
    createdAt: existing?.createdAt || new Date().toISOString(),
  };

  await solutionsDb.upsert(solution);
  await logAdminAction(existing ? "update" : "create", "solution", `${existing ? "Updated" : "Added"} solution "${solution.title}"${solution.media.length ? ` (${solution.media.length} media)` : ""}`);
  return NextResponse.json({ solution, solutions: await solutionsDb.list() });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const existing = (await solutionsDb.list()).find((s) => s.id === id);
  await solutionsDb.remove(id);
  await logAdminAction("delete", "solution", `Deleted solution "${existing?.title ?? id}"`);
  return NextResponse.json({ ok: true });
}
