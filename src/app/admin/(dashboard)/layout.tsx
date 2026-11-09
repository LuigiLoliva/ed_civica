import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutAction } from "@/app/auth/login/actions";
import { AdminProviders } from "@/components/admin/AdminProviders";
import { AdminSubnav } from "@/components/admin/AdminSubnav";
import { OliveBranchIcon } from "@/components/icons/onu-motifs";
import { Button } from "@/components/ui/button";
import {
  canAccessAdmin,
  getCurrentProfile,
  isSupabaseConfigured,
} from "@/lib/auth/roles";
import { profileToSessionUser } from "@/lib/auth/session-user";
import { countPendingComments } from "@/lib/comments/store";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!canAccessAdmin(profile)) {
    // Senza Supabase configurato mostriamo comunque la shell con avviso,
    // così la struttura admin è ispezionabile in locale.
    if (isSupabaseConfigured()) {
      redirect("/auth/login?next=/admin");
    }
  }

  const sessionUser = profile ? profileToSessionUser(profile) : null;
  const pendingComments = await countPendingComments().catch((err) => {
    console.error("[admin] countPendingComments:", err);
    return 0;
  });

  return (
    <div className="min-h-dvh bg-warm-surface">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <OliveBranchIcon className="size-6 text-primary" />
            <div>
              <p className="text-sm font-semibold leading-none">
                {siteConfig.name} · Admin
              </p>
              <p className="text-xs text-muted-foreground">
                {profile
                  ? `${profile.full_name || profile.email} · ${profile.role}`
                  : "Anteprima locale (Supabase non configurato)"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button render={<Link href="/" />} variant="ghost" size="sm">
              Sito pubblico
            </Button>
            {profile ? (
              <form action={logoutAction}>
                <Button type="submit" variant="outline" size="sm">
                  Esci
                </Button>
              </form>
            ) : (
              <Button
                render={<Link href="/auth/login" />}
                variant="outline"
                size="sm"
              >
                Accedi
              </Button>
            )}
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <AdminProviders
          key={sessionUser?.id ?? "demo"}
          sessionUser={sessionUser}
        >
          <AdminSubnav pendingComments={pendingComments} />
          {children}
        </AdminProviders>
      </div>
    </div>
  );
}
