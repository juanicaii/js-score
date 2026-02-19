import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { TrucoScore } from "@/lib/types";

export function useTrucoScores(
  gameId: string | undefined
): TrucoScore[] | undefined {
  return useLiveQuery(
    () =>
      gameId
        ? db.truco_scores.where("game_id").equals(gameId).toArray()
        : [],
    [gameId]
  );
}
