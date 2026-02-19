export interface GeneralaScore {
  id: string;
  game_id: string;
  player_id: string;
  ones: number | null;
  twos: number | null;
  threes: number | null;
  fours: number | null;
  fives: number | null;
  sixes: number | null;
  straight: number | null;
  full_house: number | null;
  poker: number | null;
  generala: number | null;
  double_generala: number | null;
}

export interface ChinchonRound {
  round_number: number;
  points: number;
}

export interface ChinchonScore {
  id: string;
  game_id: string;
  player_id: string;
  rounds: ChinchonRound[];
  total_points: number;
  is_eliminated: boolean;
}

export interface TrucoScore {
  id: string;
  game_id: string;
  team: "nosotros" | "ellos";
  points: number;
}

export interface DiezMilTurn {
  turn_number: number;
  points_earned: number;
  combination: string;
  total_after: number;
}

export interface DiezMilScore {
  id: string;
  game_id: string;
  player_id: string;
  turns: DiezMilTurn[];
  total_points: number;
}

export interface UniversalRound {
  round_number: number;
  points: number;
}

export interface UniversalScore {
  id: string;
  game_id: string;
  player_id: string;
  rounds: UniversalRound[];
  total_points: number;
}
