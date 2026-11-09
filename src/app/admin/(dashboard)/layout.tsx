import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutAction } from "@/app/auth/login/actions";
import { AdminProviders } from "@/components/admin/AdminProviders";
import { AdminSubnav } from "@/components/admin/AdminSubnav";
import { OliveBranchIcon } from "@/components/icons/onu-motifs";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { countPendingRegistrations } from "@/lib/auth/profiles-store";
import {
  canAccessAdmin,
  getCurrentProfile,
  isActiveStatus,
  isSupabaseConfigured,
} from "@/lib/auth/roles";
import { profileToSessionUser } from "@/lib/auth/session-user";
import { countPendingComments } from "@/lib/comments/store";
import { getSiteSettings } from "@/lib/site-settings/get-site-settings";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  const settings = await getSiteSettings();

  if (isSupabaseConfigured()) {
    if (profile && !isActiveStatus(profile.status)) {
      redirect(`/auth/pending?status=${profile.status}`);
    }
    if (!canAccessAdmin(profile)) {
      redirect("/auth/login?next=/admin");
    }
  }

  const sessionUser = profile ? profileToSessionUser(profile) : null;
  const pendingComments = await countPendingComments().catch((err) => {
    console.error("[admin] countPendingComments:", err);
    return 0;
  });
  const pendingRegistrations = await countPendingRegistrations().catch(
    (err) => {
      console.error("[admin] countPendingRegistrations:", err);
      return 0;
    },
  );

  const displayName =
    profile?.full_name ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    profile?.email;

  return (
    <div className="min-h-dvh bg-warm-surface">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <OliveBranchIcon className="size-6 text-primary" />
            <div>
              <p className="text-sm font-semibold leading-none">
                {settings.siteName} · Admin
              </p>
              <p className="text-xs text-muted-foreground">
                {profile
                  ? `${displayName} · ${profile.role}`
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
          <AdminSubnav
            pendingComments={pendingComments}
            pendingRegistrations={pendingRegistrations}
          />
          {children}
        </AdminProviders>
      </div>
      <Toaster theme="light" richColors closeButton />
    </div>
  );
}
