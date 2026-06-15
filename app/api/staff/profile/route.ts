import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { employeesDb } from "@/lib/admin/db";
import { verifyStaffToken, STAFF_COOKIE } from "@/lib/admin/auth";

/** Employee self-service profile update (own record only). */
export async function POST(req: Request) {
  const c = await cookies();
  const r = await verifyStaffToken(c.get(STAFF_COOKIE)?.value);
  if (!r.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const emp = await employeesDb.findById(r.employeeId);
  if (!emp || !emp.active) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { phone?: string; address?: string; emergencyContact?: string; photo?: string };
  const updated = {
    ...emp,
    phone: body.phone !== undefined ? String(body.phone).slice(0, 40) : emp.phone,
    address: body.address !== undefined ? String(body.address).slice(0, 240) : emp.address,
    emergencyContact: body.emergencyContact !== undefined ? String(body.emergencyContact).slice(0, 160) : emp.emergencyContact,
    photo: body.photo !== undefined ? String(body.photo).slice(0, 600) : emp.photo,
  };
  await employeesDb.upsert(updated);
  return NextResponse.json({ ok: true });
}
