"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface AppShellProps {
  title: string;
  showBack?: boolean;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ title, showBack = false, headerRight, children }: AppShellProps) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <header className="sticky top-0 z-40 glass-heavy">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-white/5 hover:text-text-primary transition-colors"
              aria-label="Volver"
            >
              <ChevronLeft size={20} strokeWidth={2} />
            </button>
          )}
          <h1 className="text-lg font-bold text-text-primary flex-1">{title}</h1>
          {headerRight}
        </div>
      </header>
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-4">
        {children}
      </main>
    </div>
  );
}
