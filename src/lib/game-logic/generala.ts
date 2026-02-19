import type { GeneralaScore } from "@/lib/types/score";

export type GeneralaCategory =
  | "ones"
  | "twos"
  | "threes"
  | "fours"
  | "fives"
  | "sixes"
  | "straight"
  | "full_house"
  | "poker"
  | "generala"
  | "double_generala";

export type CategoryType = "number" | "special" | "generala";

export interface CategoryDefinition {
  key: GeneralaCategory;
  label: string;
  type: CategoryType;
  diceValue?: number; // for number categories (1-6)
  normalScore?: number; // for special categories
  servidaScore?: number; // for special categories
}

export interface ScoreOption {
  label: string;
  value: number;
  isServida?: boolean;
}

export const CATEGORIES: CategoryDefinition[] = [
  { key: "ones", label: "1", type: "number", diceValue: 1 },
  { key: "twos", label: "2", type: "number", diceValue: 2 },
  { key: "threes", label: "3", type: "number", diceValue: 3 },
  { key: "fours", label: "4", type: "number", diceValue: 4 },
  { key: "fives", label: "5", type: "number", diceValue: 5 },
  { key: "sixes", label: "6", type: "number", diceValue: 6 },
  {
    key: "straight",
    label: "Escalera",
    type: "special",
    normalScore: 20,
    servidaScore: 25,
  },
  {
    key: "full_house",
    label: "Full",
    type: "special",
    normalScore: 30,
    servidaScore: 35,
  },
  {
    key: "poker",
    label: "Poker",
    type: "special",
    normalScore: 40,
    servidaScore: 45,
  },
  { key: "generala", label: "Generala", type: "generala", normalScore: 50 },
  {
    key: "double_generala",
    label: "Doble Generala",
    type: "generala",
    normalScore: 100,
  },
];

export function getValidScores(category: CategoryDefinition): ScoreOption[] {
  if (category.type === "number") {
    const dv = category.diceValue!;
    const options: ScoreOption[] = [{ label: "Tachar", value: 0 }];
    for (let i = 1; i <= 5; i++) {
      options.push({ label: `${dv * i}`, value: dv * i });
    }
    return options;
  }

  if (category.type === "special") {
    return [
      { label: "Tachar", value: 0 },
      { label: `Normal (${category.normalScore})`, value: category.normalScore! },
      {
        label: `Servida (${category.servidaScore})`,
        value: category.servidaScore!,
        isServida: true,
      },
    ];
  }

  // generala type
  return [
    { label: "Tachar", value: 0 },
    { label: `Anotar (${category.normalScore})`, value: category.normalScore! },
  ];
}

export function calculateTotal(score: GeneralaScore): number {
  let total = 0;
  for (const cat of CATEGORIES) {
    const val = score[cat.key];
    if (val !== null && val > 0) {
      total += val;
    }
  }
  return total;
}

export function isComplete(score: GeneralaScore): boolean {
  return CATEGORIES.every((cat) => score[cat.key] !== null);
}

export function allPlayersComplete(scores: GeneralaScore[]): boolean {
  return scores.length > 0 && scores.every(isComplete);
}

export function checkGameEnd(
  scores: GeneralaScore[]
): { winnerId: string; reason: string } | null {
  if (!allPlayersComplete(scores)) return null;

  let maxTotal = -1;
  let winnerId = "";
  let tie = false;

  for (const score of scores) {
    const total = calculateTotal(score);
    if (total > maxTotal) {
      maxTotal = total;
      winnerId = score.player_id;
      tie = false;
    } else if (total === maxTotal) {
      tie = true;
    }
  }

  if (tie) {
    return { winnerId: "", reason: "Empate" };
  }

  return { winnerId, reason: "Mayor puntaje" };
}

export function formatCellValue(value: number | null): string {
  if (value === null) return "";
  if (value === 0) return "X";
  return String(value);
}
