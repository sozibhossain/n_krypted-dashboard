import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // If visiting auth pages, allow
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
        // Protected routes require token
        return !!token;
      },
    },
    pages: {
      signIn: "/signin",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - design (design images in public)
     * - images
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|design|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
