/**
 * Fonte unica per la shell: ogni route visitabile → etichetta della
 * transizione, scena dell'atmosfera WebGL e accento.
 * La shell non agisce su /admin (CRUD) né sulle route tecniche.
 */

export type StageFormation =
  | "globe"
  | "wave"
  | "stream"
  | "ring"
  | "clusters"
  | "lattice"
  | "helix"
  | "portal"
  | "strata"
  | "scatter";

export type RouteAccent = "onu" | "goal16" | "goal17" | "olive";

export type RouteMeta = {
  key: string;
  /** Titolo mostrato nella title card di transizione. */
  label: string;
  /** Riga piccola sopra al titolo. */
  eyebrow: string;
  formation: StageFormation;
  accent: RouteAccent;
  /** Presenza dell'atmosfera, 0–1 (pagine di lettura più basse). */
  intensity: number;
  /** Centro della formazione in NDC (desktop). Su mobile x viene azzerato. */
  offset: readonly [number, number];
  scale: number;
};

const routes: { test: (path: string) => boolean; meta: RouteMeta }[] = [
  {
    test: (p) => p === "/",
    meta: {
      key: "home",
      label: "Home",
      eyebrow: "Voci Unite",
      formation: "globe",
      accent: "onu",
      intensity: 1,
      offset: [0.42, 0.02],
      scale: 1,
    },
  },
  {
    test: (p) => p === "/articoli",
    meta: {
      key: "articoli",
      label: "Articoli",
      eyebrow: "Redazione scolastica",
      formation: "wave",
      accent: "goal16",
      intensity: 0.9,
      offset: [0.1, -0.18],
      scale: 1.05,
    },
  },
  {
    test: (p) => p.startsWith("/articoli/"),
    meta: {
      key: "articolo",
      label: "Lettura",
      eyebrow: "Articolo",
      formation: "stream",
      accent: "goal16",
      intensity: 0.55,
      offset: [0, 0],
      scale: 1.1,
    },
  },
  {
    test: (p) => p.startsWith("/argomenti/"),
    meta: {
      key: "argomento",
      label: "Argomento",
      eyebrow: "Percorso tematico",
      formation: "ring",
      accent: "goal17",
      intensity: 0.85,
      offset: [0.46, 0.08],
      scale: 0.95,
    },
  },
  {
    test: (p) => p === "/progetto",
    meta: {
      key: "progetto",
      label: "Il progetto",
      eyebrow: "Chi siamo",
      formation: "clusters",
      accent: "goal17",
      intensity: 0.9,
      offset: [0.4, 0.04],
      scale: 1,
    },
  },
  {
    test: (p) => p === "/gioca",
    meta: {
      key: "gioca",
      label: "Gioca e impara",
      eyebrow: "Quiz e mini-giochi",
      formation: "lattice",
      accent: "onu",
      intensity: 0.95,
      offset: [0.44, 0.04],
      scale: 0.9,
    },
  },
  {
    test: (p) => p.startsWith("/gioca/quiz/"),
    meta: {
      key: "quiz",
      label: "Quiz",
      eyebrow: "Metti alla prova",
      formation: "helix",
      accent: "goal16",
      intensity: 0.6,
      offset: [0.62, 0],
      scale: 0.95,
    },
  },
  {
    test: (p) => p.startsWith("/gioca/giochi/"),
    meta: {
      key: "gioco",
      label: "Mini-gioco",
      eyebrow: "Gioca e impara",
      formation: "lattice",
      accent: "goal17",
      intensity: 0.5,
      offset: [0.6, 0],
      scale: 0.85,
    },
  },
  {
    test: (p) => p === "/registrati",
    meta: {
      key: "registrati",
      label: "Registrati",
      eyebrow: "Area studenti",
      formation: "portal",
      accent: "onu",
      intensity: 0.9,
      offset: [0, 0],
      scale: 1.1,
    },
  },
  {
    test: (p) => p.startsWith("/auth"),
    meta: {
      key: "auth",
      label: "Area riservata",
      eyebrow: "Accesso",
      formation: "portal",
      accent: "goal17",
      intensity: 0.9,
      offset: [0, 0],
      scale: 1.1,
    },
  },
  {
    test: (p) => p === "/privacy",
    meta: {
      key: "privacy",
      label: "Privacy",
      eyebrow: "Informativa",
      formation: "strata",
      accent: "goal17",
      intensity: 0.6,
      offset: [0.3, 0],
      scale: 1,
    },
  },
  {
    test: (p) => p === "/cookie",
    meta: {
      key: "cookie",
      label: "Cookie",
      eyebrow: "Informativa",
      formation: "strata",
      accent: "goal16",
      intensity: 0.6,
      offset: [0.3, 0],
      scale: 1,
    },
  },
];

const fallbackMeta: RouteMeta = {
  key: "altrove",
  label: "Voci Unite",
  eyebrow: "Pagina",
  formation: "scatter",
  accent: "onu",
  intensity: 0.8,
  offset: [0, 0],
  scale: 1,
};

export function getRouteMeta(pathname: string): RouteMeta {
  const path = normalizePath(pathname);
  return routes.find((route) => route.test(path))?.meta ?? fallbackMeta;
}

/** La shell (stage + transizioni) è attiva ovunque tranne nell'admin. */
export function isShellRoute(pathname: string): boolean {
  const path = normalizePath(pathname);
  return !(path === "/admin" || path.startsWith("/admin/"));
}

/** Destinazioni che non devono passare dalla transizione client. */
export function isTransitionTarget(pathname: string): boolean {
  const path = normalizePath(pathname);
  if (!isShellRoute(path)) return false;
  if (path.startsWith("/auth/callback") || path.startsWith("/api/")) return false;
  if (path.startsWith("/_next/")) return false;
  return !/\.[a-z0-9]{2,5}$/i.test(path);
}

export function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname || "/";
}

export const accentRgb: Record<RouteAccent, readonly [number, number, number]> = {
  onu: [0, 114, 186],
  goal16: [0, 78, 122],
  goal17: [11, 53, 84],
  olive: [24, 166, 106],
};
