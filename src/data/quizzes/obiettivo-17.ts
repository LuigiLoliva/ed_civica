import type { Quiz } from "@/lib/types/quiz";

/**
 * SEED — CONTENUTI DA CONTROLLARE DAI DOCENTI
 * Obiettivo 17: Partnership per gli obiettivi.
 * Verificare target ufficiali su sdgs.un.org e materiali ASviS / MAECI.
 */
export const quizObiettivo17: Quiz = {
  id: "quiz-obiettivo-17",
  slug: "obiettivo-17-partnership",
  title: "Obiettivo 17: partnership per gli obiettivi",
  description:
    "Scopri come cooperazione, finanziamenti, tecnologia e alleanze multi-attore sostengono l'Agenda 2030.",
  topicSlug: "obiettivo-17",
  topicLabel: "Obiettivo 17",
  difficulty: "medio",
  needsTeacherReview: true,
  reviewNote:
    "⚠️ Seed generato dall'IA: verificare definizioni e target su sdgs.un.org prima dell'uso in classe.",
  questions: [
    {
      id: "o17-q1",
      type: "single",
      prompt: "Qual è il titolo ufficiale dell'Obiettivo di Sviluppo Sostenibile 17?",
      options: [
        { id: "a", text: "Città e comunità sostenibili", correct: false },
        { id: "b", text: "Pace, giustizia e istituzioni solide", correct: false },
        { id: "c", text: "Partnership per gli obiettivi", correct: true },
        { id: "d", text: "Lotta contro il cambiamento climatico", correct: false },
      ],
      explanation:
        "L'SDG 17 è «Partnership for the Goals» / «Partnership per gli obiettivi». Il colore ufficiale è un blu scuro (#19486A).",
      source: "https://sdgs.un.org/goals/goal17",
    },
    {
      id: "o17-q2",
      type: "true_false",
      prompt: "L'Obiettivo 17 riguarda solo gli accordi tra governi nazionali.",
      options: [
        { id: "t", text: "Vero", correct: false },
        { id: "f", text: "Falso", correct: true },
      ],
      explanation:
        "Le partnership dell'SDG 17 coinvolgono governi, società civile, settore privato, mondo accademico e cittadini. Sono alleanze multi-attore.",
    },
    {
      id: "o17-q3",
      type: "multiple",
      prompt: "Quali ambiti sono tipicamente collegati all'Obiettivo 17? (più risposte)",
      options: [
        { id: "a", text: "Finanza per lo sviluppo e cooperazione", correct: true },
        { id: "b", text: "Trasferimento di tecnologie e capacità", correct: true },
        { id: "c", text: "Solo la pesca sostenibile", correct: false },
        { id: "d", text: "Commercio e coerenza delle politiche", correct: true },
      ],
      explanation:
        "L'SDG 17 tratta mezzi di attuazione: finanza, tecnologia, capacity-building, commercio, coerenza politica, partenariati e dati.",
    },
    {
      id: "o17-q4",
      type: "single",
      prompt: "Cosa si intende spesso per «partnership multi-attore»?",
      options: [
        {
          id: "a",
          text: "Un accordo firmato solo da due ministeri dello stesso Paese",
          correct: false,
        },
        {
          id: "b",
          text: "Una collaborazione tra soggetti diversi (pubblici, privati, società civile) per un obiettivo comune",
          correct: true,
        },
        { id: "c", text: "Una gara sportiva internazionale", correct: false },
        { id: "d", text: "Un algoritmo di intelligenza artificiale", correct: false },
      ],
      explanation:
        "Le multi-stakeholder partnerships uniscono competenze e risorse di attori diversi per affrontare sfide che nessun soggetto risolverebbe da solo.",
    },
    {
      id: "o17-q5",
      type: "true_false",
      prompt: "Anche una scuola può costruire partnership coerenti con l'Obiettivo 17 (es. con enti locali, ONG, imprese responsabili).",
      options: [
        { id: "t", text: "Vero", correct: true },
        { id: "f", text: "Falso", correct: false },
      ],
      explanation:
        "L'Agenda 2030 è «di tutti». Progetti scolastici con territorio, gemellaggi, service learning e reti di scuole sono esempi di partnership educative.",
    },
    {
      id: "o17-q6",
      type: "single",
      prompt: "Perché i dati e il monitoraggio sono importanti nell'Obiettivo 17?",
      options: [
        { id: "a", text: "Perché i dati sostituiscono le politiche pubbliche", correct: false },
        {
          id: "b",
          text: "Perché aiutano a misurare i progressi e a prendere decisioni basate su evidenze",
          correct: true,
        },
        { id: "c", text: "Perché l'ONU vieta le statistiche nazionali", correct: false },
        { id: "d", text: "Perché servono solo alle aziende di marketing", correct: false },
      ],
      explanation:
        "I target su dati, monitoraggio e accountability (es. 17.18–17.19) rafforzano la capacità degli Stati di seguire i progressi sugli SDG.",
    },
    {
      id: "o17-q7",
      type: "single",
      prompt: "L'aiuto pubblico allo sviluppo (APS / ODA) è collegato soprattutto a quale dimensione dell'SDG 17?",
      options: [
        { id: "a", text: "Finanza / mezzi di attuazione", correct: true },
        { id: "b", text: "Protezione della fauna selvatica", correct: false },
        { id: "c", text: "Esplorazione spaziale", correct: false },
        { id: "d", text: "Regole del calcio internazionale", correct: false },
      ],
      explanation:
        "L'APS è uno degli strumenti finanziari della cooperazione internazionale discussi nei target sulla finanza per lo sviluppo dell'Obiettivo 17.",
    },
    {
      id: "o17-q8",
      type: "multiple",
      prompt: "Quali attori possono contribuire a una partnership per l'Agenda 2030? (più risposte)",
      options: [
        { id: "a", text: "Governi e enti locali", correct: true },
        { id: "b", text: "Scuole e università", correct: true },
        { id: "c", text: "Imprese e ONG", correct: true },
        { id: "d", text: "Solo il Consiglio di Sicurezza ONU", correct: false },
      ],
      explanation:
        "L'attuazione degli SDG richiede impegno diffuso: istituzioni, scuola, imprese responsabili, società civile e cittadini.",
    },
    {
      id: "o17-q9",
      type: "true_false",
      prompt: "L'Obiettivo 17 è spesso descritto come «abilitante» perché fornisce i mezzi per realizzare gli altri 16 obiettivi.",
      options: [
        { id: "t", text: "Vero", correct: true },
        { id: "f", text: "Falso", correct: false },
      ],
      explanation:
        "Senza cooperazione, risorse, tecnologia e alleanze, gli altri SDG restano più difficili da raggiungere: per questo il 17 è trasversale e abilitante.",
      source: "https://sdgs.un.org/goals/goal17",
    },
    {
      id: "o17-q10",
      type: "single",
      prompt: "Un esempio concreto di partnership scolastica legata all'SDG 17 potrebbe essere:",
      options: [
        {
          id: "a",
          text: "Un progetto condiviso tra scuola, comune e associazione ambientale su un obiettivo locale misurabile",
          correct: true,
        },
        { id: "b", text: "Eliminare tutte le materie scientifiche", correct: false },
        { id: "c", text: "Vietare le uscite didattiche", correct: false },
        { id: "d", text: "Usare solo libri stampati prima del 1950", correct: false },
      ],
      explanation:
        "Partnership efficaci hanno obiettivo chiaro, ruoli definiti e impatto verificabile — anche su scala di quartiere o di istituto.",
    },
  ],
};
