/* Completion-pass e2e: expenses, reports, lead->client conversion, messages,
   password self-service, route aliases. Run: node scripts/e2e-complete.js <admin-password> */
const h = require("https");
const PW = process.argv[2];
const RUN = Date.now().toString(36);
const LEMAIL = `cv-lead-${RUN}@test.com`;
const SEMAIL = `cv-emp-${RUN}@test.com`;
let req = function (method, path, body, cookie) {
  return new Promise((res, rej) => {
    const data = body ? JSON.stringify(body) : null;
    const r = h.request(
      {
        hostname: "aumoxo.tech",
        path,
        method,
        headers: {
          "Content-Type": "application/json",
          ...(cookie ? { Cookie: cookie } : {}),
          ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}),
        },
      },
      (rr) => {
        let b = "";
        rr.on("data", (c) => (b += c));
        rr.on("end", () => res({ s: rr.statusCode, b, h: rr.headers }));
      }
    );
    r.on("error", rej);
    if (data) r.write(data);
    r.end();
  });
};
const ck = (r) => (r.h["set-cookie"] || []).map((c) => c.split(";")[0]).join("; ");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const _req = req;
req = async (method, path, body, cookie) => {
  const r = await _req(method, path, body, cookie);
  if (method === "POST" || method === "DELETE") await sleep(2000);
  return r;
};
let pass = 0, fail = 0;
const check = (label, ok, extra = "") => {
  console.log((ok ? "PASS" : "FAIL") + "  " + label + (extra ? " | " + extra : ""));
  ok ? pass++ : fail++;
};
(async () => {
  console.log("===== COMPLETION E2E =====");
  const login = await req("POST", "/api/admin/login", { password: PW });
  const admin = ck(login);
  check("Admin login", login.s === 200);

  // ---- Route aliases (no buttons; direct routes) ----
  const aliasClient = await _req("GET", "/client");
  check("/client redirects to portal", [301, 302, 307, 308].includes(aliasClient.s) && (aliasClient.h.location || "").includes("/portal"), String(aliasClient.s));
  const aliasEmp = await _req("GET", "/emp");
  check("/emp redirects to staff", [301, 302, 307, 308].includes(aliasEmp.s) && (aliasEmp.h.location || "").includes("/staff"), String(aliasEmp.s));

  // ---- Expenses ----
  const ex = await req("POST", "/api/admin/expenses", { description: `E2E expense ${RUN}`, category: "Software & tools", amount: 1234, date: "2026-06-12" }, admin);
  const expense = JSON.parse(ex.b).expense;
  check("Record expense", ex.s === 200 && expense.amount === 1234);
  const exList = await req("GET", "/api/admin/expenses", null, admin);
  check("Expense in ledger", exList.b.includes(`E2E expense ${RUN}`));

  // ---- Reports ----
  const rep = await req("GET", "/api/admin/reports", null, admin);
  const repData = JSON.parse(rep.b);
  check("Reports aggregate", rep.s === 200 && repData.months?.length === 6 && repData.totals && repData.funnel?.length === 6,
    `net=${repData.totals?.net}`);
  check("Reports counts expense", repData.totals.spent >= 1234);

  // ---- Lead -> Client conversion ----
  const lc = await req("POST", "/api/admin/leads", { name: "Convert Test", company: `ConvertCo ${RUN}`, email: LEMAIL, stage: "proposal", value: 50000 }, admin);
  const lead = JSON.parse(lc.b).lead;
  check("Create lead", lc.s === 200);
  const conv = await req("POST", "/api/admin/leads", { id: lead.id, action: "convert" }, admin);
  const convData = JSON.parse(conv.b);
  check("Convert lead to client (creds once)", conv.s === 200 && convData.converted && convData.password, convData.client?.email);
  check("Lead marked won", (convData.leads || []).find((l) => l.id === lead.id)?.stage === "won");

  // ---- Client login with generated password + messages + password change ----
  const cl = await req("POST", "/api/portal/login", { email: LEMAIL, password: convData.password });
  const clientCookie = ck(cl);
  check("Client login w/ generated password", cl.s === 200);

  const cmsg = await req("POST", "/api/portal/messages", { body: `Hello team! (${RUN})` }, clientCookie);
  check("Client sends message", cmsg.s === 200);
  const adminNotif = await req("GET", "/api/admin/notifications", null, admin);
  check("Admin notified of message", adminNotif.b.includes("New message from"));

  const threads = await req("GET", "/api/admin/messages", null, admin);
  const threadsData = JSON.parse(threads.b);
  const thread = (threadsData.threads || []).find((t) => t.clientId === convData.client.id);
  check("Thread visible in admin w/ unread", !!thread && thread.unread >= 1);

  const reply = await req("POST", "/api/admin/messages", { clientId: convData.client.id, body: `Hi! We got it. (${RUN})` }, admin);
  check("Admin replies", reply.s === 200);
  const cthread = await req("GET", "/api/portal/messages", null, clientCookie);
  check("Client sees reply", cthread.b.includes(`We got it. (${RUN})`));

  const pwc = await req("POST", "/api/portal/password", { current: convData.password, next: "NewClientPw123!" }, clientCookie);
  check("Client changes password", pwc.s === 200);
  const reLogin = await req("POST", "/api/portal/login", { email: LEMAIL, password: "NewClientPw123!" });
  check("Client logs in w/ new password", reLogin.s === 200);

  // ---- Staff password change ----
  const ec = await req("POST", "/api/admin/employees", { name: "PW Test Emp", email: SEMAIL, designation: "Tester", password: "EmpPass123!" }, admin);
  const emp = JSON.parse(ec.b).employee;
  check("Create employee", ec.s === 200);
  const sl = await req("POST", "/api/staff/login", { email: SEMAIL, password: "EmpPass123!" });
  const staffCookie = ck(sl);
  check("Staff login", sl.s === 200);
  const spw = await req("POST", "/api/staff/password", { current: "EmpPass123!", next: "NewEmpPw123!" }, staffCookie);
  check("Staff changes password", spw.s === 200);
  const sre = await req("POST", "/api/staff/login", { email: SEMAIL, password: "NewEmpPw123!" });
  check("Staff logs in w/ new password", sre.s === 200);

  // ---- Admin hierarchy: super admin creates + manages sub-admins ----
  const AEMAIL = `cv-admin-${RUN}@test.com`;
  const meSuper = await req("GET", "/api/admin/me", null, admin);
  check("Owner identified as super", JSON.parse(meSuper.b).role === "super");

  const ac = await req("POST", "/api/admin/admins", { name: "Sub Admin", email: AEMAIL }, admin);
  const acData = JSON.parse(ac.b);
  check("Super creates sub-admin (creds once)", ac.s === 200 && acData.password);

  const al = await req("POST", "/api/admin/login", { email: AEMAIL, password: acData.password });
  const subCookie = ck(al);
  check("Sub-admin login (email + password)", al.s === 200 && JSON.parse(al.b).role === "admin");

  const subClients = await req("GET", "/api/admin/clients", null, subCookie);
  check("Sub-admin can run operations", subClients.s === 200);
  const subAdmins = await _req("GET", "/api/admin/admins", null, subCookie);
  check("Sub-admin BLOCKED from admin management", subAdmins.s === 401);

  await req("POST", "/api/admin/admins", { id: acData.admin.id, active: false }, admin);
  const afterDisable = await _req("GET", "/api/admin/clients", null, subCookie);
  check("Disabled sub-admin locked out instantly", afterDisable.s === 401);
  const reLoginSub = await _req("POST", "/api/admin/login", { email: AEMAIL, password: acData.password });
  check("Disabled sub-admin cannot log in", reLoginSub.s === 401);

  // ---- Role isolation on new endpoints ----
  const cross1 = await _req("GET", "/api/admin/messages", null, clientCookie);
  check("Client cookie rejected on admin messages", cross1.s === 401);
  const cross2 = await _req("GET", "/api/admin/reports", null, staffCookie);
  check("Staff cookie rejected on reports", cross2.s === 401);

  // ---- Cleanup ----
  await req("DELETE", "/api/admin/expenses", { id: expense.id }, admin);
  await req("DELETE", "/api/admin/clients", { id: convData.client.id }, admin);
  await req("DELETE", "/api/admin/leads", { id: lead.id }, admin);
  await req("DELETE", "/api/admin/employees", { id: emp.id }, admin);
  await req("DELETE", "/api/admin/admins", { id: acData.admin.id }, admin);
  console.log("cleanup done");

  console.log(`\n===== ${pass} passed, ${fail} failed =====`);
  process.exit(fail ? 1 : 0);
})().catch((e) => {
  console.error("E2E crashed:", e.message);
  process.exit(1);
});
