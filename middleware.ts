import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/app/:path*",
    "/login",
    "/signup",
    "/auth/callback",
    "/api/chat/:path*",
    "/api/projects/:path*",
    "/api/deliverables/:path*",
    "/api/conversations/:path*",
    "/api/memories/:path*",
    "/api/profile/:path*",
    "/api/billing/checkout",
    "/api/billing/portal",
    "/api/billing/status",
    "/api/billing/paypal/return",
  ],
};
