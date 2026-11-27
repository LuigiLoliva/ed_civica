/** Shell condivisa: stage WebGL persistente + transizioni di route. */
export { RouteTransition } from "@/components/shell/route-transition";
export {
  useRouteTransition,
  type RoutePhase,
} from "@/components/shell/route-transition-store";
export { ShellStage } from "@/components/shell/stage/shell-stage";
export { StageScene } from "@/components/shell/stage/stage-scene";
export {
  registerStageLayer,
  type StageOverride,
} from "@/components/shell/stage/stage-store";
export type { StageFrame, StageLayer } from "@/components/shell/stage/stage-engine";
