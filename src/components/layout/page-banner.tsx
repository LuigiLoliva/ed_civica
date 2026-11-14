import type { ReactNode } from "react";

type PageBannerProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

/** Intestazione pagine pubbliche: atmosfera leggera, un titolo, un supporto. */
export function PageBanner({ title, description, children }: PageBannerProps) {
  return (
    <header className="bg-page-banner border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-base text-muted-foreground text-pretty sm:text-lg">
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </header>
  );
}
