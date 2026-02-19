"use client";

import { AppShell } from "@/components/layout/AppShell";
import { GameIcon } from "@/components/icons/GameIcon";

export default function ChinchonPage() {
  return (
    <AppShell title="Chinchón" showBack>
      <div className="glass-card flex flex-col items-center p-8 text-center">
        <GameIcon type="chinchon" size="xl" className="mb-4 text-primary-300 icon-glow-blue" />
        <h2 className="text-xl font-bold text-text-primary mb-2">Chinchón</h2>
        <p className="text-text-muted">Próximamente...</p>
      </div>
    </AppShell>
  );
}
