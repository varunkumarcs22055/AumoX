import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  verifySessionToken,
  verifyClientToken,
  AUTH_COOKIE,
  CLIENT_COOKIE,
} from "@/lib/admin/auth";

/**
 * Three responsibilities:
 *  1. Protect /admin/* (except /admin/login) by verifying an HMAC-signed cookie.
 *  2. Protect /portal/* (except /portal/login) with the client session cookie.
 *  3. Forward the current pathname as `x-pathname` so server components
 *     (e.g. MaintenanceGate) can branch on it.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always forward the pathname so layouts know which route is rendering
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = req.cookies.get(AUTH_COOKIE)?.value;
    const result = await verifySessionToken(token);
    if (!result.ok) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("from", pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.set(AUTH_COOKIE, "", { path: "/", maxAge: 0 });
      return res;
    }
  }

  if (pathname.startsWith("/portal") && pathname !== "/portal/login") {
    const token = req.cookies.get(CLIENT_COOKIE)?.value;
    const result = await verifyClientToken(token);
    if (!result.ok) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/portal/login";
      loginUrl.search = "";
      const res = NextResponse.redirect(loginUrl);
      res.cookies.set(CLIENT_COOKIE, "", { path: "/", maxAge: 0 });
      return res;
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Run on all non-static paths so x-pathname is available everywhere
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo-mark.png|logo.jpeg|robots.txt|sitemap.xml).*)",
  ],
};
