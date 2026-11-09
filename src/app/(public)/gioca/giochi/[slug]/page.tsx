import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { GameShell } from "@/components/games/GameShell";
import { MemorySdgs } from "@/components/games/MemorySdgs";
import { VeroFalsoSwipe } from "@/components/games/VeroFalsoSwipe";
import { AbbinaPrincipio } from "@/components/games/AbbinaPrincipio";
import { CostruisciPartnership } from "@/components/games/CostruisciPartnership";
import { games, getGameBySlug } from "@/data/games";
import type { GameSlug } from "@/lib/types/games";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return games.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = getGameBySlug(slug);
  if (!game) return { title: "Gioco non trovato" };
  return { title: game.title, description: game.description };
}

function GameBySlug({ slug }: { slug: GameSlug }) {
  switch (slug) {
    case "memory-sdgs":
      return <MemorySdgs />;
    case "vero-falso":
      return <VeroFalsoSwipe />;
    case "abbina-principio":
      return <AbbinaPrincipio />;
    case "partnership":
      return <CostruisciPartnership />;
    default:
      return null;
  }
}

export default async function GamePage({ params }: Props) {
  const { slug } = await params;
  const game = getGameBySlug(slug);
  if (!game) notFound();

  return (
    <GameShell title={game.title} description={game.description}>
      <GameBySlug slug={game.slug} />
    </GameShell>
  );
}
