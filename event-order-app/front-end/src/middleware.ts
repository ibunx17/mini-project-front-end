import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DASHBOARD_PATH = "/dashboard";

function getUserFromRequest(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  console.log("Token from cookie:", token);
  if (!token) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    console.log("Decoded JWT payload:", payload);
    return payload;
  } catch (e) {
    console.log("JWT decode error:", e);
    return null;
  }
}

export function middleware(req: NextRequest) {
  console.log("Middleware running for:", req.nextUrl.pathname);
  if (req.nextUrl.pathname.startsWith(DASHBOARD_PATH)) {
    console.log("middleware function");
    const user = getUserFromRequest(req);

    if (!user) {
      console.log("User not found, redirecting to /login");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (user.role !== "event_organizer") {
      console.log("User role not allowed, redirecting to /forbidden");
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
