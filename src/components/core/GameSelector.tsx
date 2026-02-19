"use client";

import Link from "next/link";
import { GAMES } from "@/lib/types";
import { GameIcon } from "@/components/icons/GameIcon";

export function GameSelector() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {GAMES.map((game) => (
        <Link
          key={game.type}
          href={`/juego/${game.slug}`}
          className="glass-card flex flex-col items-center gap-2 p-5 text-center active:scale-[0.97]"
        >
          <GameIcon type={game.type} size="xl" className="text-primary-300 icon-glow-blue" />
          <span className="text-sm font-semibold text-text-primary">{game.name}</span>
          <span className="text-xs text-text-muted">{game.description}</span>
        </Link>
      ))}
    </div>
  );
}
