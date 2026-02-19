import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { Game } from "@/lib/types";

export function useActiveGame(): Game | undefined {
  return useLiveQuery(() =>
    db.games.where("status").equals("in_progress").first()
  );
}

export function useGame(id: string | undefined): Game | undefined {
  return useLiveQuery(
    () => (id ? db.games.get(id) : undefined),
    [id]
  );
}
