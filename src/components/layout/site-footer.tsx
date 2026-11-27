import Link from "next/link";

import { OliveBranchIcon } from "@/components/icons/onu-motifs";
import { BackToTop, FooterWordmark } from "@/components/layout/footer-motion";
import { Reveal } from "@/components/motion/reveal";
import { Spotlight } from "@/components/motion/spotlight";
import { siteConfig } from "@/lib/site-config";
import { formatSchoolLocation } from "@/lib/site-settings/map";
import type { SiteSettings } from "@/lib/site-settings/types";

interface SiteFooterProps {
  settings: SiteSettings;
}

/**
 * Footer della shell: orizzonte notturno con aurora lenta, alone che segue
 * il cursore, colonne in reveal sfalsato e wordmark che emerge allo scroll.
 */
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
    <footer className="shell-footer relative isolate overflow-hidden text-hero-foreground">
      <div className="shell-footer-aurora" aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <div className="shell-footer-grid" aria-hidden />

      <Spotlight color="rgb(30 58 138 / 20%)" size={520}>
        <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20">
          <div className="grid gap-10 md:grid-cols-[1.35fr_1fr_1fr]">
            <Reveal className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="shell-footer-mark">
                  <OliveBranchIcon className="size-6 text-amber-300" />
                </span>
                <p className="font-heading text-2xl font-semibold">
                  {settings.siteName}
                </p>
              </div>
              <p className="max-w-sm text-sm text-white/75 text-pretty">
                {settings.tagline}
              </p>
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
                    className="shell-footer-link"
                  >
                    {settings.contactEmail}
                  </a>
                </p>
              ) : null}
            </Reveal>

            <Reveal delay={0.08}>
              <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-white/50 uppercase">
                Navigazione
              </p>
              <ul className="space-y-2.5 text-sm">
                {siteConfig.nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      data-cursor="link"
                      className="shell-footer-link"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-white/50 uppercase">
                Link utili
              </p>
              <ul className="space-y-2.5 text-sm">
                {siteConfig.footerLinks.map((item) => (
                  <li key={item.href}>
                    {"external" in item && item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cursor="link"
                        className="shell-footer-link"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        data-cursor="link"
                        className="shell-footer-link"
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
                      data-cursor="link"
                      className="shell-footer-link"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <FooterWordmark name={settings.siteName} />
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-5 text-xs text-white/50 sm:flex-row sm:justify-between sm:px-6">
            <div
              className="prose prose-sm max-w-none text-center text-white/50 prose-p:text-white/50 sm:text-left [&_a]:text-white/70 [&_p]:my-0"
              dangerouslySetInnerHTML={{ __html: settings.footerHtml }}
            />
            <div className="flex items-center gap-5">
              <p>
                <Link href="/privacy" className="shell-footer-link">
                  Privacy
                </Link>
                <span aria-hidden> · </span>
                <Link href="/cookie" className="shell-footer-link">
                  Cookie
                </Link>
              </p>
              <BackToTop />
            </div>
          </div>
        </div>
      </Spotlight>
    </footer>
  );
}
