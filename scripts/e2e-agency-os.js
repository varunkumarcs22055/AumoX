/* Agency OS end-to-end test against the live site. Run: node scripts/e2e-agency-os.js <admin-password> */
const h = require("https");
const PW = process.argv[2];
const RUN = Date.now().toString(36);
const CEMAIL = `os-client-${RUN}@test.com`;
const EEMAIL = `os-emp-${RUN}@test.com`;
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
}
const ck = (r) => (r.h["set-cookie"] || []).map((c) => c.split(";")[0]).join("; ");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Pace like a human: blob-backed storage propagates in ~a second; rapid-fire
// write->read in the same millisecond can read a stale document.
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
  console.log("===== AGENCY OS E2E =====");
  const login = await req("POST", "/api/admin/login", { password: PW });
  const admin = ck(login);
  check("Admin login", login.s === 200);

  // MONEY CHAIN
  const cc = await req("POST", "/api/admin/clients", { company: "OS Test Co", name: "Olive Sky", email: CEMAIL, password: "TestPass123!" }, admin);
  const client = JSON.parse(cc.b).client;
  check("Create client", cc.s === 200);

  const qc = await req("POST", "/api/admin/quotations", { clientId: client.id, projectName: "OS Web App", items: [{ description: "Development", qty: 1, rate: 100000 }], taxPercent: 18, discountPercent: 10, validUntil: "2026-12-31" }, admin);
  const quotation = JSON.parse(qc.b).quotation;
  check("Create quotation w/ serial", qc.s === 200 && /QT\d{3}$/.test(quotation.number), quotation.number);

  const cl = await req("POST", "/api/portal/login", { email: CEMAIL, password: "TestPass123!" });
  const clientCookie = ck(cl);
  check("Client login", cl.s === 200);

  const me1 = await req("GET", "/api/portal/me", null, clientCookie);
  check("Client sees quotation in portal", me1.b.includes(quotation.number));

  const acc = await req("POST", "/api/portal/quotations", { id: quotation.id, action: "accept" }, clientCookie);
  check("Client ACCEPTS quotation", acc.s === 200);

  const conv = await req("POST", "/api/admin/quotations", { id: quotation.id, convertToInvoice: true }, admin);
  const invoice = JSON.parse(conv.b).invoice;
  check("One-click convert to invoice", conv.s === 200 && /IN\d{3}$/.test(invoice.number), invoice.number);

  const me2 = await req("GET", "/api/portal/me", null, clientCookie);
  check("Client sees invoice", me2.b.includes(invoice.number));

  const pay = await req("POST", "/api/admin/payments", { invoiceId: invoice.id, amount: 106200, method: "UPI", reference: "TESTUTR1" }, admin);
  check("Record payment", pay.s === 200);
  const fin = await req("GET", "/api/admin/payments", null, admin);
  const finData = JSON.parse(fin.b);
  const invAfter = finData.invoices.find((i) => i.id === invoice.id);
  check("Invoice auto-flips to PAID (ledger)", invAfter && invAfter.status === "paid");

  // STAFF FLOW
  const ec = await req("POST", "/api/admin/employees", { name: "Test Employee", email: EEMAIL, designation: "Engineer", salaryMonthly: 50000, password: "EmpPass123!" }, admin);
  const emp = JSON.parse(ec.b).employee;
  check("Create employee", ec.s === 200);

  const sl = await req("POST", "/api/staff/login", { email: EEMAIL, password: "EmpPass123!" });
  const staff = ck(sl);
  check("Staff login", sl.s === 200);

  const cin = await req("POST", "/api/staff/clock", { action: "in", mode: "wfh" }, staff);
  check("Clock IN", cin.s === 200);
  const cout = await req("POST", "/api/staff/clock", { action: "out" }, staff);
  check("Clock OUT", cout.s === 200);

  const tk = await req("POST", "/api/admin/tasks", { title: "OS e2e task", assigneeId: emp.id }, admin);
  const task = JSON.parse(tk.b).task;
  check("Assign task to employee", tk.s === 200 && task.assignee === "Test Employee");

  const sme = await req("GET", "/api/staff/me", null, staff);
  const smeData = JSON.parse(sme.b);
  check("Staff sees assigned task", sme.b.includes("OS e2e task"));
  check("Staff got task notification", (smeData.notifications || []).some((n) => n.message.includes("OS e2e task")));

  const mv = await req("POST", "/api/staff/tasks", { id: task.id, status: "done" }, staff);
  check("Staff completes task", mv.s === 200);

  const lv = await req("POST", "/api/staff/leave", { from: "2026-07-01", to: "2026-07-02", reason: "e2e test" }, staff);
  const leave = JSON.parse(lv.b).leave;
  check("Leave request submitted", lv.s === 200 && leave.days === 2);

  const ap = await req("POST", "/api/admin/hr", { action: "leave-approve", id: leave.id }, admin);
  check("Admin approves leave", ap.s === 200);
  const sme2 = await req("GET", "/api/staff/me", null, staff);
  const sme2d = JSON.parse(sme2.b);
  check("Leave balance recalculated (18-2=16)", sme2d.leaveBalance === 16, "balance=" + sme2d.leaveBalance);

  const ps = await req("POST", "/api/admin/hr", { action: "payslip-generate", employeeId: emp.id, month: "2026-06", gross: 50000, deductions: [{ label: "PF", amount: 1800 }] }, admin);
  const slip = JSON.parse(ps.b).payslip;
  check("Payslip generated (gross-ded=net)", ps.s === 200 && slip.net === 48200 && /PS\d{3}$/.test(slip.number), slip.number);

  const as = await req("POST", "/api/admin/hr", { action: "asset-issue", employeeId: emp.id, name: "Employee ID Card", type: "document" }, admin);
  check("Asset issued", as.s === 200);
  const sme3 = await req("GET", "/api/staff/me", null, staff);
  check("Staff sees payslip + asset", sme3.b.includes(slip.number) && sme3.b.includes("Employee ID Card"));

  // NOTIFICATIONS + ROLE ISOLATION
  const nf = await req("GET", "/api/admin/notifications", null, admin);
  check("Admin alerts feed has quotation+leave events", nf.b.includes("accepted quotation") && nf.b.includes("requested"));
  const iso1 = await req("GET", "/api/admin/queries", null, staff);
  const iso2 = await req("GET", "/api/staff/me", null, clientCookie);
  check("Role isolation enforced on the backend", iso1.s === 401 && iso2.s === 401);

  for (const p of ["/staff/login", "/portal/login"]) {
    const r = await req("GET", p, null, null);
    check("Page " + p + " renders", r.s === 200);
  }

  // CLEANUP
  await req("DELETE", "/api/admin/tasks", { id: task.id }, admin);
  await req("POST", "/api/admin/hr", { action: "payslip-delete", id: slip.id }, admin);
  const hrAll = JSON.parse((await req("GET", "/api/admin/hr", null, admin)).b);
  for (const a of (hrAll.assets || []).filter((x) => x.employeeId === emp.id)) {
    await req("POST", "/api/admin/hr", { action: "asset-delete", id: a.id }, admin);
  }
  await req("DELETE", "/api/admin/employees", { id: emp.id }, admin);
  const pays = JSON.parse((await req("GET", "/api/admin/payments", null, admin)).b).payments || [];
  for (const p2 of pays.filter((x) => x.invoiceId === invoice.id)) {
    await req("DELETE", "/api/admin/payments", { id: p2.id }, admin);
  }
  await req("DELETE", "/api/admin/invoices", { id: invoice.id }, admin);
  await req("DELETE", "/api/admin/quotations", { id: quotation.id }, admin);
  await req("DELETE", "/api/admin/clients", { id: client.id }, admin);
  console.log("cleanup done");
  console.log("===== RESULT: " + pass + " passed, " + fail + " failed =====");
  process.exit(fail > 0 ? 1 : 0);
})();
