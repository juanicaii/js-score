import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { Game } from "@/lib/types";

export function useGameHistory(): Game[] | undefined {
  return useLiveQuery(() =>
    db.games.orderBy("created_at").reverse().toArray()
  );
}
