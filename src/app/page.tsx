"use client";

import { AppShell } from "@/components/layout/AppShell";
import { GameSelector } from "@/components/core/GameSelector";
import { ActiveGameBanner } from "@/components/core/ActiveGameBanner";

export default function HomePage() {
  return (
    <AppShell title="JS Score">
      <ActiveGameBanner />
      <GameSelector />
    </AppShell>
  );
}
