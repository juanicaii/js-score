"use client";

import { Drawer } from "vaul";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmColors =
    variant === "danger"
      ? "bg-danger-500/80 hover:bg-danger-500"
      : "bg-primary-500 hover:bg-primary-600 glow-blue-hover";

  return (
    <Drawer.Root open={open} onOpenChange={(o) => !o && onCancel()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl glass outline-none">
          <div className="flex justify-center pt-3 pb-1">
            <Drawer.Handle className="h-1.5 w-10 rounded-full bg-white/20" />
          </div>

          <div className="px-5 pt-2 pb-4">
            <Drawer.Title className="text-lg font-bold mb-2">
              {title}
            </Drawer.Title>
            <Drawer.Description className="text-sm text-text-secondary">
              {message}
            </Drawer.Description>
          </div>

          <div className="flex gap-3 border-t border-white/5 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button
              onClick={onCancel}
              className="flex-1 rounded-lg bg-white/5 px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-white/10 transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors ${confirmColors}`}
            >
              {confirmLabel}
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
