"use client";

import { useState, useEffect } from "react";
import { Drawer } from "vaul";
import type { Player } from "@/lib/types/player";
import type { ChinchonScore } from "@/lib/types/score";

interface PlayerRoundEntry {
  scoreId: string;
  playerId: string;
  playerName: string;
  currentTotal: number;
  value: string;
}

interface ChinchonRoundInputProps {
  open: boolean;
  scores: ChinchonScore[];
  players: Player[];
  chinchonWins: boolean;
  onConfirm: (entries: { id: string; points: number }[]) => void;
  onChinchonWin: (playerId: string) => void;
  onClose: () => void;
}

export function ChinchonRoundInput({
  open,
  scores,
  players,
  chinchonWins,
  onConfirm,
  onChinchonWin,
  onClose,
}: ChinchonRoundInputProps) {
  const [entries, setEntries] = useState<PlayerRoundEntry[]>([]);

  useEffect(() => {
    if (open) {
      const active = scores.filter((s) => !s.is_eliminated);
      setEntries(
        active.map((s) => {
          const player = players.find((p) => p.id === s.player_id);
          return {
            scoreId: s.id,
            playerId: s.player_id,
            playerName: player?.name ?? "—",
            currentTotal: s.total_points,
            value: "",
          };
        })
      );
    }
  }, [open, scores, players]);

  const handleValueChange = (idx: number, val: string) => {
    // Allow empty, negative sign, or numbers (including negatives)
    if (val !== "" && val !== "-" && isNaN(Number(val))) return;
    setEntries((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, value: val } : e))
    );
  };

  const handleChinchon = (idx: number) => {
    if (chinchonWins) {
      onChinchonWin(entries[idx].playerId);
      onClose();
      return;
    }
    setEntries((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, value: "-10" } : e))
    );
  };

  const handleConfirm = () => {
    const parsed = entries.map((e) => ({
      id: e.scoreId,
      points: e.value === "" || e.value === "-" ? 0 : Number(e.value),
    }));

    const hasAnyValue = parsed.some((p) => p.points !== 0);
    if (!hasAnyValue) return;

    onConfirm(parsed);
    onClose();
  };

  const hasAnyValue = entries.some(
    (e) => e.value !== "" && e.value !== "-" && Number(e.value) !== 0
  );

  return (
    <Drawer.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl glass outline-none max-h-[85vh]">
          <div className="flex justify-center pt-3 pb-1">
            <Drawer.Handle className="h-1.5 w-10 rounded-full bg-white/20" />
          </div>

          <div className="overflow-y-auto px-5 pt-2 pb-4">
            <Drawer.Title className="text-lg font-bold mb-1">
              Anotar ronda
            </Drawer.Title>
            <Drawer.Description className="text-sm text-text-secondary mb-4">
              Ingresa los puntos de cada jugador
            </Drawer.Description>

            <div className="flex flex-col gap-3">
              {entries.map((entry, idx) => (
                <div
                  key={entry.scoreId}
                  className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {entry.playerName}
                    </p>
                    <p className="text-xs text-text-muted tabular-nums">
                      Total: {entry.currentTotal}
                    </p>
                  </div>

                  <button
                    onClick={() => handleChinchon(idx)}
                    className="shrink-0 rounded-lg bg-green-500/20 px-2.5 py-1.5 text-xs font-bold text-green-400 hover:bg-green-500/30 transition-colors active:scale-95"
                  >
                    CH
                  </button>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={entry.value}
                    onChange={(e) => handleValueChange(idx, e.target.value)}
                    placeholder="0"
                    className="glass-input w-20 shrink-0 text-center text-sm tabular-nums"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleConfirm}
              disabled={!hasAnyValue}
              className="mt-4 w-full rounded-xl bg-primary-500 py-3.5 text-sm font-semibold text-white hover:bg-primary-600 glow-blue-hover active:scale-[0.97] transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              Confirmar ronda
            </button>
          </div>

          <div className="border-t border-white/5 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-white/5 px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
