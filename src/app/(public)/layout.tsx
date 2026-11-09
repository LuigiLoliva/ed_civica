import { CookieNotice } from "@/components/layout/cookie-notice";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipLink } from "@/components/layout/skip-link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <SiteHeader />
      <main id="contenuto-principale" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
      <CookieNotice />
    </div>
  );
}
