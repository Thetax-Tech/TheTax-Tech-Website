import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Edge of the admin area: anything under /admin (except the auth pages) needs a valid,
 * unexpired session cookie. Full checks (user active, session version, role) run on the server.
 */
const PUBLIC_ADMIN = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_ADMIN.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isAdminApi = pathname.startsWith("/api/admin");
  if (isPublic) return NextResponse.next();

  const token = req.cookies.get("tx_session")?.value;
  let valid = false;
  if (token && process.env.AUTH_SECRET) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET), { algorithms: ["HS256"] });
      valid = true;
    } catch {}
  }

  if (!valid) {
    if (isAdminApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = pathname !== "/admin" ? `?next=${encodeURIComponent(pathname)}` : "";
    return NextResponse.redirect(url);
  }
  const res = NextResponse.next();
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
