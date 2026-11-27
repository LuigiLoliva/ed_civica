import type { SceneId } from "@/components/immersive/scene-shapes";

/** Allineamento con le scene definite in scene-shapes (worker G/A). */
export function sceneFromPathname(pathname: string): SceneId {
  if (pathname === "/gioca") return "gioca";
  if (pathname.startsWith("/gioca/quiz/")) return "quiz";
  if (pathname.startsWith("/gioca/giochi/")) {
    const slug = pathname.split("/").pop() ?? "";
    switch (slug) {
      case "memory-sdgs":
        return "memory";
      case "vero-falso":
        return "vero-falso";
      case "abbina-principio":
        return "abbina";
      case "partnership":
        return "partnership";
      default:
        return "gioca";
    }
  }
  if (pathname.startsWith("/argomenti/")) return "topic";
  if (pathname === "/privacy") return "privacy";
  if (pathname === "/cookie") return "cookie";
  if (pathname === "/registrati") return "registrati";
  if (pathname === "/auth/login") return "login";
  if (pathname === "/auth/forgot-password") return "forgot";
  if (pathname === "/auth/reset-password") return "reset";
  if (pathname === "/auth/pending") return "pending";
  return "lost";
}