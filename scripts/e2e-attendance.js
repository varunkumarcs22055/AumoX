/* Attendance e2e: multi-session clock in/out, typed breaks, admin shift.
   Run: node scripts/e2e-attendance.js <admin-password> */
const h = require("https");
const PW = process.argv[2];
const RUN = Date.now().toString(36);
const EEMAIL = `att-emp-${RUN}@test.com`;
let req = function (method, path, body, cookie) {
  return new Promise((res, rej) => {
    const data = body ? JSON.stringify(body) : null;
    const r = h.request(
      { hostname: "aumoxo.tech", path, method, headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}), ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}) } },
      (rr) => { let b = ""; rr.on("data", (c) => (b += c)); rr.on("end", () => res({ s: rr.statusCode, b, h: rr.headers })); }
    );
    r.on("error", rej); if (data) r.write(data); r.end();
  });
};
const ck = (r) => (r.h["set-cookie"] || []).map((c) => c.split(";")[0]).join("; ");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const _req = req;
req = async (m, p, b, c) => { const r = await _req(m, p, b, c); if (m === "POST" || m === "DELETE") await sleep(2000); return r; };
let pass = 0, fail = 0;
const check = (l, ok, extra = "") => { console.log((ok ? "PASS" : "FAIL") + "  " + l + (extra ? " | " + extra : "")); ok ? pass++ : fail++; };
const me = async (c) => JSON.parse((await _req("GET", "/api/staff/me", null, c)).b);

(async () => {
  console.log("===== ATTENDANCE E2E =====");
  const login = await req("POST", "/api/admin/login", { password: PW });
  const admin = ck(login);
  check("Admin login", login.s === 200);

  // Create employee WITH a shift
  const ec = await req("POST", "/api/admin/employees", { name: `Att Emp ${RUN}`, email: EEMAIL, designation: "Tester", password: "EmpPass123!", shiftStart: "10:00", shiftEnd: "19:00" }, admin);
  const emp = JSON.parse(ec.b).employee;
  check("Create employee with shift", ec.s === 200 && emp.shiftStart === "10:00" && emp.shiftEnd === "19:00", `${emp.shiftStart}-${emp.shiftEnd}`);

  const sl = await req("POST", "/api/staff/login", { email: EEMAIL, password: "EmpPass123!" });
  const staff = ck(sl);
  check("Staff login", sl.s === 200);
  check("Staff /me exposes shift", (await me(staff)).employee.shiftStart === "10:00");

  // Clock in
  let r = await req("POST", "/api/staff/clock", { action: "in", mode: "office" }, staff);
  check("Clock in", r.s === 200 && JSON.parse(r.b).row.sessions.length === 1);

  // Double clock-in blocked
  r = await _req("POST", "/api/staff/clock", { action: "in" }, staff);
  check("Double clock-in blocked", r.s === 400);

  // Start a typed break
  r = await req("POST", "/api/staff/clock", { action: "break-start", breakType: "Lunch" }, staff);
  let row = JSON.parse(r.b).row;
  check("Start Lunch break", r.s === 200 && row.breaks.length === 1 && row.breaks[0].type === "Lunch" && !row.breaks[0].end);

  // Break-start again blocked while on break
  r = await _req("POST", "/api/staff/clock", { action: "break-start", breakType: "Tea" }, staff);
  check("Second break blocked while on break", r.s === 400);

  // End break
  r = await req("POST", "/api/staff/clock", { action: "break-end" }, staff);
  row = JSON.parse(r.b).row;
  check("End break", r.s === 200 && !!row.breaks[0].end);

  // Clock out (closes session 1)
  r = await req("POST", "/api/staff/clock", { action: "out" }, staff);
  row = JSON.parse(r.b).row;
  check("Clock out closes session", r.s === 200 && !!row.sessions[0].out);

  // Clock in AGAIN (multi-session) — the core ask
  r = await req("POST", "/api/staff/clock", { action: "in", mode: "wfh" }, staff);
  row = JSON.parse(r.b).row;
  check("Clock in AGAIN (second session)", r.s === 200 && row.sessions.length === 2 && !row.sessions[1].out, `${row.sessions.length} sessions`);

  // Clock out second session
  r = await req("POST", "/api/staff/clock", { action: "out" }, staff);
  row = JSON.parse(r.b).row;
  check("Second session closed", r.s === 200 && !!row.sessions[1].out);

  // Admin sees multi-session + break in HR feed
  const hr = await req("GET", "/api/admin/hr", null, admin);
  const hrData = JSON.parse(hr.b);
  const myRow = (hrData.attendance || []).find((a) => a.employeeId === emp.id);
  check("Admin sees 2 sessions + 1 break", !!myRow && myRow.sessions.length === 2 && myRow.breaks.length === 1);

  // Cleanup
  await req("DELETE", "/api/admin/employees", { id: emp.id }, admin);
  console.log("cleanup done");

  console.log(`\n===== ${pass} passed, ${fail} failed =====`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error("crashed:", e.message); process.exit(1); });
