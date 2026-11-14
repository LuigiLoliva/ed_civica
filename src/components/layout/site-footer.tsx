import Link from "next/link";

import { OliveBranchIcon } from "@/components/icons/onu-motifs";
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
    <footer className="border-t border-border bg-goal-17 text-hero-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <OliveBranchIcon className="size-6 text-primary" />
            <p className="font-heading text-xl font-semibold">{settings.siteName}</p>
          </div>
          <p className="text-sm text-white/70">{settings.tagline}</p>
          <p className="text-sm text-white/55">
            {settings.schoolName} · {settings.className} · {settings.schoolYear}
          </p>
          {location ? (
            <p className="text-sm text-white/55">{location}</p>
          ) : null}
          {settings.contactEmail ? (
            <p className="text-sm text-white/55">
              <a
                href={`mailto:${settings.contactEmail}`}
                className="underline-offset-2 hover:text-white hover:underline"
              >
                {settings.contactEmail}
              </a>
            </p>
          ) : null}
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold tracking-wide text-white/90">
            Navigazione
          </p>
          <ul className="space-y-2 text-sm">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-white/60 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold tracking-wide text-white/90">
            Link utili
          </p>
          <ul className="space-y-2 text-sm">
            {siteConfig.footerLinks.map((item) => (
              <li key={item.href}>
                {"external" in item && item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 transition-colors hover:text-white"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className="text-white/60 transition-colors hover:text-white"
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
                  className="text-white/60 transition-colors hover:text-white"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/50">
        <div
          className="prose prose-sm mx-auto max-w-none text-white/50 prose-p:text-white/50 [&_a]:text-white/70 [&_p]:my-0"
          dangerouslySetInnerHTML={{ __html: settings.footerHtml }}
        />
        <p className="mt-2">
          <Link
            href="/privacy"
            className="underline-offset-2 hover:text-white hover:underline"
          >
            Privacy
          </Link>
          <span aria-hidden> · </span>
          <Link
            href="/cookie"
            className="underline-offset-2 hover:text-white hover:underline"
          >
            Cookie
          </Link>
        </p>
      </div>
    </footer>
  );
}
