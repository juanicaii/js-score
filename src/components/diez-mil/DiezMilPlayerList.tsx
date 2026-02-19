"use client";

import { Lock } from "lucide-react";
import type { DiezMilScore } from "@/lib/types/score";
import type { DiezMilConfig } from "@/lib/types/game";
import type { Player } from "@/lib/types/player";
import { isPlayerOpened } from "@/lib/game-logic/diez-mil";

interface DiezMilPlayerListProps {
  scores: DiezMilScore[];
  players: Player[];
  config: DiezMilConfig;
  currentPlayerIdx: number;
  onSelectPlayer: (idx: number) => void;
}

export function DiezMilPlayerList({
  scores,
  players,
  config,
  currentPlayerIdx,
  onSelectPlayer,
}: DiezMilPlayerListProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-text-muted uppercase tracking-wider px-1">
        Jugadores
      </span>
      <div className="glass-card overflow-hidden p-0 divide-y divide-white/5">
        {scores.map((score, idx) => {
          const player = players.find((p) => p.id === score.player_id);
          const isCurrent = idx === currentPlayerIdx;
          const opened = !config.require_1000 || isPlayerOpened(score);

          return (
            <button
              key={score.id}
              onClick={() => onSelectPlayer(idx)}
              className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors ${
                isCurrent
                  ? "bg-primary-500/10"
                  : "hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isCurrent ? "bg-primary-400" : "bg-transparent"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isCurrent ? "text-primary-300" : "text-text-primary"
                  }`}
                >
                  {player?.name ?? "—"}
                </span>
                {!opened && (
                  <Lock size={12} className="text-amber-400/60" />
                )}
              </div>
              <span className="text-sm font-semibold tabular-nums text-text-secondary">
                {score.total_points.toLocaleString("es-AR")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
