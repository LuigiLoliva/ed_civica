import { CookieNotice } from "@/components/layout/cookie-notice";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipLink } from "@/components/layout/skip-link";
import { getSiteSettings } from "@/lib/site-settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <SiteHeader siteName={settings.siteName} logoUrl={settings.logoUrl} />
      <main id="contenuto-principale" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter settings={settings} />
      <CookieNotice />
    </div>
  );
}
