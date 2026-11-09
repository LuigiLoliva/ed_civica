import { Badge } from "@/components/ui/badge";
import type { ArticleStatus } from "@/types/database";

const LABELS: Record<ArticleStatus, string> = {
  bozza: "Bozza",
  in_revisione: "In revisione",
  pubblicato: "Pubblicato",
};

const VARIANTS: Record<
  ArticleStatus,
  "outline" | "secondary" | "default"
> = {
  bozza: "outline",
  in_revisione: "secondary",
  pubblicato: "default",
};

export function StatusBadge({ status }: { status: ArticleStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
