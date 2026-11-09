import Link from "next/link";

import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="space-y-2">
          <p className="font-heading text-lg font-semibold">{siteConfig.name}</p>
          <p className="text-sm text-muted-foreground">{siteConfig.tagline}</p>
          <p className="text-sm text-muted-foreground">
            {siteConfig.school.name} · {siteConfig.school.className} ·{" "}
            {siteConfig.school.year}
          </p>
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
          </ul>
        </div>
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
        <p>
          Progetto scolastico di Educazione Civica · Contenuti da verificare con
          i docenti
        </p>
        <p className="mt-1">
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
