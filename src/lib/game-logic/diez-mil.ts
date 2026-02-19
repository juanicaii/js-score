import type { DiezMilScore } from "@/lib/types/score";
import type { DiezMilConfig } from "@/lib/types/game";

export function isPlayerOpened(score: DiezMilScore): boolean {
  return score.turns.some((t) => t.points_earned >= 1000) || score.total_points > 0;
}

export function canAddPoints(
  score: DiezMilScore,
  points: number,
  config: DiezMilConfig
): boolean {
  if (!config.require_1000) return true;
  if (isPlayerOpened(score)) return true;
  return points >= 1000;
}

export function checkWinner(
  scores: DiezMilScore[],
  config: DiezMilConfig
): string | null {
  for (const score of scores) {
    if (score.total_points >= config.target_score) {
      return score.player_id;
    }
  }
  return null;
}
