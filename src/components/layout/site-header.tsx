"use client";

import Link from "next/link";
import { MenuIcon } from "lucide-react";
import { useState } from "react";

import { OliveBranchIcon } from "@/components/icons/onu-motifs";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig } from "@/lib/site-config";

interface SiteHeaderProps {
  siteName: string;
  logoUrl?: string | null;
}

export function SiteHeader({ siteName, logoUrl }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-80"
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              className="h-8 w-auto max-w-[2.5rem] object-contain"
            />
          ) : (
            <span className="flex size-9 items-center justify-center rounded-full bg-goal-17 text-white">
              <OliveBranchIcon className="size-5" />
            </span>
          )}
          <span className="font-heading text-xl font-semibold tracking-tight">
            {siteName}
          </span>
        </Link>

        <nav aria-label="Principale" className="hidden items-center gap-0.5 md:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
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
            className="hidden border-goal-17/25 sm:inline-flex"
          >
            Area riservata
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="md:hidden"
                  aria-label="Apri menu di navigazione"
                />
              }
            >
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100%,20rem)]">
              <SheetHeader>
                <SheetTitle className="font-heading">{siteName}</SheetTitle>
              </SheetHeader>
              <nav
                aria-label="Menu mobile"
                className="mt-6 flex flex-col gap-1 px-2"
              >
                {[
                  ...siteConfig.nav,
                  { href: "/auth/login", label: "Area riservata" },
                  { href: "/privacy", label: "Privacy Policy" },
                  { href: "/cookie", label: "Cookie Policy" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-3 text-sm font-medium text-foreground hover:bg-secondary"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
