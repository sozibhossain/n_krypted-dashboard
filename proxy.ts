import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const role = req.nextauth.token?.role;
    const pathname = req.nextUrl.pathname;
    if (
      role === "restaurant_owner" &&
      !pathname.startsWith("/restaurants") &&
      !pathname.startsWith("/settings")
    ) {
      return NextResponse.redirect(new URL("/restaurants", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        if (
          pathname.startsWith("/signin") ||
          pathname.startsWith("/forgot-password") ||
          pathname.startsWith("/verify-otp") ||
          pathname.startsWith("/reset-password") ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/design")
        ) {
          return true;
        }
        return token?.role === "admin" || token?.role === "restaurant_owner";
      },
    },
    pages: {
      signIn: "/signin",
    },
  }
);

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|design|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
