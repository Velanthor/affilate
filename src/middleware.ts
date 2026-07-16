import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_DASHBOARD = "/dashboard";
const PROTECTED_ADMIN = "/admin";
const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/reset-password"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtectedDashboard = path.startsWith(PROTECTED_DASHBOARD);
  const isProtectedAdmin = path.startsWith(PROTECTED_ADMIN);
  const isAuthPage = AUTH_PAGES.some((p) => path.startsWith(p));

  if ((isProtectedDashboard || isProtectedAdmin) && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(redirectUrl);
  }

  if (isProtectedAdmin && user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Referral link capture: /?ref=username or /ref/username
  const refParam = request.nextUrl.searchParams.get("ref");
  const refPathMatch = path.match(/^\/ref\/([a-zA-Z0-9_-]+)$/);
  const refCode = refParam ?? refPathMatch?.[1];

  if (refCode) {
    response.cookies.set("velanthor_ref", refCode, {
      maxAge: 60 * 60 * 24 * 90, // 90 days
      httpOnly: false, // must be readable client-side for the tracking beacon
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    if (refPathMatch) {
      const target = new URL("/", request.url);
      target.searchParams.set("ref", refCode);
      return NextResponse.redirect(target);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|api/track).*)",
  ],
};
