import { NextResponse } from "next/server";
import { jobsDb, type Job } from "@/lib/admin/db";
import { requireAdmin } from "@/lib/admin/guard";
import { logAdminAction } from "@/lib/admin/audit";

async function isAuthed() {
  return (await requireAdmin()).ok;
}

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const jobs = await jobsDb.list();
  return NextResponse.json({ jobs });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as { job?: Job; reset?: boolean };
  if (body.reset) {
    await jobsDb.reset();
    await logAdminAction("reset", "job", "Reset careers to default openings");
    return NextResponse.json({ jobs: await jobsDb.list() });
  }
  if (!body.job) return NextResponse.json({ error: "Missing job" }, { status: 400 });
  const existed = (await jobsDb.list()).some((j) => j.id === body.job!.id);
  await jobsDb.upsert(body.job);
  await logAdminAction(existed ? "update" : "create", "job", `${existed ? "Updated" : "Posted"} role "${body.job.title}"${body.job.active === false ? " (inactive)" : ""}`);
  return NextResponse.json({ jobs: await jobsDb.list() });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const existing = (await jobsDb.list()).find((j) => j.id === id);
  await jobsDb.remove(id);
  await logAdminAction("delete", "job", `Deleted role "${existing?.title ?? id}"`);
  return NextResponse.json({ jobs: await jobsDb.list() });
}
