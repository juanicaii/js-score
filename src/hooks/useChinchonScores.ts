import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { ChinchonScore } from "@/lib/types";

export function useChinchonScores(
  gameId: string | undefined
): ChinchonScore[] | undefined {
  return useLiveQuery(
    () =>
      gameId
        ? db.chinchon_scores.where("game_id").equals(gameId).toArray()
        : [],
    [gameId]
  );
}
