import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "tunepoa-super-secret-key-change-in-production-2024"
);

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/admin"];

// Routes that are admin-only
const adminRoutes = ["/admin"];

// Routes that redirect away if already logged in
const authRoutes = ["/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("tunepoa_token")?.value;

  // Verify token if present
  let session: { userId: string; email: string; role: string } | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      session = {
        userId: payload.userId as string,
        email: payload.email as string,
        role: payload.role as string,
      };
    } catch {
      // Token is invalid/expired, clear it
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("tunepoa_token");
      return response;
    }
  }

  // Check protected routes
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isProtectedRoute && !session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check admin-only routes
  const isAdminRoute = adminRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isAdminRoute && session && session.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirect logged-in users away from auth pages
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isAuthRoute && session) {
    if (session.role === "admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Check if user is suspended (for protected routes)
  // Note: We can't easily check DB in middleware, so this is handled client-side
  // The API routes still enforce status checks

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, logo.png, etc.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|logo\\.png|robots\\.txt|sitemap\\.xml).*)",
  ],
};
