import { Undo2, Plus } from "lucide-react";

interface TrucoControlsProps {
  teamNames: [string, string];
  scores: [number, number];
  onAddPoint: (team: "nosotros" | "ellos") => void;
  onUndo: () => void;
  canUndo: boolean;
  disabled: boolean;
}

export function TrucoControls({
  teamNames,
  scores,
  onAddPoint,
  onUndo,
  canUndo,
  disabled,
}: TrucoControlsProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onAddPoint("nosotros")}
          disabled={disabled}
          className="glass-card flex flex-col items-center gap-1 rounded-xl py-5 hover:border-primary-400/30 active:scale-[0.97] transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          <div className="flex items-center gap-1.5 text-primary-300">
            <Plus size={20} strokeWidth={2.5} />
            <span className="text-xl font-bold">1</span>
          </div>
          <span className="text-xs font-medium text-text-secondary truncate max-w-full px-2">
            {teamNames[0]}
          </span>
          <span className="text-[10px] text-text-muted tabular-nums">
            {scores[0]} pts
          </span>
        </button>
        <button
          onClick={() => onAddPoint("ellos")}
          disabled={disabled}
          className="glass-card flex flex-col items-center gap-1 rounded-xl py-5 hover:border-primary-400/30 active:scale-[0.97] transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          <div className="flex items-center gap-1.5 text-primary-300">
            <Plus size={20} strokeWidth={2.5} />
            <span className="text-xl font-bold">1</span>
          </div>
          <span className="text-xs font-medium text-text-secondary truncate max-w-full px-2">
            {teamNames[1]}
          </span>
          <span className="text-[10px] text-text-muted tabular-nums">
            {scores[1]} pts
          </span>
        </button>
      </div>
      {canUndo && (
        <button
          onClick={onUndo}
          className="flex items-center justify-center gap-2 rounded-lg bg-white/5 px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-white/10 active:scale-[0.97] transition-all"
        >
          <Undo2 size={14} />
          Deshacer
        </button>
      )}
    </div>
  );
}
