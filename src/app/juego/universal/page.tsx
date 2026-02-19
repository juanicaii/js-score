"use client";

import { AppShell } from "@/components/layout/AppShell";
import { GameIcon } from "@/components/icons/GameIcon";

export default function UniversalPage() {
  return (
    <AppShell title="Universal" showBack>
      <div className="glass-card flex flex-col items-center p-8 text-center">
        <GameIcon type="universal" size="xl" className="mb-4 text-primary-300 icon-glow-blue" />
        <h2 className="text-xl font-bold text-text-primary mb-2">Anotador Universal</h2>
        <p className="text-text-muted">Próximamente...</p>
      </div>
    </AppShell>
  );
}
