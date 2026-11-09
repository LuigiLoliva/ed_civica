import type { Quiz } from "@/lib/types/quiz";

/**
 * SEED — CONTENUTI DA CONTROLLARE DAI DOCENTI
 * Obiettivo 16: Pace, giustizia e istituzioni solide.
 * Verificare target ufficiali su sdgs.un.org e rapporti ASviS.
 */
export const quizObiettivo16: Quiz = {
  id: "quiz-obiettivo-16",
  slug: "obiettivo-16-pace-giustizia",
  title: "Obiettivo 16: pace, giustizia e istituzioni",
  description:
    "Esplora i temi di pace, accesso alla giustizia, lotta alla corruzione e istituzioni inclusive.",
  topicSlug: "obiettivo-16",
  topicLabel: "Obiettivo 16",
  difficulty: "medio",
  needsTeacherReview: true,
  reviewNote:
    "⚠️ Seed generato dall'IA: confrontare i target e le formulazioni con sdgs.un.org / ASviS prima dell'uso didattico.",
  questions: [
    {
      id: "o16-q1",
      type: "single",
      prompt: "Qual è il titolo ufficiale dell'Obiettivo di Sviluppo Sostenibile 16?",
      options: [
        { id: "a", text: "Istruzione di qualità", correct: false },
        { id: "b", text: "Pace, giustizia e istituzioni solide", correct: true },
        { id: "c", text: "Partnership per gli obiettivi", correct: false },
        { id: "d", text: "Ridurre le disuguaglianze", correct: false },
      ],
      explanation:
        "L'SDG 16 si intitola «Pace, giustizia e istituzioni solide» (Peace, justice and strong institutions). Il colore ufficiale è un blu (#00689D).",
      source: "https://sdgs.un.org/goals/goal16",
    },
    {
      id: "o16-q2",
      type: "true_false",
      prompt: "L'Obiettivo 16 riguarda solo i conflitti armati tra Stati.",
      options: [
        { id: "t", text: "Vero", correct: false },
        { id: "f", text: "Falso", correct: true },
      ],
      explanation:
        "L'SDG 16 include pace e riduzione della violenza, ma anche accesso alla giustizia, stato di diritto, lotta alla corruzione, istituzioni efficaci e partecipazione inclusiva.",
    },
    {
      id: "o16-q3",
      type: "single",
      prompt: "Quale target dell'Obiettivo 16 invita a ridurre in modo significativo tutte le forme di violenza e i relativi tassi di mortalità?",
      options: [
        { id: "a", text: "16.1", correct: true },
        { id: "b", text: "16.5", correct: false },
        { id: "c", text: "16.9", correct: false },
        { id: "d", text: "16.a", correct: false },
      ],
      explanation:
        "Il target 16.1 riguarda la riduzione significativa di tutte le forme di violenza. 16.5 riguarda la corruzione; 16.9 l'identità giuridica / registrazione delle nascite.",
      source: "https://sdgs.un.org/goals/goal16",
    },
    {
      id: "o16-q4",
      type: "multiple",
      prompt: "Quali temi rientrano nell'Obiettivo 16? (più risposte)",
      options: [
        { id: "a", text: "Accesso alla giustizia per tutti", correct: true },
        { id: "b", text: "Lotta alla corruzione e alle tangenti", correct: true },
        { id: "c", text: "Energia rinnovabile al 100%", correct: false },
        { id: "d", text: "Istituzioni efficaci, responsabili e trasparenti", correct: true },
      ],
      explanation:
        "Pace, giustizia, anti-corruzione e istituzioni inclusive sono pilastri dell'SDG 16. L'energia è legata soprattutto all'Obiettivo 7.",
    },
    {
      id: "o16-q5",
      type: "single",
      prompt: "Cosa indica tipicamente l'«accesso alla giustizia» nel contesto dell'SDG 16?",
      options: [
        { id: "a", text: "Solo processi penali internazionali", correct: false },
        {
          id: "b",
          text: "La possibilità concreta di far valere i propri diritti attraverso istituzioni eque e accessibili",
          correct: true,
        },
        { id: "c", text: "Il diritto di voto alle elezioni europee", correct: false },
        { id: "d", text: "L'abolizione di tutti i tribunali nazionali", correct: false },
      ],
      explanation:
        "Accesso alla giustizia significa poter ricorrere a sistemi legali e istituzioni che tutelano i diritti in modo equo, tempestivo e accessibile anche alle persone vulnerabili.",
    },
    {
      id: "o16-q6",
      type: "true_false",
      prompt: "La trasparenza delle istituzioni pubbliche può contribuire a prevenire la corruzione.",
      options: [
        { id: "t", text: "Vero", correct: true },
        { id: "f", text: "Falso", correct: false },
      ],
      explanation:
        "Trasparenza, accountability e partecipazione civica sono strumenti riconosciuti per rafforzare le istituzioni e contrastare la corruzione (target 16.5 e 16.6).",
    },
    {
      id: "o16-q7",
      type: "single",
      prompt: "Il target 16.9 dell'Agenda 2030 riguarda principalmente:",
      options: [
        { id: "a", text: "Il disarmo nucleare", correct: false },
        {
          id: "b",
          text: "Fornire identità giuridica a tutti, inclusa la registrazione delle nascite",
          correct: true,
        },
        { id: "c", text: "Il commercio equo e solidale", correct: false },
        { id: "d", text: "La protezione della biodiversità marina", correct: false },
      ],
      explanation:
        "Il 16.9 punta a garantire a tutti un'identità giuridica, a partire dalla registrazione delle nascite — precondizione per accedere a molti diritti e servizi.",
    },
    {
      id: "o16-q8",
      type: "single",
      prompt: "Perché l'Obiettivo 16 è rilevante anche per una scuola o una comunità locale?",
      options: [
        {
          id: "a",
          text: "Perché riguarda solo le Nazioni Unite a New York",
          correct: false,
        },
        {
          id: "b",
          text: "Perché promuove partecipazione, rispetto delle regole, dialogo e istituzioni fiduciarie anche a livello locale",
          correct: true,
        },
        { id: "c", text: "Perché sostituisce la Costituzione italiana", correct: false },
        { id: "d", text: "Perché abolisce i comuni", correct: false },
      ],
      explanation:
        "Gli SDG si applicano a tutti i livelli. A scuola: regolamenti condivisi, contrasto al bullismo, partecipazione studentesca, fiducia nelle istituzioni educative.",
    },
    {
      id: "o16-q9",
      type: "true_false",
      prompt: "L'Agenda 2030 invita a garantire decisioni inclusive, partecipative e rappresentative a tutti i livelli (target 16.7).",
      options: [
        { id: "t", text: "Vero", correct: true },
        { id: "f", text: "Falso", correct: false },
      ],
      explanation:
        "Il target 16.7 chiede decisioni responsive, inclusive, partecipative e rappresentative — un ponte diretto con educazione civica e democrazia.",
      source: "https://sdgs.un.org/goals/goal16",
    },
  ],
};
