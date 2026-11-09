import type { GameMeta, MemoryPair } from "@/lib/types/games";

export const memoryGameMeta: GameMeta = {
  slug: "memory-sdgs",
  title: "Memory degli Obiettivi",
  description:
    "Abbina simbolo e nome degli SDG (con focus su 16 e 17) e le relative parole chiave.",
  badge: "Memoria",
  estimatedMinutes: 5,
};

/**
 * Coppie memory: ogni id genera due carte (simbolo / nome).
 * Dati modificabili senza toccare il componente.
 */
export const memoryPairs: MemoryPair[] = [
  {
    id: "sdg16",
    symbolLabel: "SDG 16",
    symbolHint: "Bilancia / istituzioni",
    nameLabel: "Pace, giustizia e istituzioni solide",
    keywords: ["pace", "giustizia", "istituzioni", "anti-corruzione"],
    accent: "#00689D",
  },
  {
    id: "sdg17",
    symbolLabel: "SDG 17",
    symbolHint: "Rete / partnership",
    nameLabel: "Partnership per gli obiettivi",
    keywords: ["cooperazione", "alleanze", "finanza", "tecnologia"],
    accent: "#19486A",
  },
  {
    id: "onu",
    symbolLabel: "ONU",
    symbolHint: "Mappamondo stilizzato",
    nameLabel: "Organizzazione delle Nazioni Unite",
    keywords: ["Carta", "Assemblea", "pace", "cooperazione"],
    accent: "#009EDB",
  },
  {
    id: "agenda2030",
    symbolLabel: "Agenda 2030",
    symbolHint: "17 obiettivi",
    nameLabel: "Agenda 2030 per lo Sviluppo Sostenibile",
    keywords: ["SDG", "2015", "sostenibilità", "nessuno escluso"],
  },
  {
    id: "dudh",
    symbolLabel: "DUDU",
    symbolHint: "1948",
    nameLabel: "Dichiarazione Universale dei Diritti Umani",
    keywords: ["diritti", "dignità", "uguaglianza"],
  },
  {
    id: "ecosoc",
    symbolLabel: "ECOSOC",
    symbolHint: "Organo ONU",
    nameLabel: "Consiglio Economico e Sociale",
    keywords: ["economia", "sociale", "coordinamento"],
  },
];
