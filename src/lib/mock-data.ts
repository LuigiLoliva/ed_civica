/**
 * Dati dimostrativi per la Fase 2 (sito pubblico).
 * Da sostituire con query Supabase quando il progetto è collegato.
 * Slug argomenti allineati a `supabase/seed/01_topics.sql`.
 * I testi segnaposto vanno revisionati dai docenti.
 */

export type MockTopic = {
  slug: string;
  name: string;
  description: string;
  color: string;
};

export type MockAuthor = {
  firstName: string;
  lastName: string;
};

export type MockSource = {
  title: string;
  url: string;
  consultedAt: string;
};

export type MockImage = {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
};

export type MockArticle = {
  slug: string;
  title: string;
  summary: string;
  topicSlug: string;
  authors: MockAuthor[];
  publishedAt: string;
  readingMinutes: number;
  featured?: boolean;
  coverGradient: string;
  body: string[];
  images: MockImage[];
  sources: MockSource[];
};

export type MockGamePreview = {
  slug: string;
  title: string;
  description: string;
  status: "coming-soon" | "ready";
};

export const topics: MockTopic[] = [
  {
    slug: "onu-storia-struttura",
    name: "ONU: storia e struttura",
    description:
      "Origini, Carta delle Nazioni Unite e organi principali.",
    color: "#009EDB",
  },
  {
    slug: "obiettivo-16",
    name: "Obiettivo 16",
    description: "Pace, giustizia e istituzioni solide.",
    color: "#00689D",
  },
  {
    slug: "obiettivo-17",
    name: "Obiettivo 17",
    description: "Partnership per gli obiettivi.",
    color: "#19486A",
  },
  {
    slug: "diritti-umani",
    name: "Diritti umani",
    description:
      "Dichiarazione Universale e tutela internazionale dei diritti.",
    color: "#4A90A4",
  },
  {
    slug: "giustizia-internazionale",
    name: "Giustizia internazionale",
    description:
      "Corte Internazionale di Giustizia, CPI e diritto internazionale.",
    color: "#2F6F8F",
  },
  {
    slug: "cooperazione-partnership",
    name: "Cooperazione e partnership",
    description:
      "Cooperazione tra Stati, società civile, scuole e imprese.",
    color: "#3D7A9C",
  },
  {
    slug: "attualita",
    name: "Attualità",
    description:
      "Notizie e approfondimenti collegati a ONU e Agenda 2030.",
    color: "#5B8FA8",
  },
];

export const articles: MockArticle[] = [
  {
    slug: "cose-lonu-in-breve",
    title: "Cos'è l'ONU, in breve",
    summary:
      "Una mappa essenziale dell'Organizzazione delle Nazioni Unite: nascita, missione e organi principali.",
    topicSlug: "onu-storia-struttura",
    authors: [
      { firstName: "Giulia", lastName: "Rossi" },
      { firstName: "Marco", lastName: "Bianchi" },
    ],
    publishedAt: "2026-03-10",
    readingMinutes: 5,
    featured: true,
    coverGradient: "from-primary to-goal-16",
    body: [
      "[TESTO SEGNAPOSTO — da revisionare] L'Organizzazione delle Nazioni Unite nasce nel 1945 per promuovere la pace, la sicurezza e la cooperazione tra gli Stati.",
      "Tra gli organi principali troviamo l'Assemblea Generale, il Consiglio di Sicurezza, la Corte Internazionale di Giustizia, l'ECOSOC e il Segretariato.",
      "Questo articolo introduce il linguaggio e le istituzioni che torneranno negli approfondimenti sugli Obiettivi 16 e 17.",
    ],
    images: [],
    sources: [
      {
        title: "United Nations — About Us",
        url: "https://www.un.org/en/about-us",
        consultedAt: "2026-03-01",
      },
    ],
  },
  {
    slug: "obiettivo-16-pace-e-giustizia",
    title: "Obiettivo 16: pace, giustizia e istituzioni solide",
    summary:
      "Perché l'Obiettivo 16 è centrale per democrazia, diritti e fiducia nelle istituzioni.",
    topicSlug: "obiettivo-16",
    authors: [{ firstName: "Sara", lastName: "Esposito" }],
    publishedAt: "2026-03-12",
    readingMinutes: 7,
    featured: true,
    coverGradient: "from-goal-16 to-goal-17",
    body: [
      "[TESTO SEGNAPOSTO — da revisionare] L'Obiettivo 16 chiede società pacifiche, giuste e inclusive, con istituzioni efficaci e responsabili.",
      "Include target su violenza, corruzione, accesso alla giustizia e partecipazione decisionale.",
      "Nel percorso scolastico approfondiremo casi concreti e indicatori ufficiali.",
    ],
    images: [],
    sources: [
      {
        title: "SDG 16 — Peace, Justice and Strong Institutions",
        url: "https://sdgs.un.org/goals/goal16",
        consultedAt: "2026-03-02",
      },
    ],
  },
  {
    slug: "obiettivo-17-partnership",
    title: "Obiettivo 17: partnership per gli obiettivi",
    summary:
      "Nessun Paese e nessuna scuola raggiungono l'Agenda 2030 da soli: ecco perché contano le alleanze.",
    topicSlug: "obiettivo-17",
    authors: [
      { firstName: "Luca", lastName: "Ferrari" },
      { firstName: "Anna", lastName: "Romano" },
    ],
    publishedAt: "2026-03-14",
    readingMinutes: 6,
    featured: true,
    coverGradient: "from-goal-17 to-primary",
    body: [
      "[TESTO SEGNAPOSTO — da revisionare] L'Obiettivo 17 promuove partnership globali e locali per mobilizzare risorse, conoscenze e tecnologie.",
      "Scuole, ONG, imprese e istituzioni possono collaborare su progetti concreti di Educazione Civica.",
      "Questo blog è proprio un esempio di partnership educativa.",
    ],
    images: [],
    sources: [
      {
        title: "SDG 17 — Partnerships for the Goals",
        url: "https://sdgs.un.org/goals/goal17",
        consultedAt: "2026-03-03",
      },
    ],
  },
  {
    slug: "diritti-umani-e-dichiarazione",
    title: "Diritti umani e Dichiarazione Universale",
    summary:
      "Dal 1948 a oggi: cosa significa tutelare i diritti fondamentali nel sistema ONU.",
    topicSlug: "diritti-umani",
    authors: [{ firstName: "Elena", lastName: "Conti" }],
    publishedAt: "2026-03-16",
    readingMinutes: 6,
    coverGradient: "from-primary/80 to-goal-16",
    body: [
      "[TESTO SEGNAPOSTO — da revisionare] La Dichiarazione Universale dei Diritti Umani del 1948 è un riferimento etico e giuridico globale.",
      "Collega direttamente l'Obiettivo 16 alla tutela della dignità di ogni persona.",
    ],
    images: [],
    sources: [
      {
        title: "Dichiarazione Universale dei Diritti Umani",
        url: "https://www.un.org/en/about-us/universal-declaration-of-human-rights",
        consultedAt: "2026-03-04",
      },
    ],
  },
  {
    slug: "cooperare-a-scuola-per-lagenda-2030",
    title: "Cooperare a scuola per l'Agenda 2030",
    summary:
      "Come una classe può diventare laboratorio di partnership (Obiettivo 17) partendo da piccoli progetti.",
    topicSlug: "cooperazione-partnership",
    authors: [
      { firstName: "Davide", lastName: "Galli" },
      { firstName: "Chiara", lastName: "Moretti" },
    ],
    publishedAt: "2026-03-18",
    readingMinutes: 5,
    coverGradient: "from-goal-16/80 to-primary",
    body: [
      "[TESTO SEGNAPOSTO — da revisionare] La cooperazione non è solo diplomazia: inizia dalle relazioni in classe, dal confronto e dalla responsabilità condivisa.",
      "Progetti, quiz e articoli di questo blog sono strumenti per praticare l'Obiettivo 17.",
    ],
    images: [],
    sources: [
      {
        title: "Agenda 2030 — ASviS",
        url: "https://asvis.it/l-agenda-2030-dell-onu/",
        consultedAt: "2026-03-05",
      },
    ],
  },
  {
    slug: "istituzioni-solide-e-partecipazione",
    title: "Istituzioni solide e partecipazione dei giovani",
    summary:
      "Perché la fiducia nelle istituzioni e la partecipazione civica rientrano nell'Obiettivo 16.",
    topicSlug: "obiettivo-16",
    authors: [{ firstName: "Matteo", lastName: "Ricci" }],
    publishedAt: "2026-03-20",
    readingMinutes: 4,
    coverGradient: "from-goal-16 to-primary/70",
    body: [
      "[TESTO SEGNAPOSTO — da revisionare] Partecipare significa informarsi, discutere e contribuire alle decisioni che riguardano la comunità.",
      "I giovani possono esercitare cittadinanza attiva anche attraverso la scrittura e i media scolastici.",
    ],
    images: [],
    sources: [
      {
        title: "SDG 16 Targets",
        url: "https://sdgs.un.org/goals/goal16#targets_and_indicators",
        consultedAt: "2026-03-06",
      },
    ],
  },
];

export const gamePreviews: MockGamePreview[] = [
  {
    slug: "memory-obiettivi",
    title: "Memory degli Obiettivi",
    description:
      "Abbina simboli e parole chiave degli SDG, con focus su 16 e 17.",
    status: "coming-soon",
  },
  {
    slug: "vero-falso",
    title: "Vero o Falso a scorrimento",
    description: "Affermazioni sull'ONU: rispondi scorrendo o con le frecce.",
    status: "coming-soon",
  },
  {
    slug: "abbina-principio",
    title: "Abbina il principio",
    description: "Collega gli organi ONU alle loro funzioni.",
    status: "coming-soon",
  },
  {
    slug: "costruisci-partnership",
    title: "Costruisci la partnership",
    description: "Collega attori diversi per raggiungere un obiettivo comune.",
    status: "coming-soon",
  },
];

export function getTopicBySlug(slug: string) {
  return topics.find((topic) => topic.slug === slug);
}

export function getArticleBySlug(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function getArticlesByTopic(topicSlug: string) {
  return articles.filter((article) => article.topicSlug === topicSlug);
}

export function getRelatedArticles(article: MockArticle, limit = 3) {
  return articles
    .filter(
      (item) =>
        item.topicSlug === article.topicSlug && item.slug !== article.slug,
    )
    .slice(0, limit);
}

export function getFeaturedArticles() {
  return articles.filter((article) => article.featured);
}

export function getLatestArticles(limit = 4) {
  return [...articles]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit);
}

export const mockStats = {
  articles: articles.length,
  authors: new Set(
    articles.flatMap((article) =>
      article.authors.map((author) => `${author.firstName}-${author.lastName}`),
    ),
  ).size,
  quizzes: 3,
};
