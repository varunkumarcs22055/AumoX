import Image from "next/image";
import { headers } from "next/headers";
import { maintenanceDb } from "@/lib/admin/db";

/**
 * Server gate component. On every request it:
 *   1. Reads the maintenance flag from the DB
 *   2. Reads x-pathname header (set by middleware)
 *   3. If maintenance is ON and the request is NOT for /admin, replaces the
 *      page content with the maintenance screen. Admins can still log in.
 */
export default async function MaintenanceGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const pathname = h.get("x-pathname") || "/";
  // Admin stays reachable to lift maintenance; the client portal is a
  // logged-in app — clients keep access to their project status.
  const isExempt =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/portal") ||
    pathname.startsWith("/staff");

  const m = await maintenanceDb
    .get()
    .catch(() => ({ enabled: false } as const));

  if (!m.enabled || isExempt) return <>{children}</>;

  return (
    <div className="min-h-screen bg-bg-base text-ink-100 grid place-items-center px-6">
      <div className="text-center max-w-lg">
        <Image
          src="/logo-mark.png"
          alt="AUMOXO"
          width={120}
          height={120}
          className="mx-auto"
          priority
        />
        <div className="mt-6 text-[11px] uppercase tracking-[0.35em] text-gold-400">
          Scheduled Maintenance
        </div>
        <h1 className="mt-4 font-display text-4xl md:text-5xl font-extralight text-ink-100 leading-tight">
          We&apos;ll be right back.
        </h1>
        <p className="mt-5 text-ink-300 font-light leading-relaxed">
          {m.message ||
            "AUMOXO is making improvements to the website. Please check back in a few minutes."}
        </p>
        <p className="mt-8 text-xs text-ink-400">
          For urgent matters, email{" "}
          <a
            className="text-gold-300 hover:underline"
            href="mailto:hello@aumoxo.tech"
          >
            hello@aumoxo.tech
          </a>
        </p>
      </div>
    </div>
  );
}
