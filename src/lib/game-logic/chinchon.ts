import type { ChinchonScore } from "@/lib/types/score";
import type { ChinchonConfig } from "@/lib/types/game";

export function getActivePlayers(scores: ChinchonScore[]): ChinchonScore[] {
  return scores.filter((s) => !s.is_eliminated);
}

export function checkEliminations(
  scores: ChinchonScore[],
  config: ChinchonConfig
): string[] {
  return scores
    .filter((s) => !s.is_eliminated && s.total_points >= config.elimination_score)
    .map((s) => s.id);
}

export function checkGameEnd(
  scores: ChinchonScore[]
): { winnerId: string } | null {
  const active = getActivePlayers(scores);
  if (active.length === 1) {
    return { winnerId: active[0].player_id };
  }
  return null;
}
