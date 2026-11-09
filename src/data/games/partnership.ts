import type { GameMeta, PartnershipScenario } from "@/lib/types/games";

export const partnershipGameMeta: GameMeta = {
  slug: "partnership",
  title: "Costruisci la partnership",
  description:
    "Obiettivo 17: scegli azioni che collegano governi, scuole, imprese, ONG e cittadini verso un traguardo comune.",
  badge: "Nodi",
  estimatedMinutes: 6,
};

export const partnershipScenario: PartnershipScenario = {
  id: "partnership-acqua-scuola",
  title: "Acqua, scuola e territorio",
  goal: "Ridurre lo spreco d'acqua nell'istituto e sensibilizzare il quartiere (legame SDG 6 + 17).",
  intro:
    "La tua scuola vuole un progetto concreto. Scegli fino a 4 azioni: ogni azione collega attori diversi. Per riuscire, collega almeno governi/enti locali, scuole, ONG e cittadini.",
  requiredActors: ["governi", "scuole", "ong", "cittadini"],
  choices: [
    {
      id: "c1",
      text: "Firmare un patto educativo con il Comune per audit idrici negli edifici scolastici",
      connects: ["governi", "scuole"],
      impact: "alto",
      feedback: "Ottimo: istituzionalizzi il progetto e apri risorse pubbliche.",
    },
    {
      id: "c2",
      text: "Coinvolgere un'associazione ambientale per laboratori e monitoraggio partecipato",
      connects: ["ong", "scuole", "cittadini"],
      impact: "alto",
      feedback: "La società civile porta competenze e coinvolge le famiglie.",
    },
    {
      id: "c3",
      text: "Chiedere a un'impresa locale di sponsorizzare riduttori di flusso e cartellonistica",
      connects: ["imprese", "scuole"],
      impact: "medio",
      feedback: "Utile per risorse materiali; conviene chiarire trasparenza e obiettivi condivisi.",
    },
    {
      id: "c4",
      text: "Organizzare solo un post social senza alleati esterni",
      connects: ["scuole"],
      impact: "basso",
      feedback: "La comunicazione serve, ma da sola non costruisce una partnership multi-attore.",
    },
    {
      id: "c5",
      text: "Attivare un comitato genitori-studenti per raccogliere dati sui consumi a casa",
      connects: ["cittadini", "scuole"],
      impact: "medio",
      feedback: "I dati comunitari rafforzano consapevolezza e accountability.",
    },
    {
      id: "c6",
      text: "Proporre al Consiglio comunale una delibera di supporto al progetto scolastico",
      connects: ["governi", "cittadini"],
      impact: "alto",
      feedback: "Colleghi partecipazione civica e decisione istituzionale.",
    },
    {
      id: "c7",
      text: "Ignorare le ONG perché «rallentano» e fare tutto in autonomia",
      connects: ["scuole"],
      impact: "basso",
      feedback: "Escludere la società civile indebolisce rete, fiducia e impatto (SDG 17).",
    },
  ],
};

export const actorLabels: Record<string, string> = {
  governi: "Governi / enti locali",
  scuole: "Scuole",
  imprese: "Imprese",
  ong: "ONG",
  cittadini: "Cittadini",
};
