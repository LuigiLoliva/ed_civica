"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/articoli/nuovo", label: "Nuovo articolo" },
  { href: "/admin/argomenti", label: "Argomenti" },
  { href: "/admin/utenti", label: "Utenti" },
  {
    href: "/admin/commenti",
    label: "Commenti",
    badgeKey: "pendingComments" as const,
  },
  { href: "/admin/quiz", label: "Quiz" },
  { href: "/admin/impostazioni", label: "Impostazioni" },
];

type Props = {
  pendingComments?: number;
};

export function AdminSubnav({ pendingComments = 0 }: Props) {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex flex-wrap gap-1 border-b border-border pb-3">
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);
        const badge =
          link.badgeKey === "pendingComments" && pendingComments > 0
            ? pendingComments
            : null;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {link.label}
            {badge !== null && (
              <span
                className={cn(
                  "inline-flex min-w-5 items-center justify-center rounded-md px-1.5 text-xs font-semibold",
                  active
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-100",
                )}
                aria-label={`${badge} commenti in attesa`}
              >
                {badge > 99 ? "99+" : badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
