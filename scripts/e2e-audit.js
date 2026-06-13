/* Audit-log e2e: actions are recorded, attributed to the right actor, and the
   report is super-admin-only. Run: node scripts/e2e-audit.js <admin-password> */
const h = require("https");
const PW = process.argv[2];
const RUN = Date.now().toString(36);
const CCOMPANY = `Audit Co ${RUN}`;
const CEMAIL = `audit-client-${RUN}@test.com`;
const AEMAIL = `audit-admin-${RUN}@test.com`;
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

(async () => {
  console.log("===== AUDIT LOG E2E =====");
  const login = await req("POST", "/api/admin/login", { password: PW });
  const admin = ck(login);
  check("Owner login", login.s === 200 && JSON.parse(login.b).role === "super");

  // Owner action → logged
  const cc = await req("POST", "/api/admin/clients", { company: CCOMPANY, name: "Aud Itor", email: CEMAIL, password: "TestPass123!" }, admin);
  const client = JSON.parse(cc.b).client;
  check("Owner creates client", cc.s === 200);

  let audit = await req("GET", "/api/admin/audit?q=" + encodeURIComponent(CCOMPANY), null, admin);
  let data = JSON.parse(audit.b);
  const ownerEntry = (data.entries || []).find((e) => (e.detail || "").includes(CCOMPANY) && e.action === "create");
  check("Owner action recorded + attributed", !!ownerEntry && ownerEntry.actorType === "super", ownerEntry && ownerEntry.detail);

  // Create a sub-admin and act as them
  const ac = await req("POST", "/api/admin/admins", { name: `Sub ${RUN}`, email: AEMAIL }, admin);
  const acData = JSON.parse(ac.b);
  check("Create sub-admin", ac.s === 200 && acData.password);
  const al = await req("POST", "/api/admin/login", { email: AEMAIL, password: acData.password });
  const sub = ck(al);
  check("Sub-admin login", al.s === 200);

  const lc = await req("POST", "/api/admin/leads", { name: `Audit Lead ${RUN}`, stage: "new" }, sub);
  check("Sub-admin creates lead", lc.s === 200);

  // Sub-admin must NOT be able to read the audit report
  const subAudit = await _req("GET", "/api/admin/audit", null, sub);
  check("Sub-admin BLOCKED from audit log", subAudit.s === 401);

  // Owner sees the sub-admin's action attributed to the sub-admin
  audit = await req("GET", "/api/admin/audit?q=" + encodeURIComponent(`Audit Lead ${RUN}`), null, admin);
  data = JSON.parse(audit.b);
  const subEntry = (data.entries || []).find((e) => (e.detail || "").includes(`Audit Lead ${RUN}`));
  check("Sub-admin action attributed to sub-admin", !!subEntry && subEntry.actorType === "admin" && subEntry.actorName.includes(`Sub ${RUN}`), subEntry && `${subEntry.actorName}: ${subEntry.detail}`);

  // Login events recorded
  audit = await req("GET", "/api/admin/audit?actor=admin", null, admin);
  data = JSON.parse(audit.b);
  check("Login event recorded", (data.entries || []).some((e) => e.action === "login"));

  // Cleanup
  await req("DELETE", "/api/admin/clients", { id: client.id }, admin);
  await req("DELETE", "/api/admin/admins", { id: acData.admin.id }, admin);
  if (lc.s === 200) { const lead = JSON.parse(lc.b).lead; await req("DELETE", "/api/admin/leads", { id: lead.id }, admin); }
  console.log("cleanup done");

  console.log(`\n===== ${pass} passed, ${fail} failed =====`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error("crashed:", e.message); process.exit(1); });
