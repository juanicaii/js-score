import { Dices, Spade, Swords, Target, NotepadText } from "lucide-react";
import type { GameType } from "@/lib/types";

const iconMap = {
  generala: Dices,
  chinchon: Spade,
  truco: Swords,
  diez_mil: Target,
  universal: NotepadText,
} as const;

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 40,
} as const;

interface GameIconProps {
  type: GameType;
  size?: keyof typeof sizeMap;
  className?: string;
}

export function GameIcon({ type, size = "md", className }: GameIconProps) {
  const Icon = iconMap[type];
  return <Icon size={sizeMap[size]} strokeWidth={1.75} className={className} />;
}
