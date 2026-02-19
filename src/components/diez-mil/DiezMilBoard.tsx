"use client";

import { Lock } from "lucide-react";
import type { DiezMilScore } from "@/lib/types/score";
import type { DiezMilConfig } from "@/lib/types/game";
import type { Player } from "@/lib/types/player";
import { isPlayerOpened } from "@/lib/game-logic/diez-mil";

interface DiezMilBoardProps {
  scores: DiezMilScore[];
  players: Player[];
  config: DiezMilConfig;
  onPlayerTap: (scoreId: string) => void;
  disabled: boolean;
}

const stickyBg = "rgba(10, 14, 31, 0.95)";
const stickyStyle = {
  background: stickyBg,
  boxShadow: "2px 0 4px rgba(0,0,0,0.3)",
};

export function DiezMilBoard({
  scores,
  players,
  config,
  onPlayerTap,
  disabled,
}: DiezMilBoardProps) {
  const maxTurns = Math.max(...scores.map((s) => s.turns.length), 0);

  return (
    <div className="flex flex-col gap-3">
      {/* Player totals — tappable cards */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${scores.length}, 1fr)` }}>
        {scores.map((score) => {
          const player = players.find((p) => p.id === score.player_id);
          const opened = !config.require_1000 || isPlayerOpened(score);
          return (
            <button
              key={score.id}
              onClick={() => onPlayerTap(score.id)}
              disabled={disabled}
              className="glass-card flex flex-col items-center gap-1 p-3 transition-all active:scale-[0.97] disabled:pointer-events-none"
            >
              <span className="text-xs font-medium text-text-secondary truncate w-full text-center">
                {player?.name ?? "—"}
              </span>
              <span className="text-xl font-bold text-text-primary tabular-nums">
                {score.total_points.toLocaleString("es-AR")}
              </span>
              {!opened && (
                <span className="flex items-center gap-1 text-[0.65rem] text-amber-400/80">
                  <Lock size={10} />
                  Cerrado
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Turn history table */}
      {maxTurns > 0 && (
        <div className="glass-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th
                    className="sticky left-0 z-10 px-3 py-2 text-left text-sm font-semibold text-text-secondary"
                    style={stickyStyle}
                  >
                    Ronda
                  </th>
                  {scores.map((score) => {
                    const player = players.find((p) => p.id === score.player_id);
                    return (
                      <th
                        key={score.id}
                        className="px-3 py-2 text-center text-sm font-semibold text-text-secondary min-w-[5rem] whitespace-nowrap"
                      >
                        {player?.name ?? "—"}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: maxTurns }, (_, i) => (
                  <tr
                    key={i}
                    className={i < maxTurns - 1 ? "border-b border-white/5" : ""}
                  >
                    <td
                      className="sticky left-0 z-10 px-3 py-1.5 text-sm font-medium text-text-primary whitespace-nowrap"
                      style={stickyStyle}
                    >
                      {i + 1}
                    </td>
                    {scores.map((score) => {
                      const turn = score.turns[i];
                      if (!turn) {
                        return (
                          <td key={score.id} className="px-2 py-1.5 text-center text-sm text-text-muted">
                            –
                          </td>
                        );
                      }
                      const isPifia = turn.points_earned === 0;
                      return (
                        <td
                          key={score.id}
                          className={`px-2 py-1.5 text-center text-sm font-medium tabular-nums ${
                            isPifia ? "text-danger-400/60" : "text-text-primary"
                          }`}
                        >
                          {isPifia ? "Pifia" : `+${turn.points_earned.toLocaleString("es-AR")}`}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
