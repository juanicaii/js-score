"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Trophy } from "lucide-react";

export default function ResultadoPage() {
  return (
    <AppShell title="Resultado" showBack>
      <div className="glass-card flex flex-col items-center p-8 text-center">
        <Trophy size={40} strokeWidth={1.75} className="mb-4 text-accent-300 icon-glow-gold" />
        <h2 className="text-xl font-bold text-text-primary mb-2">Resultado</h2>
        <p className="text-text-muted">Próximamente...</p>
      </div>
    </AppShell>
  );
}
