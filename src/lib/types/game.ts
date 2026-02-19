export type GameType =
  | "generala"
  | "chinchon"
  | "truco"
  | "diez_mil"
  | "universal";

export type GameStatus = "in_progress" | "finished";

export interface GeneralaConfig {
  max_players: number;
}

export interface ChinchonConfig {
  elimination_score: number;
  chinchon_wins: boolean;
}

export interface TrucoConfig {
  target_score: number;
  team_names: [string, string];
}

export interface DiezMilConfig {
  target_score: number;
  require_1000: boolean;
}

export interface UniversalConfig {
  target_score: number;
  highest_wins: boolean;
}

export type GameConfig =
  | GeneralaConfig
  | ChinchonConfig
  | TrucoConfig
  | DiezMilConfig
  | UniversalConfig;

export interface Game {
  id: string;
  game_type: GameType;
  status: GameStatus;
  config: GameConfig;
  player_ids: string[];
  winner_id?: string;
  created_at: number;
  finished_at?: number;
}

export interface GameInfo {
  type: GameType;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  slug: string;
}

export const GAMES: GameInfo[] = [
  {
    type: "generala",
    name: "Generala",
    description: "Dados y categorías",
    minPlayers: 2,
    maxPlayers: 6,
    slug: "generala",
  },
  {
    type: "chinchon",
    name: "Chinchón",
    description: "Cartas y eliminación",
    minPlayers: 2,
    maxPlayers: 8,
    slug: "chinchon",
  },
  {
    type: "truco",
    name: "Truco",
    description: "Nosotros vs Ellos",
    minPlayers: 2,
    maxPlayers: 2,
    slug: "truco",
  },
  {
    type: "diez_mil",
    name: "10.000",
    description: "Dados y combinaciones",
    minPlayers: 2,
    maxPlayers: 6,
    slug: "diez-mil",
  },
  {
    type: "universal",
    name: "Universal",
    description: "Anotador libre",
    minPlayers: 2,
    maxPlayers: 20,
    slug: "universal",
  },
];
