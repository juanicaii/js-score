import { db } from "./index";
import { generateId } from "@/lib/utils/id";
import type { Player } from "@/lib/types/player";

export async function createPlayer(name: string): Promise<Player> {
  const player: Player = {
    id: generateId(),
    name: name.trim(),
    created_at: Date.now(),
  };
  await db.players.add(player);
  return player;
}

export async function getAllPlayers(): Promise<Player[]> {
  return db.players.orderBy("name").toArray();
}

export async function getPlayer(id: string): Promise<Player | undefined> {
  return db.players.get(id);
}

export async function updatePlayer(
  id: string,
  updates: Partial<Pick<Player, "name">>
): Promise<void> {
  await db.players.update(id, updates);
}

export async function deletePlayer(id: string): Promise<void> {
  await db.players.delete(id);
}

export async function getPlayersByIds(ids: string[]): Promise<Player[]> {
  return db.players.where("id").anyOf(ids).toArray();
}
