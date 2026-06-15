"use client";

import { useState } from "react";
import { Megaphone, Clock, Wallet, UserCircle, Users, CalendarDays, Plus, Trash2, Loader2, Check } from "lucide-react";
import MediaUpload from "@/components/admin/MediaUpload";

type Ann = { id: string; title: string; body: string; pinned: boolean; createdAt: string; authorName: string };
type TimeEntry = { id: string; projectId?: string; date: string; hours: number; billable: boolean; note?: string; invoiced?: boolean };
type Claim = { id: string; date: string; category: string; description: string; amount: number; currency: string; status: string; receiptUrl?: string };
type Holiday = { id: string; date: string; name: string };
type Dir = { id: string; name: string; designation?: string; email: string; photo?: string };
type Emp = { id: string; name: string; email: string; designation?: string; joinedAt: string; phone?: string; address?: string; emergencyContact?: string; photo?: string };

type Props = {
  me: {
    employee: Emp;
    projects: { id: string; name: string }[];
    announcements?: Ann[];
    holidays?: Holiday[];
    timeEntries?: TimeEntry[];
    claims?: Claim[];
    directory?: Dir[];
  };
  reload: () => void;
};

const EXPENSE_CATS = ["Travel", "Food", "Software", "Office", "Client", "Other"];
const todayStr = () => new Date().toISOString().slice(0, 10);

export default function StaffExtras({ me, reload }: Props) {
  const projects = me.projects || [];
  const [te, setTe] = useState({ date: todayStr(), projectId: "", hours: "", billable: true, note: "" });
  const [teBusy, setTeBusy] = useState(false);
  const [cl, setCl] = useState({ date: todayStr(), category: "Travel", amount: "", description: "", receiptUrl: "" });
  const [clBusy, setClBusy] = useState(false);
  const [pf, setPf] = useState({ phone: me.employee.phone || "", address: me.employee.address || "", emergencyContact: me.employee.emergencyContact || "", photo: me.employee.photo || "" });
  const [pfMsg, setPfMsg] = useState("");

  async function logTime() {
    if (!te.hours || Number(te.hours) <= 0) return;
    setTeBusy(true);
    try {
      const res = await fetch("/api/staff/timesheet", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...te, hours: Number(te.hours), projectId: te.projectId || undefined }) });
      if (res.ok) { setTe({ date: todayStr(), projectId: "", hours: "", billable: true, note: "" }); reload(); }
    } finally { setTeBusy(false); }
  }
  async function delTime(id: string) {
    await fetch("/api/staff/timesheet", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    reload();
  }
  async function submitClaim() {
    if (!cl.description.trim() || !cl.amount || Number(cl.amount) <= 0) return;
    setClBusy(true);
    try {
      const res = await fetch("/api/staff/expense-claim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...cl, amount: Number(cl.amount), currency: "INR" }) });
      if (res.ok) { setCl({ date: todayStr(), category: "Travel", amount: "", description: "", receiptUrl: "" }); reload(); }
    } finally { setClBusy(false); }
  }
  async function saveProfile() {
    setPfMsg("");
    const res = await fetch("/api/staff/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(pf) });
    setPfMsg(res.ok ? "Saved ✓" : "Failed");
    if (res.ok) reload();
  }

  const entries = me.timeEntries || [];
  const weekStart = (() => { const d = new Date(); d.setDate(d.getDate() - 6); return d.toISOString().slice(0, 10); })();
  const weekHours = entries.filter((e) => e.date >= weekStart).reduce((s, e) => s + e.hours, 0);
  const projName = (id?: string) => projects.find((p) => p.id === id)?.name ?? "—";

  return (
    <div className="space-y-10">
      {/* Announcements */}
      {(me.announcements?.length ?? 0) > 0 && (
        <section>
          <div className="eyebrow"><span className="h-px w-8 bg-gold-400" /> Announcements</div>
          <div className="mt-5 space-y-3">
            {me.announcements!.map((a) => (
              <div key={a.id} className="card p-5">
                <div className="flex items-center gap-2"><Megaphone size={14} className="text-gold-400" /><span className="text-ink-100 font-light">{a.pinned ? "📌 " : ""}{a.title}</span></div>
                <p className="mt-1.5 text-sm text-ink-300 font-light whitespace-pre-wrap">{a.body}</p>
                <div className="mt-1.5 text-[11px] text-ink-500">{new Date(a.createdAt).toLocaleDateString()} · {a.authorName}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Timesheet */}
        <section className="card p-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-gold-400"><Clock size={13} /> Timesheet</div>
            <span className="text-xs text-ink-300">{weekHours.toFixed(1)}h this week</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <input type="date" className="input !py-2 text-sm" value={te.date} onChange={(e) => setTe({ ...te, date: e.target.value })} />
            <input type="number" min={0} step={0.25} className="input !py-2 text-sm" placeholder="Hours" value={te.hours} onChange={(e) => setTe({ ...te, hours: e.target.value })} />
            <select className="input !py-2 text-sm col-span-2" value={te.projectId} onChange={(e) => setTe({ ...te, projectId: e.target.value })}><option value="">Project (optional)</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
            <input className="input !py-2 text-sm col-span-2" placeholder="Note (optional)" value={te.note} onChange={(e) => setTe({ ...te, note: e.target.value })} />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-ink-200"><input type="checkbox" checked={te.billable} onChange={(e) => setTe({ ...te, billable: e.target.checked })} className="h-4 w-4 accent-amber-500" /> Billable</label>
            <button onClick={logTime} disabled={teBusy || !te.hours} className="btn-gold text-sm !py-2 !px-4 disabled:opacity-60">{teBusy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Log</button>
          </div>
          <ul className="mt-4 pt-4 border-t border-line space-y-1.5 max-h-[200px] overflow-y-auto">
            {entries.length === 0 ? <li className="text-xs text-ink-500">No entries yet.</li> : entries.slice(0, 30).map((e) => (
              <li key={e.id} className="flex items-center justify-between text-xs gap-2">
                <span className="text-ink-300 truncate">{e.date.slice(5)} · {projName(e.projectId)} · {e.hours}h {e.billable ? "" : "(internal)"}</span>
                {!e.invoiced ? <button onClick={() => delTime(e.id)} className="text-red-400 hover:text-red-300 shrink-0"><Trash2 size={12} /></button> : <span className="text-green-300 text-[10px] uppercase shrink-0">billed</span>}
              </li>
            ))}
          </ul>
        </section>

        {/* Expense claims */}
        <section className="card p-7">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-gold-400"><Wallet size={13} /> Expense claims</div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <input type="date" className="input !py-2 text-sm" value={cl.date} onChange={(e) => setCl({ ...cl, date: e.target.value })} />
            <input type="number" min={0} className="input !py-2 text-sm" placeholder="Amount ₹" value={cl.amount} onChange={(e) => setCl({ ...cl, amount: e.target.value })} />
            <select className="input !py-2 text-sm" value={cl.category} onChange={(e) => setCl({ ...cl, category: e.target.value })}>{EXPENSE_CATS.map((c) => <option key={c}>{c}</option>)}</select>
            <input className="input !py-2 text-sm" placeholder="Description" value={cl.description} onChange={(e) => setCl({ ...cl, description: e.target.value })} />
          </div>
          <div className="mt-3">
            <MediaUpload accept="image" folder="aumoxo/receipts" signEndpoint="/api/staff/cloudinary-sign" value={cl.receiptUrl} valueType="image" label="Receipt (optional)" onChange={(url) => setCl({ ...cl, receiptUrl: url })} onClear={() => setCl({ ...cl, receiptUrl: "" })} />
          </div>
          <button onClick={submitClaim} disabled={clBusy || !cl.amount || !cl.description.trim()} className="btn-gold text-sm !py-2 !px-4 mt-3 disabled:opacity-60">{clBusy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Submit claim</button>
          <ul className="mt-4 pt-4 border-t border-line space-y-1.5 max-h-[160px] overflow-y-auto">
            {(me.claims?.length ?? 0) === 0 ? <li className="text-xs text-ink-500">No claims yet.</li> : me.claims!.map((c) => (
              <li key={c.id} className="flex items-center justify-between text-xs">
                <span className="text-ink-300">{c.date.slice(5)} · {c.category} · ₹{c.amount.toLocaleString()}</span>
                <span className={`uppercase tracking-wider ${c.status === "approved" ? "text-green-300" : c.status === "rejected" ? "text-red-400" : "text-amber-300"}`}>{c.status}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Profile */}
        <section className="card p-7">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-gold-400"><UserCircle size={13} /> My profile</div>
          <div className="mt-4 flex items-center gap-4">
            <div className="w-20 shrink-0">
              <MediaUpload accept="image" folder="aumoxo/staff" signEndpoint="/api/staff/cloudinary-sign" value={pf.photo} valueType="image" onChange={(url) => setPf({ ...pf, photo: url })} onClear={() => setPf({ ...pf, photo: "" })} />
            </div>
            <div className="text-sm">
              <div className="text-ink-100">{me.employee.name}</div>
              <div className="text-ink-400 text-xs">{me.employee.designation || me.employee.email}</div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <input className="input !py-2 text-sm" placeholder="Phone" value={pf.phone} onChange={(e) => setPf({ ...pf, phone: e.target.value })} />
            <input className="input !py-2 text-sm" placeholder="Address" value={pf.address} onChange={(e) => setPf({ ...pf, address: e.target.value })} />
            <input className="input !py-2 text-sm" placeholder="Emergency contact" value={pf.emergencyContact} onChange={(e) => setPf({ ...pf, emergencyContact: e.target.value })} />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button onClick={saveProfile} className="btn-gold text-sm !py-2 !px-4"><Check size={14} /> Save profile</button>
            {pfMsg && <span className="text-sm text-green-300">{pfMsg}</span>}
          </div>
        </section>

        {/* Holidays + Directory */}
        <section className="space-y-6">
          <div className="card p-7">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-gold-400"><CalendarDays size={13} /> Upcoming holidays</div>
            <ul className="mt-4 space-y-2">
              {(me.holidays?.length ?? 0) === 0 ? <li className="text-xs text-ink-500">None scheduled.</li> : me.holidays!.map((h) => (
                <li key={h.id} className="flex items-center justify-between text-sm"><span className="text-ink-200 font-light">{h.name}</span><span className="text-xs text-gold-300">{new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span></li>
              ))}
            </ul>
          </div>
          <div className="card p-7">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-gold-400"><Users size={13} /> Team directory</div>
            <div className="mt-4 grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto">
              {(me.directory || []).map((d) => (
                <div key={d.id} className="flex items-center gap-2">
                  {d.photo ? (/* eslint-disable-next-line @next/next/no-img-element */ <img src={d.photo} alt="" className="h-8 w-8 rounded-full object-cover border border-line" />) : <div className="h-8 w-8 rounded-full bg-gold-400/10 border border-gold-400/30 grid place-items-center text-[10px] text-gold-300">{d.name.slice(0, 2).toUpperCase()}</div>}
                  <div className="min-w-0"><div className="text-xs text-ink-100 truncate">{d.name}</div><div className="text-[10px] text-ink-400 truncate">{d.designation || ""}</div></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
