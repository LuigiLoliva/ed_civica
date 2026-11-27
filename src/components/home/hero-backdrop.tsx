/** Atmosfera dell'hero: aloni in deriva lenta e trama a punti (nessun contenuto). */
export function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="animate-hero-drift absolute will-change-transform -top-[10%] -right-[10%] h-[80vmin] w-[80vmin] rounded-full bg-[radial-gradient(circle,rgb(0_158_219_/_26%),transparent_68%)]" />
      <div className="animate-hero-drift absolute will-change-transform -bottom-[24%] -left-[18%] h-[62vmin] w-[62vmin] rounded-full bg-[radial-gradient(circle,rgb(95_125_82_/_15%),transparent_70%)] [animation-delay:-6s]" />
      <div className="animate-hero-drift absolute will-change-transform top-[46%] left-[28%] h-[34vmin] w-[34vmin] rounded-full bg-[radial-gradient(circle,rgb(0_104_157_/_22%),transparent_70%)] [animation-delay:-11s]" />

      <svg
        className="absolute inset-0 h-full w-full opacity-[0.1] [mask-image:radial-gradient(ellipse_at_62%_50%,black_18%,transparent_78%)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="hero-dots" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.2" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-dots)" />
      </svg>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_90%_at_50%_45%,transparent_55%,rgb(4_14_26_/_55%)_100%)]" />
    </div>
  );
}
