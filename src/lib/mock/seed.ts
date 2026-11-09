import type { MockArticle, MockTopic, MockUser } from "@/lib/mock/article-types";

export const MOCK_USERS: MockUser[] = [
  {
    id: "u-admin-1",
    email: "docente@scuola.it",
    nome: "Maria",
    cognome: "Rossi",
    role: "admin",
  },
  {
    id: "u-stud-1",
    email: "studente1@scuola.it",
    nome: "Luca",
    cognome: "Bianchi",
    role: "studente",
  },
  {
    id: "u-stud-2",
    email: "studente2@scuola.it",
    nome: "Giulia",
    cognome: "Verdi",
    role: "studente",
  },
];

export const MOCK_TOPICS: MockTopic[] = [
  {
    id: "t-onu",
    name: "ONU: storia e struttura",
    slug: "onu-storia-struttura",
    description: "Origini, organi principali e missione delle Nazioni Unite.",
    color: "#009EDB",
  },
  {
    id: "t-16",
    name: "Obiettivo 16",
    slug: "obiettivo-16",
    description: "Pace, giustizia e istituzioni solide.",
    color: "#00689D",
  },
  {
    id: "t-17",
    name: "Obiettivo 17",
    slug: "obiettivo-17",
    description: "Partnership per gli obiettivi.",
    color: "#19486A",
  },
  {
    id: "t-diritti",
    name: "Diritti umani",
    slug: "diritti-umani",
    description: "Dichiarazione universale e tutela internazionale.",
    color: "#4A7C59",
  },
  {
    id: "t-attualita",
    name: "Attualità",
    slug: "attualita",
    description: "Notizie e approfondimenti recenti su ONU e Agenda 2030.",
    color: "#C45C26",
  },
];

const now = new Date().toISOString();

export const MOCK_ARTICLES: MockArticle[] = [
  {
    id: "a-1",
    title: "Cos'è l'ONU e perché esiste",
    slug: "cose-lonu-e-perche-esiste",
    topicId: "t-onu",
    authors: [{ firstName: "Luca", lastName: "Bianchi" }],
    excerpt:
      "Una introduzione alla nascita delle Nazioni Unite dopo la Seconda guerra mondiale.",
    body: "<h2>Le origini</h2><p>[TESTO SEGNAPOSTO] L'Organizzazione delle Nazioni Unite nasce nel 1945 per promuovere la pace e la cooperazione internazionale.</p>",
    images: [],
    sources: [
      {
        id: "s-1",
        title: "United Nations — About Us",
        url: "https://www.un.org/en/about-us",
        consultedAt: "2026-03-01",
      },
    ],
    status: "pubblicato",
    authorUserId: "u-stud-1",
    featured: true,
    createdAt: "2026-02-10T10:00:00.000Z",
    updatedAt: "2026-02-12T10:00:00.000Z",
    publishedAt: "2026-02-12T10:00:00.000Z",
  },
  {
    id: "a-2",
    title: "Obiettivo 16: giustizia e istituzioni",
    slug: "obiettivo-16-giustizia-e-istituzioni",
    topicId: "t-16",
    authors: [
      { firstName: "Giulia", lastName: "Verdi" },
      { firstName: "Luca", lastName: "Bianchi" },
    ],
    excerpt:
      "Cosa significa costruire istituzioni solide e accessibili per tutti.",
    body: "<h2>Pace e giustizia</h2><p>[TESTO SEGNAPOSTO] L'Obiettivo 16 dell'Agenda 2030 promuove società pacifiche e inclusive.</p>",
    images: [],
    sources: [
      {
        id: "s-2",
        title: "SDG 16 — United Nations",
        url: "https://sdgs.un.org/goals/goal16",
        consultedAt: "2026-03-05",
      },
    ],
    status: "in_revisione",
    authorUserId: "u-stud-2",
    featured: false,
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: now,
    publishedAt: null,
  },
  {
    id: "a-3",
    title: "Partnership: Obiettivo 17 in classe",
    slug: "partnership-obiettivo-17-in-classe",
    topicId: "t-17",
    authors: [{ firstName: "Luca", lastName: "Bianchi" }],
    excerpt:
      "Come scuole, ONG e istituzioni possono collaborare per gli SDGs.",
    body: "<h2>Cooperare</h2><p>[TESTO SEGNAPOSTO] L'Obiettivo 17 invita a rafforzare i mezzi di attuazione e rivitalizzare la partnership globale.</p>",
    images: [],
    sources: [
      {
        id: "s-3",
        title: "SDG 17 — United Nations",
        url: "https://sdgs.un.org/goals/goal17",
        consultedAt: "2026-03-08",
      },
    ],
    status: "bozza",
    authorUserId: "u-stud-1",
    featured: false,
    createdAt: now,
    updatedAt: now,
    publishedAt: null,
  },
];
