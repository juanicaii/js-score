"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ClipboardList } from "lucide-react";

export default function HistorialPage() {
  return (
    <AppShell title="Historial">
      <div className="glass-card flex flex-col items-center p-8 text-center">
        <ClipboardList size={40} strokeWidth={1.75} className="mb-4 text-primary-300 icon-glow-blue" />
        <h2 className="text-xl font-bold text-text-primary mb-2">Historial de partidas</h2>
        <p className="text-text-muted">Próximamente...</p>
      </div>
    </AppShell>
  );
}
