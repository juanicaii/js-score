"use client";

import { useState, useEffect } from "react";
import { Drawer } from "vaul";

interface DiezMilScoreInputProps {
  open: boolean;
  onConfirm: (amount: number) => void;
  onClose: () => void;
}

export function DiezMilScoreInput({
  open,
  onConfirm,
  onClose,
}: DiezMilScoreInputProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (open) setValue("");
  }, [open]);

  const numValue = parseInt(value, 10) || 0;

  const handleConfirm = () => {
    if (numValue <= 0) return;
    onConfirm(numValue);
    onClose();
  };

  const handleKeypad = (digit: string) => {
    if (digit === "del") {
      setValue((v) => v.slice(0, -1));
    } else {
      setValue((v) => {
        const next = v + digit;
        if (parseInt(next, 10) > 99999) return v;
        return next;
      });
    }
  };

  const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "del"];

  return (
    <Drawer.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl glass outline-none">
          <div className="flex justify-center pt-3 pb-1">
            <Drawer.Handle className="h-1.5 w-10 rounded-full bg-white/20" />
          </div>

          <div className="px-5 pt-2 pb-4">
            <Drawer.Title className="text-lg font-bold mb-1">
              Ingresar puntos
            </Drawer.Title>
            <Drawer.Description className="text-sm text-text-secondary mb-4">
              Cantidad personalizada
            </Drawer.Description>

            {/* Display */}
            <div className="glass-card mb-4 flex items-center justify-center rounded-xl p-4">
              <span className="text-3xl font-bold tabular-nums text-text-primary">
                {value === "" ? "0" : parseInt(value, 10).toLocaleString("es-AR")}
              </span>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {KEYS.map((key) => {
                if (key === "del") {
                  return (
                    <button
                      key={key}
                      onClick={() => handleKeypad("del")}
                      className="rounded-xl bg-white/5 px-2 py-3 text-sm font-medium text-text-secondary hover:bg-white/10 transition-all active:scale-95"
                    >
                      ←
                    </button>
                  );
                }
                return (
                  <button
                    key={key}
                    onClick={() => handleKeypad(key)}
                    className="rounded-xl bg-white/5 px-2 py-3 text-lg font-medium text-text-primary hover:bg-white/10 transition-all active:scale-95"
                  >
                    {key}
                  </button>
                );
              })}
            </div>

            {/* Confirm */}
            <button
              onClick={handleConfirm}
              disabled={numValue <= 0}
              className="w-full rounded-xl bg-primary-500 py-3.5 text-sm font-semibold text-white hover:bg-primary-600 glow-blue-hover active:scale-[0.97] transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              Agregar +{numValue > 0 ? numValue.toLocaleString("es-AR") : "0"}
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
