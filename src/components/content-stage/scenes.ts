import type { ContentSceneId } from "@/components/content-stage/shapes";
import type { StageView } from "@/components/content-stage/engine";
import { getArticleBySlug, getTopicBySlug } from "@/lib/mock-data";

export type ContentScene = {
  id: ContentSceneId;
  view: StageView;
  accentHex?: string;
};

const VIEWS: Record<ContentSceneId, StageView> = {
  "articoli-list": {
    anchorX: 0.78,
    anchorY: 0.42,
    scale: 0.95,
    pitch: 0.38,
    yaw: -0.55,
    spin: 0.07,
    sway: 0.18,
    opacity: 0.88,
  },
  "articoli-detail": {
    anchorX: 0.72,
    anchorY: 0.38,
    scale: 1.05,
    pitch: 0.22,
    yaw: 0.35,
    spin: 0.05,
    sway: 0.12,
    opacity: 0.9,
  },
  progetto: {
    anchorX: 0.7,
    anchorY: 0.4,
    scale: 1.1,
    pitch: 0.18,
    yaw: -0.2,
    spin: 0.06,
    sway: 0.22,
    opacity: 0.92,
  },
  argomenti: {
    anchorX: 0.74,
    anchorY: 0.36,
    scale: 1,
    pitch: 0.3,
    yaw: 0.15,
    spin: 0.08,
    sway: 0.25,
    opacity: 0.9,
  },
};

export function resolveContentScene(pathname: string): ContentScene {
  const parts = pathname.split("/").filter(Boolean);

  if (parts[0] === "progetto") {
    return { id: "progetto", view: VIEWS.progetto };
  }

  if (parts[0] === "argomenti" && parts[1]) {
    const topic = getTopicBySlug(parts[1]);
    return {
      id: "argomenti",
      view: VIEWS.argomenti,
      accentHex: topic?.color ?? "#1B7A4E",
    };
  }

  if (parts[0] === "articoli" && parts[1]) {
    const article = getArticleBySlug(parts[1]);
    const topic = article
      ? getTopicBySlug(article.topicSlug)
      : undefined;
    return {
      id: "articoli-detail",
      view: VIEWS["articoli-detail"],
      accentHex: topic?.color ?? "#145C3B",
    };
  }

  if (parts[0] === "articoli") {
    return { id: "articoli-list", view: VIEWS["articoli-list"] };
  }

  return { id: "articoli-list", view: VIEWS["articoli-list"] };
}