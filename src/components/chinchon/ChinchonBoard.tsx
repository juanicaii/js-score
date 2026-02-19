"use client";

import type { ChinchonScore } from "@/lib/types/score";
import type { Player } from "@/lib/types/player";

interface ChinchonBoardProps {
  scores: ChinchonScore[];
  players: Player[];
}

const stickyBg = "rgba(10, 14, 31, 0.95)";
const stickyStyle = {
  background: stickyBg,
  boxShadow: "2px 0 4px rgba(0,0,0,0.3)",
};

export function ChinchonBoard({ scores, players }: ChinchonBoardProps) {
  const maxRounds = Math.max(0, ...scores.map((s) => s.rounds.length));

  return (
    <div className="glass-card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table
          className="w-full text-sm"
          style={{ borderCollapse: "separate", borderSpacing: 0 }}
        >
          <thead>
            <tr>
              <th
                className="sticky left-0 z-10 px-3 py-2.5 text-left text-sm font-semibold text-text-secondary"
                style={stickyStyle}
              >
                Ronda
              </th>
              {scores.map((score) => {
                const player = players.find((p) => p.id === score.player_id);
                return (
                  <th
                    key={score.id}
                    className={`px-3 py-2.5 text-center text-sm font-semibold min-w-[5rem] whitespace-nowrap ${
                      score.is_eliminated
                        ? "text-text-muted opacity-50"
                        : "text-text-secondary"
                    }`}
                  >
                    {player?.name ?? "—"}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {maxRounds === 0 ? (
              <tr>
                <td
                  colSpan={scores.length + 1}
                  className="px-3 py-6 text-center text-sm text-text-muted"
                >
                  Sin rondas anotadas
                </td>
              </tr>
            ) : (
              Array.from({ length: maxRounds }, (_, i) => (
                <tr
                  key={i}
                  className={
                    i === maxRounds - 1 ? "" : "border-b border-white/5"
                  }
                >
                  <td
                    className="sticky left-0 z-10 px-3 py-1.5 text-sm font-medium text-text-primary whitespace-nowrap"
                    style={stickyStyle}
                  >
                    {i + 1}
                  </td>
                  {scores.map((score) => {
                    const round = score.rounds[i];
                    const pts = round?.points;
                    return (
                      <td
                        key={score.id}
                        className={`px-2 py-1.5 text-center text-sm tabular-nums ${
                          score.is_eliminated ? "opacity-50" : ""
                        } ${
                          pts !== undefined && pts < 0
                            ? "text-green-400 font-semibold"
                            : pts !== undefined && pts > 0
                              ? "text-text-primary"
                              : "text-text-muted"
                        }`}
                      >
                        {pts !== undefined ? pts : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="border-t border-white/10">
              <td
                className="sticky left-0 z-10 px-3 py-2.5 text-sm font-bold text-accent-300"
                style={stickyStyle}
              >
                TOTAL
              </td>
              {scores.map((score) => (
                <td
                  key={score.id}
                  className={`px-3 py-2.5 text-center text-sm font-bold tabular-nums ${
                    score.is_eliminated
                      ? "text-danger-400 opacity-70"
                      : "text-accent-300"
                  }`}
                >
                  {score.total_points}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
