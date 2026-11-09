import type { GameMeta, TrueFalseItem } from "@/lib/types/games";

export const veroFalsoGameMeta: GameMeta = {
  slug: "vero-falso",
  title: "Vero o Falso a scorrimento",
  description:
    "Scorri le affermazioni sull'ONU: frecce su desktop, swipe su mobile. Accumula una serie di risposte esatte.",
  badge: "Swipe",
  estimatedMinutes: 4,
};

/** Affermazioni V/F — file dati separato. */
export const veroFalsoItems: TrueFalseItem[] = [
  {
    id: "vf1",
    statement: "L'ONU è nata dopo la Seconda guerra mondiale.",
    isTrue: true,
    explanation:
      "La Carta fu firmata nel 1945 a San Francisco, con l'obiettivo di mantenere la pace e promuovere la cooperazione.",
    source: "https://www.un.org/en/about-us/history-of-the-un",
  },
  {
    id: "vf2",
    statement: "Tutti gli Stati membri dell'ONU hanno diritto di veto nel Consiglio di Sicurezza.",
    isTrue: false,
    explanation:
      "Solo i cinque membri permanenti (P5) hanno diritto di veto. Gli altri membri del Consiglio sono eletti a rotazione.",
  },
  {
    id: "vf3",
    statement: "L'Agenda 2030 comprende 17 Obiettivi di Sviluppo Sostenibile.",
    isTrue: true,
    explanation: "I 17 SDG e i relativi target sono stati adottati nel 2015 con la Risoluzione A/RES/70/1.",
  },
  {
    id: "vf4",
    statement: "L'Obiettivo 16 riguarda esclusivamente il cambiamento climatico.",
    isTrue: false,
    explanation:
      "Il clima è al centro dell'Obiettivo 13. L'SDG 16 tratta pace, giustizia e istituzioni solide.",
  },
  {
    id: "vf5",
    statement: "La Corte Internazionale di Giustizia ha sede all'Aia.",
    isTrue: true,
    explanation: "La CIG è l'organo giudiziario principale dell'ONU e ha sede al Palazzo della Pace.",
  },
  {
    id: "vf6",
    statement: "L'Obiettivo 17 invita a costruire partnership multi-attore per attuare gli SDG.",
    isTrue: true,
    explanation:
      "Governi, società civile, imprese e cittadini sono chiamati a collaborare sui mezzi di attuazione.",
  },
  {
    id: "vf7",
    statement: "Le risoluzioni dell'Assemblea Generale sono sempre vincolanti come leggi nazionali.",
    isTrue: false,
    explanation:
      "In genere non sono vincolanti; restano però importanti politicamente e possono influenzare il diritto internazionale.",
  },
  {
    id: "vf8",
    statement: "Il 24 ottobre si celebra la Giornata delle Nazioni Unite.",
    isTrue: true,
    explanation:
      "Il 24 ottobre 1945 la Carta entrò in vigore: da allora quella data è la Giornata delle Nazioni Unite.",
  },
  {
    id: "vf9",
    statement: "L'ECOSOC si occupa principalmente di operazioni militari di peacekeeping.",
    isTrue: false,
    explanation:
      "L'ECOSOC coordina questioni economiche e sociali. Il peacekeeping è legato al Consiglio di Sicurezza e al Segretariato.",
  },
  {
    id: "vf10",
    statement: "Anche studenti e scuole possono contribuire all'Agenda 2030 con progetti locali.",
    isTrue: true,
    explanation:
      "L'Agenda è universale: educazione civica, partnership territoriali e azioni concrete contano a ogni scala.",
  },
];
