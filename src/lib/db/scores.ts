import { db } from "./index";
import { generateId } from "@/lib/utils/id";
import type { TrucoScore, GeneralaScore, DiezMilScore, DiezMilTurn } from "@/lib/types/score";
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

// --- Diez Mil ---

export async function createDiezMilScores(
  gameId: string,
  playerIds: string[]
): Promise<DiezMilScore[]> {
  const scores: DiezMilScore[] = playerIds.map((playerId) => ({
    id: generateId(),
    game_id: gameId,
    player_id: playerId,
    turns: [],
    total_points: 0,
  }));
  await db.diez_mil_scores.bulkAdd(scores);
  return scores;
}

export async function addDiezMilTurn(
  id: string,
  turn: DiezMilTurn,
  newTotal: number
): Promise<void> {
  const score = await db.diez_mil_scores.get(id);
  if (!score) return;
  await db.diez_mil_scores.update(id, {
    turns: [...score.turns, turn],
    total_points: newTotal,
  });
}

export async function undoLastDiezMilTurn(id: string): Promise<void> {
  const score = await db.diez_mil_scores.get(id);
  if (!score || score.turns.length === 0) return;
  const turns = score.turns.slice(0, -1);
  const total = turns.length > 0 ? turns[turns.length - 1].total_after : 0;
  await db.diez_mil_scores.update(id, { turns, total_points: total });
}

export async function deleteDiezMilScores(gameId: string): Promise<void> {
  await db.diez_mil_scores.where("game_id").equals(gameId).delete();
}
