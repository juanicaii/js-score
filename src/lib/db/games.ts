import { db } from "./index";
import { generateId } from "@/lib/utils/id";
import type { Game, GameType, GameConfig } from "@/lib/types/game";

export async function createGame(
  gameType: GameType,
  config: GameConfig,
  playerIds: string[]
): Promise<Game> {
  const game: Game = {
    id: generateId(),
    game_type: gameType,
    status: "in_progress",
    config,
    player_ids: playerIds,
    created_at: Date.now(),
  };
  await db.games.add(game);
  return game;
}

export async function getGame(id: string): Promise<Game | undefined> {
  return db.games.get(id);
}

export async function getActiveGame(): Promise<Game | undefined> {
  return db.games.where("status").equals("in_progress").first();
}

export async function getAllGames(): Promise<Game[]> {
  return db.games.orderBy("created_at").reverse().toArray();
}

export async function updateGame(
  id: string,
  updates: Partial<Game>
): Promise<void> {
  await db.games.update(id, updates);
}

export async function finishGame(
  id: string,
  winnerId?: string
): Promise<void> {
  await db.games.update(id, {
    status: "finished",
    winner_id: winnerId,
    finished_at: Date.now(),
  });
}

export async function deleteGame(id: string): Promise<void> {
  await db.games.delete(id);
}
