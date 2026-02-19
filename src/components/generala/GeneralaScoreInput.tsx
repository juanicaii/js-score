"use client";

import { Drawer } from "vaul";
import type { CategoryDefinition } from "@/lib/game-logic/generala";
import { getValidScores } from "@/lib/game-logic/generala";

interface GeneralaScoreInputProps {
  open: boolean;
  playerName: string;
  category: CategoryDefinition | null;
  currentValue: number | null;
  onSelect: (value: number) => void;
  onServidaWin: () => void;
  onClose: () => void;
}

export function GeneralaScoreInput({
  open,
  playerName,
  category,
  currentValue,
  onSelect,
  onServidaWin,
  onClose,
}: GeneralaScoreInputProps) {
  if (!category) return null;

  const options = getValidScores(category);
  const hasValue = currentValue !== null;
  const isGeneralaType = category.type === "generala";

  return (
    <Drawer.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl glass outline-none">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <Drawer.Handle className="h-1.5 w-10 rounded-full bg-white/20" />
          </div>

          <div className="px-5 pt-2 pb-4">
            <Drawer.Title className="text-lg font-bold mb-1">
              {category.label}
            </Drawer.Title>
            <Drawer.Description className="text-sm text-text-secondary mb-4">
              {playerName}
            </Drawer.Description>

            <div className="flex flex-col gap-2">
              {options.map((opt) => (
                <button
                  key={opt.value + opt.label}
                  onClick={() => {
                    onSelect(opt.value);
                    onClose();
                  }}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition-all active:scale-[0.97] ${
                    opt.value === 0
                      ? "bg-white/5 text-text-secondary hover:bg-white/10"
                      : "bg-primary-500/20 text-primary-300 hover:bg-primary-500/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}

              {isGeneralaType && (
                <button
                  onClick={() => {
                    onServidaWin();
                    onClose();
                  }}
                  className="rounded-xl px-4 py-3 text-sm font-medium bg-accent-500/20 text-accent-300 hover:bg-accent-500/30 transition-all active:scale-[0.97]"
                >
                  Servida (gana la partida)
                </button>
              )}

              {hasValue && (
                <button
                  onClick={() => {
                    onSelect(-1);
                    onClose();
                  }}
                  className="rounded-xl px-4 py-3 text-sm font-medium bg-danger-500/10 text-danger-400 hover:bg-danger-500/20 transition-all active:scale-[0.97] mt-1"
                >
                  Borrar (dejar vacio)
                </button>
              )}
            </div>
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
