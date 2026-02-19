"use client";

import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <WifiOff size={40} strokeWidth={1.75} className="mb-4 text-text-muted" />
      <h1 className="text-2xl font-bold text-text-primary mb-2">Sin conexión</h1>
      <p className="text-text-muted mb-6">
        No hay conexión a internet. Reconectate para seguir usando la app.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="rounded-xl bg-primary-500 px-6 py-3 font-medium text-white hover:bg-primary-600 glow-blue-hover transition-colors"
      >
        Reintentar
      </button>
    </div>
  );
}
