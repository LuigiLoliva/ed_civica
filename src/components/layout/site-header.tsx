import Link from "next/link";

import { Button } from "@/components/ui/button";
import { OliveBranchIcon } from "@/components/icons/onu-motifs";
import { siteConfig } from "@/lib/site-config";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground transition-opacity hover:opacity-80"
        >
          <OliveBranchIcon className="size-8 text-primary" />
          <span className="font-heading text-xl font-semibold tracking-tight">
            {siteConfig.name}
          </span>
        </Link>

        <nav aria-label="Principale" className="hidden items-center gap-1 md:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            render={<Link href="/auth/login" />}
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
          >
            Area riservata
          </Button>
          <Button
            render={<Link href="/articoli" />}
            size="sm"
            className="md:hidden"
          >
            Articoli
          </Button>
        </div>
      </div>
    </header>
  );
}
