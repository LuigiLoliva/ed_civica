import type { GameMeta, MatchItem } from "@/lib/types/games";

export const abbinaGameMeta: GameMeta = {
  slug: "abbina-principio",
  title: "Abbina il principio",
  description:
    "Collega gli organi dell'ONU alle loro funzioni. Supporta drag-and-drop e alternativa da tastiera.",
  badge: "Abbinamento",
  estimatedMinutes: 5,
};

/** Organi ONU ↔ funzioni. */
export const abbinaItems: MatchItem[] = [
  {
    id: "ag",
    organ: "Assemblea Generale",
    function: "Forum di tutti gli Stati membri: discute questioni globali e adotta risoluzioni",
    hint: "Un Paese, un voto",
  },
  {
    id: "cs",
    organ: "Consiglio di Sicurezza",
    function: "Mantiene la pace e la sicurezza internazionali; può autorizzare misure vincolanti",
    hint: "Include i membri permanenti con veto",
  },
  {
    id: "cig",
    organ: "Corte Internazionale di Giustizia",
    function: "Risolve controversie giuridiche tra Stati e fornisce pareri consultivi",
    hint: "Sede all'Aia",
  },
  {
    id: "ecosoc",
    organ: "ECOSOC",
    function: "Coordina lavoro economico, sociale e ambientale del sistema ONU",
    hint: "Consiglio Economico e Sociale",
  },
  {
    id: "seg",
    organ: "Segretariato",
    function: "Amministra l'organizzazione e supporta gli organi sotto la guida del Segretario Generale",
    hint: "Personale internazionale",
  },
];
