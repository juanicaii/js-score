"use client";

import { Lock } from "lucide-react";

interface DiezMilTurnCardProps {
  playerName: string;
  totalPoints: number;
  targetScore: number;
  isOpened: boolean;
  requiresOpen: boolean;
  turnAdds: number[];
  onQuickAdd: (amount: number) => void;
  onCustom: () => void;
  onBank: () => void;
  onPifia: () => void;
  onUndoAdd: () => void;
}

const QUICK_AMOUNTS = [50, 100, 200, 300, 500, 1000];

export function DiezMilTurnCard({
  playerName,
  totalPoints,
  targetScore,
  isOpened,
  requiresOpen,
  turnAdds,
  onQuickAdd,
  onCustom,
  onBank,
  onPifia,
  onUndoAdd,
}: DiezMilTurnCardProps) {
  const turnTotal = turnAdds.reduce((a, b) => a + b, 0);
  const wouldExceed = totalPoints + turnTotal > targetScore;
  const needsOpen = requiresOpen && !isOpened && turnTotal < 1000;
  const canBank = turnTotal > 0 && !wouldExceed && !needsOpen;
  const showLock = requiresOpen && !isOpened;

  return (
    <div className="glass-card p-5 flex flex-col gap-4">
      {/* Player name + total */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
          Turno de
        </span>
        <h2 className="text-2xl font-bold text-text-primary">{playerName}</h2>
        <span className="text-sm text-text-secondary tabular-nums">
          Total: {totalPoints.toLocaleString("es-AR")}
        </span>
        {showLock && (
          <span className="flex items-center gap-1.5 mt-1 text-xs text-amber-400/80">
            <Lock size={12} />
            Necesita 1.000 para abrir
          </span>
        )}
      </div>

      {/* Current turn accumulator */}
      <div className={`glass-card flex flex-col items-center gap-1.5 rounded-xl p-4 ${wouldExceed ? "border border-danger-500/30" : ""}`}>
        <span className="text-xs text-text-muted">Turno actual</span>
        <span className={`text-3xl font-bold tabular-nums ${wouldExceed ? "text-danger-400" : "text-primary-300"}`}>
          {turnTotal > 0 ? `+${turnTotal.toLocaleString("es-AR")}` : "0"}
        </span>
        {turnAdds.length > 1 && (
          <div className="flex flex-wrap justify-center gap-1.5 mt-1">
            {turnAdds.map((add, i) => (
              <span
                key={i}
                className="rounded-full bg-white/5 px-2 py-0.5 text-[0.65rem] text-text-muted tabular-nums"
              >
                +{add}
              </span>
            ))}
          </div>
        )}
        {wouldExceed && (
          <span className="text-xs text-danger-400 mt-1">
            Se pasa de {targetScore.toLocaleString("es-AR")}
          </span>
        )}
      </div>

      {/* Quick-add buttons */}
      <div className="grid grid-cols-3 gap-2">
        {QUICK_AMOUNTS.map((amount) => (
          <button
            key={amount}
            onClick={() => onQuickAdd(amount)}
            className="rounded-xl bg-white/5 py-3 text-sm font-semibold text-text-primary hover:bg-white/10 active:scale-95 transition-all tabular-nums"
          >
            +{amount.toLocaleString("es-AR")}
          </button>
        ))}
      </div>

      <button
        onClick={onCustom}
        className="rounded-xl bg-white/5 py-3 text-sm font-medium text-text-secondary hover:bg-white/10 active:scale-95 transition-all"
      >
        Otro...
      </button>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={onPifia}
          className="flex-1 rounded-xl bg-danger-500/10 py-3.5 text-sm font-semibold text-danger-400 hover:bg-danger-500/20 active:scale-[0.97] transition-all"
        >
          Pifia
        </button>
        <button
          onClick={onBank}
          disabled={!canBank}
          className="flex-1 rounded-xl bg-primary-500 py-3.5 text-sm font-semibold text-white hover:bg-primary-600 glow-blue-hover active:scale-[0.97] transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          Anotar
        </button>
      </div>

      {/* Undo last add */}
      {turnAdds.length > 0 && (
        <button
          onClick={onUndoAdd}
          className="rounded-lg py-2 text-xs font-medium text-text-muted hover:text-text-secondary transition-colors"
        >
          ← Deshacer +{turnAdds[turnAdds.length - 1]}
        </button>
      )}
    </div>
  );
}
