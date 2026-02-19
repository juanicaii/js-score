import { Trophy } from "lucide-react";
import { TrucoPalitos } from "./TrucoPalitos";
import type { TrucoScore } from "@/lib/types/score";

interface TrucoBoardProps {
  teamNames: [string, string];
  scores: TrucoScore[];
  targetScore: number;
  winner: "nosotros" | "ellos" | null;
}

function TeamColumn({
  name,
  score,
  targetScore,
  isWinner,
}: {
  name: string;
  score: TrucoScore;
  targetScore: number;
  isWinner: boolean;
}) {
  return (
    <div
      className={`glass-card flex flex-col p-4 ${
        isWinner ? "border-accent-500/30 glow-gold" : ""
      }`}
    >
      {/* Team name */}
      <div className="flex items-center justify-center gap-1.5 mb-3">
        {isWinner && (
          <Trophy size={16} className="text-accent-300 icon-glow-gold" />
        )}
        <h3
          className={`text-sm font-semibold truncate ${
            isWinner ? "text-accent-300" : "text-text-secondary"
          }`}
        >
          {name}
        </h3>
      </div>

      {/* Big score number */}
      <div className="text-center mb-3">
        <span
          className={`text-4xl font-bold tabular-nums ${
            isWinner ? "text-accent-300" : "text-text-primary"
          }`}
        >
          {score.points}
        </span>
      </div>

      {/* Palitos */}
      <div className="flex-1">
        <TrucoPalitos points={score.points} targetScore={targetScore} />
      </div>
    </div>
  );
}

export function TrucoBoard({
  teamNames,
  scores,
  targetScore,
  winner,
}: TrucoBoardProps) {
  const nosotrosScore = scores.find((s) => s.team === "nosotros");
  const ellosScore = scores.find((s) => s.team === "ellos");

  if (!nosotrosScore || !ellosScore) return null;

  return (
    <div className="grid grid-cols-2 gap-3 flex-1">
      <TeamColumn
        name={teamNames[0]}
        score={nosotrosScore}
        targetScore={targetScore}
        isWinner={winner === "nosotros"}
      />
      <TeamColumn
        name={teamNames[1]}
        score={ellosScore}
        targetScore={targetScore}
        isWinner={winner === "ellos"}
      />
    </div>
  );
}
