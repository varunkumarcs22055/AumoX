import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { put } from "@vercel/blob";
import { filesDb, projectsDb, notificationsDb, newId } from "@/lib/admin/db";
import { verifySessionToken, AUTH_COOKIE } from "@/lib/admin/auth";

async function isAuthed() {
  const c = await cookies();
  return (await verifySessionToken(c.get(AUTH_COOKIE)?.value)).ok;
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
  const blob = await put(`deliverables/${projectId}/${newId()}-${safeName}`, file, {
    access: "public",
    contentType: file.type,
  });

  const record = {
    id: newId(),
    projectId,
    name: safeName,
    url: blob.url,
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
  return NextResponse.json({ file: record });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await filesDb.remove(id);
  return NextResponse.json({ ok: true });
}
