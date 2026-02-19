import { db } from "./index";
import { generateId } from "@/lib/utils/id";
import type { TrucoScore, GeneralaScore } from "@/lib/types/score";
import type { GeneralaCategory } from "@/lib/game-logic/generala";

export async function createTrucoScores(gameId: string): Promise<TrucoScore[]> {
  const scores: TrucoScore[] = [
    { id: generateId(), game_id: gameId, team: "nosotros", points: 0 },
    { id: generateId(), game_id: gameId, team: "ellos", points: 0 },
  ];
  await db.truco_scores.bulkAdd(scores);
  return scores;
}

export async function getTrucoScores(gameId: string): Promise<TrucoScore[]> {
  return db.truco_scores.where("game_id").equals(gameId).toArray();
}

export async function updateTrucoScore(
  id: string,
  points: number
): Promise<void> {
  await db.truco_scores.update(id, { points });
}

export async function deleteTrucoScores(gameId: string): Promise<void> {
  await db.truco_scores.where("game_id").equals(gameId).delete();
}

// --- Generala ---

export async function createGeneralaScores(
  gameId: string,
  playerIds: string[]
): Promise<GeneralaScore[]> {
  const scores: GeneralaScore[] = playerIds.map((playerId) => ({
    id: generateId(),
    game_id: gameId,
    player_id: playerId,
    ones: null,
    twos: null,
    threes: null,
    fours: null,
    fives: null,
    sixes: null,
    straight: null,
    full_house: null,
    poker: null,
    generala: null,
    double_generala: null,
  }));
  await db.generala_scores.bulkAdd(scores);
  return scores;
}

export async function getGeneralaScores(
  gameId: string
): Promise<GeneralaScore[]> {
  return db.generala_scores.where("game_id").equals(gameId).toArray();
}

export async function updateGeneralaScore(
  id: string,
  category: GeneralaCategory,
  value: number | null
): Promise<void> {
  await db.generala_scores.update(id, { [category]: value });
}

export async function deleteGeneralaScores(gameId: string): Promise<void> {
  await db.generala_scores.where("game_id").equals(gameId).delete();
}
