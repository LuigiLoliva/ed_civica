import type { Quiz } from "@/lib/types/quiz";

/**
 * SEED — CONTENUTI DA CONTROLLARE DAI DOCENTI
 * Fonti di riferimento da verificare: un.org, Carta delle Nazioni Unite,
 * timeline ufficiale ONU. Non usare in valutazione finché non revisionato.
 */
export const quizOnuStrutturaStoria: Quiz = {
  id: "quiz-onu-struttura-storia",
  slug: "onu-struttura-e-storia",
  title: "ONU: struttura e storia",
  description:
    "Ripassa le origini dell'ONU, i suoi organi principali e i principi della Carta.",
  topicSlug: "onu-storia-struttura",
  topicLabel: "ONU: storia e struttura",
  difficulty: "medio",
  needsTeacherReview: true,
  reviewNote:
    "⚠️ Seed generato dall'IA: verificare date, numeri e formulazioni con fonti ufficiali ONU prima dell'uso in classe.",
  questions: [
    {
      id: "onu-q1",
      type: "single",
      prompt: "In quale anno è stata firmata la Carta delle Nazioni Unite a San Francisco?",
      options: [
        { id: "a", text: "1919", correct: false },
        { id: "b", text: "1945", correct: true },
        { id: "c", text: "1948", correct: false },
        { id: "d", text: "1955", correct: false },
      ],
      explanation:
        "La Carta è stata firmata il 26 giugno 1945 a San Francisco ed è entrata in vigore il 24 ottobre 1945 (Giornata delle Nazioni Unite).",
      source: "https://www.un.org/en/about-us/un-charter",
    },
    {
      id: "onu-q2",
      type: "single",
      prompt: "Quanti sono, attualmente, gli Stati membri dell'ONU?",
      options: [
        { id: "a", text: "51", correct: false },
        { id: "b", text: "150", correct: false },
        { id: "c", text: "193", correct: true },
        { id: "d", text: "206", correct: false },
      ],
      explanation:
        "L'ONU conta 193 Stati membri. Il numero iniziale nel 1945 era 51; verificare sempre sul sito ufficiale eventuali aggiornamenti.",
      source: "https://www.un.org/en/about-us/member-states",
    },
    {
      id: "onu-q3",
      type: "true_false",
      prompt: "Il Consiglio di Sicurezza ha cinque membri permanenti con diritto di veto.",
      options: [
        { id: "t", text: "Vero", correct: true },
        { id: "f", text: "Falso", correct: false },
      ],
      explanation:
        "I cinque membri permanenti (P5) sono Cina, Francia, Federazione Russa, Regno Unito e Stati Uniti. Hanno diritto di veto sulle decisioni sostanziali.",
      source: "https://www.un.org/securitycouncil/",
    },
    {
      id: "onu-q4",
      type: "single",
      prompt: "Quale organo ONU è spesso definito «il Parlamento del mondo» perché vi siedono tutti gli Stati membri?",
      options: [
        { id: "a", text: "Segretariato", correct: false },
        { id: "b", text: "Consiglio Economico e Sociale (ECOSOC)", correct: false },
        { id: "c", text: "Assemblea Generale", correct: true },
        { id: "d", text: "Corte Internazionale di Giustizia", correct: false },
      ],
      explanation:
        "Nell'Assemblea Generale ogni Stato membro ha un voto. Discute questioni globali e adotta risoluzioni (di norma non vincolanti).",
    },
    {
      id: "onu-q5",
      type: "multiple",
      prompt: "Quali tra questi sono organi principali delle Nazioni Unite previsti dalla Carta? (più risposte)",
      options: [
        { id: "a", text: "Assemblea Generale", correct: true },
        { id: "b", text: "Consiglio di Sicurezza", correct: true },
        { id: "c", text: "Parlamento Europeo", correct: false },
        { id: "d", text: "Corte Internazionale di Giustizia", correct: true },
        { id: "e", text: "NATO", correct: false },
      ],
      explanation:
        "Gli organi principali includono Assemblea Generale, Consiglio di Sicurezza, ECOSOC, Segretariato, Corte Internazionale di Giustizia e (storicamente) il Consiglio di Amministrazione Fiduciaria.",
    },
    {
      id: "onu-q6",
      type: "single",
      prompt: "Dove ha sede la Corte Internazionale di Giustizia?",
      options: [
        { id: "a", text: "New York", correct: false },
        { id: "b", text: "Ginevra", correct: false },
        { id: "c", text: "L'Aia (Paesi Bassi)", correct: true },
        { id: "d", text: "Vienna", correct: false },
      ],
      explanation:
        "La CIG ha sede al Palazzo della Pace all'Aia. È l'organo giudiziario principale dell'ONU e risolve controversie tra Stati.",
    },
    {
      id: "onu-q7",
      type: "true_false",
      prompt: "Il Segretario Generale dell'ONU è eletto direttamente da tutti i cittadini degli Stati membri.",
      options: [
        { id: "t", text: "Vero", correct: false },
        { id: "f", text: "Falso", correct: true },
      ],
      explanation:
        "Il Segretario Generale è nominato dall'Assemblea Generale su raccomandazione del Consiglio di Sicurezza. Non è eletto a suffragio universale.",
    },
    {
      id: "onu-q8",
      type: "single",
      prompt: "Quale documento del 1948 proclama i diritti fondamentali di ogni persona?",
      options: [
        { id: "a", text: "Carta di Atlantico", correct: false },
        { id: "b", text: "Dichiarazione Universale dei Diritti Umani", correct: true },
        { id: "c", text: "Trattato di Maastricht", correct: false },
        { id: "d", text: "Convenzione di Ginevra del 1864", correct: false },
      ],
      explanation:
        "La Dichiarazione Universale dei Diritti Umani è stata adottata dall'Assemblea Generale il 10 dicembre 1948. Non è un trattato vincolante, ma è un riferimento fondamentale.",
      source: "https://www.un.org/en/about-us/universal-declaration-of-human-rights",
    },
    {
      id: "onu-q9",
      type: "single",
      prompt: "L'Agenda 2030 con i 17 Obiettivi di Sviluppo Sostenibile è stata adottata nel:",
      options: [
        { id: "a", text: "2000", correct: false },
        { id: "b", text: "2012", correct: false },
        { id: "c", text: "2015", correct: true },
        { id: "d", text: "2020", correct: false },
      ],
      explanation:
        "L'Assemblea Generale ha adottato l'Agenda 2030 (Risoluzione A/RES/70/1) nel settembre 2015. Precedevano i Millennium Development Goals (2000–2015).",
      source: "https://sdgs.un.org/2030agenda",
    },
    {
      id: "onu-q10",
      type: "true_false",
      prompt: "Le risoluzioni dell'Assemblea Generale sono sempre giuridicamente vincolanti per gli Stati membri.",
      options: [
        { id: "t", text: "Vero", correct: false },
        { id: "f", text: "Falso", correct: true },
      ],
      explanation:
        "In generale le risoluzioni dell'Assemblea non sono vincolanti (salvo casi specifici, es. questioni interne/budget). Le decisioni del Consiglio di Sicurezza sotto il Cap. VII possono invece essere vincolanti.",
    },
  ],
};
