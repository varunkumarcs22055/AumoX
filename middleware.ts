import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Protects /admin/* (except /admin/login) with a simple cookie check.
 * Set in /api/admin/login when password is correct. Replace with a real
 * auth provider (Auth.js, Clerk, Supabase Auth) when the DB is wired in.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const auth = req.cookies.get("aumox_admin_auth");
    if (!auth || auth.value !== "authenticated") {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
