import Dexie, { type EntityTable } from "dexie";
import type { Player } from "@/lib/types/player";
import type { Game } from "@/lib/types/game";
import type { TrucoScore, GeneralaScore, DiezMilScore, ChinchonScore } from "@/lib/types/score";

const db = new Dexie("js-score") as Dexie & {
  players: EntityTable<Player, "id">;
  games: EntityTable<Game, "id">;
  truco_scores: EntityTable<TrucoScore, "id">;
  generala_scores: EntityTable<GeneralaScore, "id">;
  diez_mil_scores: EntityTable<DiezMilScore, "id">;
  chinchon_scores: EntityTable<ChinchonScore, "id">;
};

db.version(1).stores({
  players: "id, name, created_at",
  games: "id, game_type, status, created_at",
});

db.version(2).stores({
  players: "id, name, created_at",
  games: "id, game_type, status, created_at",
  truco_scores: "id, game_id, team",
});

db.version(3).stores({
  generala_scores: "id, game_id, player_id",
});

db.version(4).stores({
  generala_scores: "id, game_id, player_id, [game_id+player_id]",
});

db.version(5).stores({
  diez_mil_scores: "id, game_id, player_id",
});

db.version(6).stores({
  chinchon_scores: "id, game_id, player_id",
});

export { db };
