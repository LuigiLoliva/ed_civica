/** Link "vai al contenuto" visibile solo a focus tastiera. */
export function SkipLink() {
  return (
    <a
      href="#contenuto-principale"
      className="fixed left-4 top-4 z-[100] -translate-y-16 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground opacity-0 shadow-md outline-none transition focus:translate-y-0 focus:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      Vai al contenuto principale
    </a>
  );
}
