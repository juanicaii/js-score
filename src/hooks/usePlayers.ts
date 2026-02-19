import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { Player } from "@/lib/types";

export function usePlayers(): Player[] | undefined {
  return useLiveQuery(() => db.players.orderBy("name").toArray());
}

export function usePlayer(id: string | undefined): Player | undefined {
  return useLiveQuery(
    () => (id ? db.players.get(id) : undefined),
    [id]
  );
}
