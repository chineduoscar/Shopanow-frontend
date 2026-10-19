import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/register"];
const LOGIN_ROUTE = "/auth/login";
const HOME_AFTER_LOGIN = "/chat";

// Reads the "exp" claim from a JWT (no library needed).
// NOTE: this only decodes the token, it does not verify the signature.
// Your backend must still verify it on every API call.
function isTokenValid(token) {
  if (!token) return false;
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(base64));
    // No exp claim = treated as valid. Make sure your backend sets expiresIn.
    return !exp || exp * 1000 > Date.now();
  } catch {
    return false; // malformed token
  }
}

export function proxy(req) {
  const token = req.cookies.get("token")?.value;
  const valid = isTokenValid(token);
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  // 1. Protected page without a valid token -> login, and clear any stale cookie
  if (!isPublic && !valid) {
    const res = NextResponse.redirect(new URL(LOGIN_ROUTE, req.url));
    if (token) res.cookies.delete("token");
    return res;
  }

  // 2. Public page with an expired/invalid token -> let them through, clear the stale cookie
  if (isPublic && token && !valid) {
    const res = NextResponse.next();
    res.cookies.delete("token");
    return res;
  }

  // 3. Already logged in -> skip the landing and auth pages
  if (isPublic && valid) {
    return NextResponse.redirect(new URL(HOME_AFTER_LOGIN, req.url));
  }

  return NextResponse.next();
}

export const config = {
  // run on all pages except static files, images and API routes
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
