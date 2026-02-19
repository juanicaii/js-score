import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { GeneralaScore } from "@/lib/types";

export function useGeneralaScores(
  gameId: string | undefined
): GeneralaScore[] | undefined {
  return useLiveQuery(
    () =>
      gameId
        ? db.generala_scores.where("game_id").equals(gameId).toArray()
        : [],
    [gameId]
  );
}
