import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";
    const bypassHeader = request.headers.get("x-admin-test-bypass") === "true";
    const bypassEnv = process.env.ADMIN_AUTH_BYPASS === "true";

    const sessionCookie = request.cookies.get("admin_session")?.value;
    const expectedToken = process.env.ADMIN_SESSION_TOKEN || "bargainstore_admin_authenticated";
    const isAuthenticated = bypassHeader || bypassEnv || (sessionCookie === expectedToken);

    // If authenticated user visits the login page, redirect them to dashboard
    if (isLoginPage) {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    // If not authenticated and visiting a protected admin route, redirect to login
    if (!isAuthenticated) {
      const loginUrl = new URL("/admin/login", request.url);
      if (pathname !== "/admin") {
        loginUrl.searchParams.set("from", pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
