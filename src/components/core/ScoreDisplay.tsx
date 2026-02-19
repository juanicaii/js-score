import { formatScore } from "@/lib/utils/format";

type ScoreVariant = "default" | "winning" | "losing" | "eliminated";

interface ScoreDisplayProps {
  score: number;
  variant?: ScoreVariant;
  size?: "sm" | "md" | "lg";
}

const variantColors: Record<ScoreVariant, string> = {
  default: "text-text-primary",
  winning: "text-accent-300",
  losing: "text-text-muted",
  eliminated: "text-danger-400 line-through opacity-60",
};

const sizeClasses: Record<"sm" | "md" | "lg", string> = {
  sm: "text-sm",
  md: "text-lg font-semibold",
  lg: "text-2xl font-bold",
};

export function ScoreDisplay({
  score,
  variant = "default",
  size = "md",
}: ScoreDisplayProps) {
  return (
    <span className={`tabular-nums ${variantColors[variant]} ${sizeClasses[size]}`}>
      {formatScore(score)}
    </span>
  );
}
