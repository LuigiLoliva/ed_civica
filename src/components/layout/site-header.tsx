"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Magnetic } from "@/components/motion/magnetic";
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
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  siteName: string;
  logoUrl?: string | null;
}

export function SiteHeader({ siteName, logoUrl }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300",
        scrolled
          ? "border-border/70 bg-background/90 shadow-[0_8px_30px_rgb(10_28_46_/8%)] backdrop-blur-xl"
          : "border-border/40 bg-background/70 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          data-cursor="link"
          className="group flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-90"
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              className="h-8 w-auto max-w-[2.5rem] object-contain transition-transform duration-300 group-hover:scale-[1.04]"
            />
          ) : (
            <span className="flex size-9 items-center justify-center rounded-full bg-goal-17 text-white transition-transform duration-300 group-hover:scale-[1.04]">
              <OliveBranchIcon className="size-5" />
            </span>
          )}
          <span className="font-heading text-xl font-semibold tracking-tight">
            {siteName}
          </span>
        </Link>

        <nav aria-label="Principale" className="hidden items-center gap-0.5 md:flex">
          {siteConfig.nav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-cursor="link"
                aria-current={active ? "page" : undefined}
                className={cn(
                  "nav-link relative rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "nav-link-underline absolute inset-x-3 -bottom-0.5 h-px origin-left bg-primary transition-transform duration-300",
                    active ? "scale-x-100" : "scale-x-0",
                  )}
                  aria-hidden
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Magnetic strength={10} radius={80} className="hidden sm:inline-flex">
            <Button
              nativeButton={false}
              render={<Link href="/auth/login" data-cursor="cta" />}
              variant="outline"
              size="sm"
              className="border-goal-17/25"
            >
              Area riservata
            </Button>
          </Magnetic>

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
                ].map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                        active
                          ? "bg-secondary text-foreground"
                          : "text-foreground hover:bg-secondary",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
