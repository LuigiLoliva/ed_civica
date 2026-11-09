import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Aggiorna la sessione Auth sui cookie della request.
 * Usato da `src/middleware.ts`.
 * Su /admin richiede sessione + profilo status active (via redirect a pending).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Senza variabili d'ambiente (ambiente locale incompleto) non blocchiamo
  // il sito pubblico: le route /admin saranno protette quando Supabase è configurato.
  if (!url || !anonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname.startsWith("/auth/login");
  const isPendingRoute = pathname.startsWith("/auth/pending");
  const isRegisterRoute = pathname.startsWith("/registrati");

  if (isAdminRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && (isAdminRoute || isLoginRoute || isRegisterRoute)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .maybeSingle();

    const status =
      typeof profile?.status === "string" ? profile.status : "active";

    if (status !== "active" && isAdminRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/auth/pending";
      redirectUrl.searchParams.set("status", status);
      return NextResponse.redirect(redirectUrl);
    }

    if (status === "active" && (isLoginRoute || isRegisterRoute)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/admin";
      return NextResponse.redirect(redirectUrl);
    }

    if (status !== "active" && isLoginRoute && !isPendingRoute) {
      // lascia passare login (per mostrare messaggio) — già gestito dall'action
    }
  }

  return supabaseResponse;
}
