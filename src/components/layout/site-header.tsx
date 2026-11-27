"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { MenuIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Magnetic } from "@/components/motion/magnetic";
import { OliveBranchIcon } from "@/components/icons/onu-motifs";
import { useRouteTransition } from "@/components/shell/route-transition-store";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionEase, motionSpring } from "@/lib/motion/tokens";
import { getRouteMeta } from "@/lib/shell/route-meta";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  siteName: string;
  logoUrl?: string | null;
}

const mobileLinks = [
  ...siteConfig.nav,
  { href: "/auth/login", label: "Area riservata" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/cookie", label: "Cookie Policy" },
];

/**
 * Header della shell: capsula di vetro che si compatta allo scroll,
 * indicatore attivo che scivola tra le voci (anticipa la destinazione
 * durante la transizione) ed emblema che ruota a ogni cambio pagina.
 */
export function SiteHeader({ siteName, logoUrl }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [turns, setTurns] = useState(0);
  const pathname = usePathname();
  const { targetPath } = useRouteTransition();
  const reduceMotion = usePrefersReducedMotion();

  const activePath = targetPath ?? pathname;
  const accent = getRouteMeta(activePath).accent;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const prevPath = useRef(pathname);
  useEffect(() => {
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;
    setTurns((value) => value + 1);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return activePath === "/";
    return activePath === href || activePath.startsWith(`${href}/`);
  };

  return (
    <header
      className="shell-header sticky top-0 z-50"
      data-scrolled={scrolled ? "true" : "false"}
      data-accent={accent}
    >
      <div className="px-2 sm:px-4">
        <div className="shell-header-capsule mx-auto flex h-16 items-center justify-between gap-3 px-3 sm:px-5">
          <Link
            href="/"
            data-cursor="link"
            className="group flex items-center gap-2.5 text-foreground"
          >
            <span className="shell-header-emblem">
              <motion.span
                className="flex items-center justify-center"
                animate={reduceMotion ? undefined : { rotateY: turns * 360 }}
                transition={{ duration: 1.1, ease: motionEase.out }}
              >
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt=""
                    className="h-8 w-auto max-w-[2.5rem] object-contain"
                  />
                ) : (
                  <span className="shell-header-mark flex size-9 items-center justify-center rounded-full bg-goal-17 text-white">
                    <OliveBranchIcon className="size-5" />
                  </span>
                )}
              </motion.span>
            </span>
            <span className="font-heading text-xl font-semibold tracking-tight transition-[letter-spacing] duration-500 group-hover:tracking-normal">
              {siteName}
            </span>
          </Link>

          <nav
            aria-label="Principale"
            className="hidden items-center gap-0.5 md:flex"
            onMouseLeave={() => setHovered(null)}
          >
            {siteConfig.nav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-cursor="link"
                  aria-current={active ? "page" : undefined}
                  onMouseEnter={() => setHovered(item.href)}
                  onFocus={() => setHovered(item.href)}
                  onBlur={() => setHovered(null)}
                  className={cn(
                    "shell-nav-link relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-300",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {hovered === item.href ? (
                    <motion.span
                      layoutId={reduceMotion ? undefined : "shell-nav-hover"}
                      className="absolute inset-0 rounded-full bg-secondary/80"
                      transition={{ type: "spring", ...motionSpring.magnetic }}
                      aria-hidden
                    />
                  ) : null}
                  {active ? (
                    <motion.span
                      layoutId={reduceMotion ? undefined : "shell-nav-active"}
                      className="shell-nav-active absolute inset-x-3.5 bottom-0.5 h-[2px] rounded-full"
                      transition={{ type: "spring", ...motionSpring.magnetic }}
                      aria-hidden
                    />
                  ) : null}
                  <span className="shell-nav-roll relative z-10">
                    <span>{item.label}</span>
                    <span aria-hidden>{item.label}</span>
                  </span>
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
                className="shell-header-cta rounded-full border-goal-17/25 bg-white/60 px-4"
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
                    className="rounded-full bg-white/60 md:hidden"
                    aria-label="Apri menu di navigazione"
                  />
                }
              >
                <MenuIcon />
              </SheetTrigger>
              <SheetContent
                side="right"
                className="shell-mobile-menu w-full! border-white/10 bg-hero text-hero-foreground sm:max-w-sm!"
              >
                <SheetHeader className="px-6 pt-6">
                  <SheetTitle className="font-heading text-lg text-white">
                    {siteName}
                  </SheetTitle>
                  <SheetDescription className="text-xs tracking-[0.24em] text-blue-100/70 uppercase">
                    Agenda 2030 · Obiettivi 16 &amp; 17
                  </SheetDescription>
                </SheetHeader>
                <nav aria-label="Menu mobile" className="mt-2 px-4">
                  <ul className="flex flex-col">
                    {mobileLinks.map((item, index) => {
                      const active = isActive(item.href);
                      const primary = index < siteConfig.nav.length;
                      return (
                        <motion.li
                          key={item.href}
                          initial={reduceMotion ? false : { opacity: 0, x: 28 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.5,
                            delay: 0.08 + index * 0.05,
                            ease: motionEase.out,
                          }}
                        >
                          <Link
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "flex items-baseline gap-4 rounded-xl px-3 transition-colors",
                              primary
                                ? "border-b border-white/10 py-4 font-heading text-3xl font-semibold tracking-tight"
                                : "py-2.5 text-sm font-medium text-white/65",
                              active ? "text-amber-300" : "hover:text-blue-200",
                            )}
                          >
                            {primary ? (
                              <span
                                className="font-sans text-[0.65rem] font-semibold tracking-[0.2em] text-white/40"
                                aria-hidden
                              >
                                {String(index + 1).padStart(2, "0")}
                              </span>
                            ) : null}
                            {item.label}
                          </Link>
                        </motion.li>
                      );
                    })}
                  </ul>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <span className="shell-header-progress" aria-hidden />
    </header>
  );
}
