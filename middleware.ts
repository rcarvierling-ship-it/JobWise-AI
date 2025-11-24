import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Public routes
  const publicRoutes = ["/", "/auth", "/pricing", "/api/auth"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // If accessing a public route, allow
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If not authenticated and trying to access protected route
  if (!session?.user) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Check subscription for protected routes (except /api/auth and /pricing)
  if (
    !pathname.startsWith("/api/auth") &&
    pathname !== "/pricing" &&
    pathname !== "/"
  ) {
    const subscriptionStatus = session.user.subscriptionStatus;
    const subscriptionEndsAt = session.user.subscriptionEndsAt;

    if (subscriptionStatus) {
      const now = new Date();
      const endsAt = subscriptionEndsAt ? new Date(subscriptionEndsAt) : null;

      const isActive =
        subscriptionStatus === "active" ||
        (subscriptionStatus === "trial" && endsAt && endsAt > now);

      if (!isActive) {
        return NextResponse.redirect(new URL("/pricing", req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

