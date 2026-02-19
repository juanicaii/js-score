import type { TrucoScore } from "@/lib/types/score";
import type { TrucoConfig } from "@/lib/types/game";

export function checkWinner(
  scores: TrucoScore[],
  config: TrucoConfig
): "nosotros" | "ellos" | null {
  for (const score of scores) {
    if (score.points >= config.target_score) {
      return score.team;
    }
  }
  return null;
}

export function getTeamName(
  team: "nosotros" | "ellos",
  config: TrucoConfig
): string {
  return team === "nosotros" ? config.team_names[0] : config.team_names[1];
}

export function canAddPoint(
  scores: TrucoScore[],
  config: TrucoConfig
): boolean {
  return checkWinner(scores, config) === null;
}

export interface BuenasMalasDisplay {
  malas: number;
  buenas: number;
  inBuenas: boolean;
}

export function getBuenasMalas(points: number): BuenasMalasDisplay {
  return {
    malas: Math.min(points, 15),
    buenas: Math.max(0, points - 15),
    inBuenas: points > 15,
  };
}
