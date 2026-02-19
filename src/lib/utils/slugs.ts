import type { GameType } from "@/lib/types";

const slugMap: Record<GameType, string> = {
  generala: "generala",
  chinchon: "chinchon",
  truco: "truco",
  diez_mil: "diez-mil",
  universal: "universal",
};

const reverseSlugMap: Record<string, GameType> = Object.fromEntries(
  Object.entries(slugMap).map(([k, v]) => [v, k as GameType])
);

export function gameTypeToSlug(type: GameType): string {
  return slugMap[type];
}

export function slugToGameType(slug: string): GameType | undefined {
  return reverseSlugMap[slug];
}
