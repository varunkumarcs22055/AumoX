"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Inbox,
  Briefcase,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Users,
  FolderKanban,
  TrendingUp,
  Receipt,
  ListChecks,
} from "lucide-react";
import { LogoMark } from "@/components/Logo";

const links = [
  { href: "/admin",           label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/queries",   label: "Inbox",     icon: Inbox },
  { href: "/admin/leads",     label: "Leads",     icon: TrendingUp },
  { href: "/admin/clients",   label: "Clients",   icon: Users },
  { href: "/admin/projects",  label: "Projects",  icon: FolderKanban },
  { href: "/admin/invoices",  label: "Invoices",  icon: Receipt },
  { href: "/admin/tasks",     label: "Tasks",     icon: ListChecks },
  { href: "/admin/careers",   label: "Careers",   icon: Briefcase },
  { href: "/admin/insights",  label: "Insights",  icon: BookOpen },
  { href: "/admin/settings",  label: "Settings",  icon: Settings },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-bg-base text-ink-100 flex">
      {/* SIDEBAR */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-bg-surface border-r border-line p-6 flex flex-col transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <Link href="/admin" className="inline-flex items-center gap-3">
            <LogoMark size={32} />
            <div>
              <div className="text-sm font-medium tracking-wider">AUMOXO</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-gold-400">Admin</div>
            </div>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden p-1 text-ink-300">
            <X size={20} />
          </button>
        </div>

        <nav className="mt-10 flex flex-col gap-1">
          {links.map((l) => {
            const Icon = l.icon;
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-gold-400/15 text-gold-300 border border-gold-400/30"
                    : "text-ink-300 hover:text-gold-300 hover:bg-bg-elevated"
                }`}
              >
                <Icon size={16} />
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 text-xs text-ink-400 hover:text-gold-300 transition-colors"
          >
            <ExternalLink size={14} /> View live site
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-ink-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={14} /> Log out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-bg-base border-b border-line p-4 flex items-center justify-between">
          <button onClick={() => setOpen(true)} className="p-1 text-ink-200">
            <Menu size={22} />
          </button>
          <span className="text-sm tracking-[0.3em] uppercase text-gold-400">Admin</span>
          <LogoMark size={24} />
        </div>

        <main className="p-6 lg:p-10 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
