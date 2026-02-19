"use client";

import type { GeneralaScore } from "@/lib/types/score";
import type { Player } from "@/lib/types/player";
import type { GeneralaCategory } from "@/lib/game-logic/generala";
import {
  CATEGORIES,
  calculateTotal,
  formatCellValue,
} from "@/lib/game-logic/generala";

interface GeneralaBoardProps {
  scores: GeneralaScore[];
  players: Player[];
  onCellTap: (
    scoreId: string,
    category: GeneralaCategory,
    currentValue: number | null
  ) => void;
  disabled: boolean;
}

const stickyBg = "rgba(10, 14, 31, 0.95)";
const stickyStyle = {
  background: stickyBg,
  boxShadow: "2px 0 4px rgba(0,0,0,0.3)",
};

export function GeneralaBoard({
  scores,
  players,
  onCellTap,
  disabled,
}: GeneralaBoardProps) {
  return (
    <div className="glass-card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="text-sm" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr>
              <th
                className="sticky left-0 z-10 px-3 py-2.5 text-left text-xs font-semibold text-text-secondary"
                style={stickyStyle}
              >
                Categoría
              </th>
              {scores.map((score) => {
                const player = players.find((p) => p.id === score.player_id);
                return (
                  <th
                    key={score.id}
                    className="px-3 py-2.5 text-center text-xs font-semibold text-text-secondary min-w-[4.5rem] whitespace-nowrap"
                  >
                    {player?.name ?? "—"}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((cat, i) => {
              const isLast = i === CATEGORIES.length - 1;
              return (
                <tr
                  key={cat.key}
                  className={isLast ? "" : "border-b border-white/5"}
                >
                  <td
                    className="sticky left-0 z-10 px-3 py-1.5 text-xs font-medium text-text-primary whitespace-nowrap"
                    style={stickyStyle}
                  >
                    {cat.label}
                  </td>
                  {scores.map((score) => {
                    const val = score[cat.key];
                    const display = formatCellValue(val);
                    const isEmpty = val === null;
                    const isCrossed = val === 0;

                    return (
                      <td key={score.id} className="px-1 py-0.5 text-center">
                        <button
                          onClick={() => onCellTap(score.id, cat.key, val)}
                          disabled={disabled}
                          className={`w-full rounded-lg px-2 py-1.5 text-sm font-medium transition-all active:scale-95 disabled:pointer-events-none ${
                            isEmpty
                              ? "text-text-muted hover:bg-white/5"
                              : isCrossed
                                ? "text-danger-400/60"
                                : "text-text-primary"
                          }`}
                        >
                          {isEmpty ? "·" : display}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-white/10">
              <td
                className="sticky left-0 z-10 px-3 py-2.5 text-xs font-bold text-accent-300"
                style={stickyStyle}
              >
                TOTAL
              </td>
              {scores.map((score) => (
                <td
                  key={score.id}
                  className="px-3 py-2.5 text-center text-sm font-bold text-accent-300 tabular-nums"
                >
                  {calculateTotal(score)}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
