"use client";

import Link from "next/link";
import { useState } from "react";
import { useActiveGame } from "@/hooks/useGame";
import { GAMES } from "@/lib/types";
import { gameTypeToSlug } from "@/lib/utils/slugs";
import { deleteGame } from "@/lib/db/games";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { GameIcon } from "@/components/icons/GameIcon";

export function ActiveGameBanner() {
  const activeGame = useActiveGame();
  const [showConfirm, setShowConfirm] = useState(false);

  if (!activeGame) return null;

  const gameInfo = GAMES.find((g) => g.type === activeGame.game_type);
  if (!gameInfo) return null;

  const slug = gameTypeToSlug(activeGame.game_type);

  return (
    <>
      <div className="mb-4 rounded-xl glass border-accent-500/20 glow-gold p-4">
        <div className="mb-3 flex items-center gap-2">
          <GameIcon type={activeGame.game_type} size="sm" className="text-accent-300 icon-glow-gold" />
          <div>
            <p className="text-sm font-semibold text-accent-300">
              Partida en curso
            </p>
            <p className="text-xs text-text-secondary">{gameInfo.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/juego/${slug}`}
            className="flex-1 rounded-lg bg-primary-500 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-600 glow-blue-hover transition-colors"
          >
            Continuar
          </Link>
          <button
            onClick={() => setShowConfirm(true)}
            className="rounded-lg bg-white/5 px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-white/10 transition-colors"
          >
            Abandonar
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Abandonar partida"
        message="Se perderá el progreso de la partida actual. ¿Estás seguro?"
        confirmLabel="Abandonar"
        variant="danger"
        onConfirm={async () => {
          await deleteGame(activeGame.id);
          setShowConfirm(false);
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
