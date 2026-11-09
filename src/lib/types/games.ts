export type GameSlug =
  | "memory-sdgs"
  | "vero-falso"
  | "abbina-principio"
  | "partnership";

export interface GameMeta {
  slug: GameSlug;
  title: string;
  description: string;
  /** Etichetta breve per le card su /gioca. */
  badge: string;
  estimatedMinutes: number;
}

export interface MemoryPair {
  id: string;
  symbolLabel: string;
  /** Testo breve sul verso "simbolo". */
  symbolHint: string;
  nameLabel: string;
  keywords: string[];
  /** Colore accento opzionale (es. Goal 16/17). */
  accent?: string;
}

export interface TrueFalseItem {
  id: string;
  statement: string;
  isTrue: boolean;
  explanation: string;
  source?: string;
}

export interface MatchItem {
  id: string;
  organ: string;
  function: string;
  hint?: string;
}

export type PartnershipActor =
  | "governi"
  | "scuole"
  | "imprese"
  | "ong"
  | "cittadini";

export interface PartnershipChoice {
  id: string;
  text: string;
  /** Attori che questa scelta collega. */
  connects: PartnershipActor[];
  impact: "basso" | "medio" | "alto";
  feedback: string;
}

export interface PartnershipScenario {
  id: string;
  title: string;
  goal: string;
  intro: string;
  choices: PartnershipChoice[];
  /** Attori minimi da collegare per "vincere". */
  requiredActors: PartnershipActor[];
}
