import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { DiezMilScore } from "@/lib/types";

export function useDiezMilScores(
  gameId: string | undefined
): DiezMilScore[] | undefined {
  return useLiveQuery(
    () =>
      gameId
        ? db.diez_mil_scores.where("game_id").equals(gameId).toArray()
        : [],
    [gameId]
  );
}
