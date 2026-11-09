import type { GameMeta } from "@/lib/types/games";
import { memoryGameMeta } from "./memory-sdgs";
import { veroFalsoGameMeta } from "./vero-falso";
import { abbinaGameMeta } from "./abbina-principio";
import { partnershipGameMeta } from "./partnership";

export const games: GameMeta[] = [
  memoryGameMeta,
  veroFalsoGameMeta,
  abbinaGameMeta,
  partnershipGameMeta,
];

export function getGameBySlug(slug: string): GameMeta | undefined {
  return games.find((g) => g.slug === slug);
}

export {
  memoryGameMeta,
  veroFalsoGameMeta,
  abbinaGameMeta,
  partnershipGameMeta,
};
