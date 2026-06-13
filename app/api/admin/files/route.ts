import { NextResponse } from "next/server";
import { filesDb, projectsDb, notificationsDb, newId } from "@/lib/admin/db";
import { requireAdmin } from "@/lib/admin/guard";
import { logAdminAction } from "@/lib/admin/audit";
import { uploadFile, deleteFileByUrl } from "@/lib/admin/storage";

async function isAuthed() {
  return (await requireAdmin()).ok;
}

const MAX_BYTES = 4 * 1024 * 1024; // server uploads are body-limited on Vercel
const ALLOWED = [
  "image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif",
  "application/pdf", "application/zip", "application/x-zip-compressed",
  "text/plain", "text/csv", "application/json",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

export async function GET(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const projectId = new URL(req.url).searchParams.get("projectId");
  const files = projectId ? await filesDb.listByProject(projectId) : await filesDb.list();
  return NextResponse.json({ files });
}

/** Upload a deliverable to the file vault (multipart form: file + projectId). */
export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  const projectId = String(form.get("projectId") || "");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });
  const projects = await projectsDb.list();
  const project = projects.find((p) => p.id === projectId);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 4 MB)" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: `File type not allowed (${file.type || "unknown"})` }, { status: 400 });
  }

  const safeName = file.name.replace(/[^\w.\-() ]+/g, "_").slice(0, 120);
  let uploaded;
  try {
    uploaded = await uploadFile(`${projectId}/${newId()}-${safeName}`, file, file.type);
  } catch (e) {
    console.error("[files] upload failed:", e);
    return NextResponse.json({ error: "Upload failed. Check storage configuration." }, { status: 502 });
  }

  const record = {
    id: newId(),
    projectId,
    name: safeName,
    url: uploaded.url,
    size: file.size,
    contentType: file.type,
    uploadedAt: new Date().toISOString(),
    uploadedBy: "AUMOXO Team",
  };
  await filesDb.upsert(record);
  await notificationsDb.push({
    audience: `client:${project.clientId}`,
    type: "file",
    message: `New deliverable uploaded to ${project.name}: ${safeName}`,
    link: "/portal",
  });
  await logAdminAction("upload", "file", `Uploaded "${safeName}" to project "${project.name}"`);
  return NextResponse.json({ file: record });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const existing = (await filesDb.list()).find((f) => f.id === id);
  await filesDb.remove(id);
  if (existing?.url) await deleteFileByUrl(existing.url);
  await logAdminAction("delete", "file", `Deleted deliverable ${existing?.name ?? id}`);
  return NextResponse.json({ ok: true });
}
