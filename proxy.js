import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/register"];
const LOGIN_ROUTE = "/auth/login";
const HOME_AFTER_LOGIN = "/chat";

function getTokenClaims(token) {
  if (!token) return false;
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(atob(base64));
    return claims.exp * 1000 > Date.now() ? claims : null;
  } catch {
    return null;
  }
}

export function proxy(req) {
  const token = req.cookies.get("token")?.value;
  const sessionToken = req.cookies.get("shopanow_session")?.value;
  const claims = getTokenClaims(sessionToken || token);
  const valid = Boolean(claims);
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_ROUTES.includes(pathname);
  const isAdminPage = pathname.startsWith("/admin") || pathname.startsWith("/dean");

  if (isAdminPage && valid && claims.role !== "admin") {
    return NextResponse.redirect(new URL(HOME_AFTER_LOGIN, req.url));
  }

  // 1. Protected page without a valid token -> login, and clear any stale cookie
  if (!isPublic && !valid) {
    const res = NextResponse.redirect(new URL(LOGIN_ROUTE, req.url));
    if (token) res.cookies.delete("token");
    if (sessionToken) res.cookies.delete("shopanow_session");
    return res;
  }

  // 2. Public page with an expired/invalid token -> let them through, clear the stale cookie
  if (isPublic && token && !valid) {
    const res = NextResponse.next();
    if (token) res.cookies.delete("token");
    if (sessionToken) res.cookies.delete("shopanow_session");
    return res;
  }

  // 3. Already logged in -> skip the landing and auth pages
  if (isPublic && valid) {
    return NextResponse.redirect(
      new URL(claims.role === "admin" ? "/dean/dashboard" : HOME_AFTER_LOGIN, req.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  // run on all pages except static files, images and API routes
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
