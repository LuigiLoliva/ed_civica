import Link from "next/link";

import { siteConfig } from "@/lib/site-config";
import { formatSchoolLocation } from "@/lib/site-settings/map";
import type { SiteSettings } from "@/lib/site-settings/types";

interface SiteFooterProps {
  settings: SiteSettings;
}

export function SiteFooter({ settings }: SiteFooterProps) {
  const location = formatSchoolLocation(settings);
  const socialEntries = [
    { key: "instagram", label: "Instagram", href: settings.socialLinks.instagram },
    {
      key: "schoolWebsite",
      label: "Sito della scuola",
      href: settings.socialLinks.schoolWebsite,
    },
    { key: "facebook", label: "Facebook", href: settings.socialLinks.facebook },
    { key: "youtube", label: "YouTube", href: settings.socialLinks.youtube },
  ].filter((item) => Boolean(item.href));

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="space-y-2">
          <p className="font-heading text-lg font-semibold">{settings.siteName}</p>
          <p className="text-sm text-muted-foreground">{settings.tagline}</p>
          <p className="text-sm text-muted-foreground">
            {settings.schoolName} · {settings.className} · {settings.schoolYear}
          </p>
          {location ? (
            <p className="text-sm text-muted-foreground">{location}</p>
          ) : null}
          {settings.contactEmail ? (
            <p className="text-sm text-muted-foreground">
              <a
                href={`mailto:${settings.contactEmail}`}
                className="underline-offset-2 hover:text-primary hover:underline"
              >
                {settings.contactEmail}
              </a>
            </p>
          ) : null}
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-foreground">Navigazione</p>
          <ul className="space-y-2 text-sm">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-foreground">Link utili</p>
          <ul className="space-y-2 text-sm">
            {siteConfig.footerLinks.map((item) => (
              <li key={item.href}>
                {"external" in item && item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
            {socialEntries.map((item) => (
              <li key={item.key}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
        <div
          className="prose prose-sm mx-auto max-w-none text-muted-foreground [&_p]:my-0"
          dangerouslySetInnerHTML={{ __html: settings.footerHtml }}
        />
        <p className="mt-2">
          <Link
            href="/privacy"
            className="underline-offset-2 hover:text-primary hover:underline"
          >
            Privacy
          </Link>
          <span aria-hidden> · </span>
          <Link
            href="/cookie"
            className="underline-offset-2 hover:text-primary hover:underline"
          >
            Cookie
          </Link>
        </p>
      </div>
    </footer>
  );
}
