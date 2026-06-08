import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jobsDb, type Job } from "@/lib/admin/db";

async function isAuthed() {
  const c = await cookies();
  return c.get("aumox_admin_auth")?.value === "authenticated";
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
    return NextResponse.json({ jobs: await jobsDb.list() });
  }
  if (!body.job) return NextResponse.json({ error: "Missing job" }, { status: 400 });
  await jobsDb.upsert(body.job);
  return NextResponse.json({ jobs: await jobsDb.list() });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await jobsDb.remove(id);
  return NextResponse.json({ jobs: await jobsDb.list() });
}
