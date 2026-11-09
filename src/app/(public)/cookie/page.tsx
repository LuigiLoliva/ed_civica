import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
};

export default function CookiePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Cookie Policy
      </h1>
      <p className="mt-4 text-muted-foreground">
        Testo base da far validare alla scuola. Il sito utilizza cookie tecnici
        necessari all&apos;autenticazione (area riservata) e al funzionamento
        della sessione. Eventuali strumenti di analytics privacy-friendly
        (es. Vercel Analytics o Plausible) saranno documentati qui prima
        dell&apos;attivazione.
      </p>
    </div>
  );
}
