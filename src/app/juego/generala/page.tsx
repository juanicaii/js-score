"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { PlayerPicker } from "@/components/core/PlayerPicker";
import { GeneralaBoard } from "@/components/generala/GeneralaBoard";
import { GeneralaScoreInput } from "@/components/generala/GeneralaScoreInput";
import { useActiveGame, useGame } from "@/hooks/useGame";
import { usePlayers } from "@/hooks/usePlayers";
import { useGeneralaScores } from "@/hooks/useGeneralaScores";
import { createGame, finishGame, deleteGame } from "@/lib/db/games";
import {
  createGeneralaScores,
  updateGeneralaScore,
  deleteGeneralaScores,
} from "@/lib/db/scores";
import {
  CATEGORIES,
  allPlayersComplete,
  checkGameEnd,
} from "@/lib/game-logic/generala";
import type { GeneralaCategory, CategoryDefinition } from "@/lib/game-logic/generala";
import type { GeneralaConfig } from "@/lib/types/game";

export default function GeneralaPage() {
  const router = useRouter();
  const activeGame = useActiveGame();
  const allPlayers = usePlayers();
  const [gameId, setGameId] = useState<string | null>(null);
  const game = useGame(gameId ?? undefined);
  const scores = useGeneralaScores(gameId ?? undefined);

  // Setup state
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalScoreId, setModalScoreId] = useState<string | null>(null);
  const [modalCategory, setModalCategory] = useState<CategoryDefinition | null>(null);
  const [modalCurrentValue, setModalCurrentValue] = useState<number | null>(null);
  const [modalPlayerName, setModalPlayerName] = useState("");

  // UI state
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const hasFinished = useRef(false);

  // Derive phase
  const phase =
    gameId === null
      ? "setup"
      : game?.status === "finished"
        ? "finished"
        : "playing";

  // Resume active generala game
  useEffect(() => {
    if (activeGame?.game_type === "generala" && gameId === null) {
      setGameId(activeGame.id);
    }
  }, [activeGame, gameId]);

  // Order scores by player_ids order from game
  const orderedScores = useMemo(() => {
    if (!scores || !game) return [];
    const orderMap = new Map(game.player_ids.map((id, i) => [id, i]));
    return [...scores].sort(
      (a, b) => (orderMap.get(a.player_id) ?? 0) - (orderMap.get(b.player_id) ?? 0)
    );
  }, [scores, game]);

  // Resolve player objects for the game
  const gamePlayers = useMemo(() => {
    if (!allPlayers || !game) return [];
    return game.player_ids
      .map((id) => allPlayers.find((p) => p.id === id))
      .filter(Boolean) as NonNullable<(typeof allPlayers)[number]>[];
  }, [allPlayers, game]);

  // Auto-recover: if game exists but scores are missing, create them
  const recoveredRef = useRef(false);
  useEffect(() => {
    if (!game || game.status === "finished" || recoveredRef.current) return;
    if (!scores || scores.length > 0) return;
    if (game.player_ids.length === 0) return;

    recoveredRef.current = true;
    createGeneralaScores(game.id, game.player_ids);
  }, [game, scores]);

  // Auto-finish when all categories filled
  useEffect(() => {
    if (!scores || !game || game.status === "finished") return;
    if (hasFinished.current) return;
    if (!allPlayersComplete(scores)) return;

    const result = checkGameEnd(scores);
    if (result) {
      hasFinished.current = true;
      finishGame(game.id, result.winnerId || undefined);
    }
  }, [scores, game]);

  // Reset finish guard when going back to setup
  useEffect(() => {
    if (phase === "setup") {
      hasFinished.current = false;
    }
  }, [phase]);

  const handleStart = useCallback(async () => {
    if (activeGame && activeGame.game_type !== "generala") return;
    if (selectedPlayerIds.length < 2) return;

    const config: GeneralaConfig = { max_players: 6 };
    const newGame = await createGame("generala", config, selectedPlayerIds);
    try {
      await createGeneralaScores(newGame.id, selectedPlayerIds);
    } catch {
      await deleteGame(newGame.id);
      return;
    }
    recoveredRef.current = false;
    setGameId(newGame.id);
  }, [activeGame, selectedPlayerIds]);

  const handleCellTap = useCallback(
    (scoreId: string, category: GeneralaCategory, currentValue: number | null) => {
      const catDef = CATEGORIES.find((c) => c.key === category);
      if (!catDef) return;

      // Find player name for modal title
      const score = orderedScores.find((s) => s.id === scoreId);
      const player = score
        ? gamePlayers.find((p) => p.id === score.player_id)
        : undefined;

      setModalScoreId(scoreId);
      setModalCategory(catDef);
      setModalCurrentValue(currentValue);
      setModalPlayerName(player?.name ?? "");
      setModalOpen(true);
    },
    [orderedScores, gamePlayers]
  );

  const handleScoreSelect = useCallback(
    async (value: number) => {
      if (!modalScoreId || !modalCategory) return;
      // -1 is sentinel for "clear to null"
      const actualValue = value === -1 ? null : value;
      await updateGeneralaScore(modalScoreId, modalCategory.key, actualValue);
    },
    [modalScoreId, modalCategory]
  );

  const handleServidaWin = useCallback(async () => {
    if (!modalScoreId || !modalCategory || !game) return;

    // Find which player scored the servida
    const score = orderedScores.find((s) => s.id === modalScoreId);
    if (!score) return;

    // Set the score value
    await updateGeneralaScore(modalScoreId, modalCategory.key, modalCategory.normalScore!);

    // Finish game immediately — servida wins
    hasFinished.current = true;
    await finishGame(game.id, score.player_id);
  }, [modalScoreId, modalCategory, game, orderedScores]);

  const handleAbandon = useCallback(async () => {
    if (!gameId) return;
    await deleteGeneralaScores(gameId);
    await deleteGame(gameId);
    setGameId(null);
    setShowAbandonConfirm(false);
  }, [gameId]);

  const handlePlayAgain = useCallback(() => {
    if (!game) return;
    setSelectedPlayerIds(game.player_ids);
    setGameId(null);
  }, [game]);

  const hasOtherActiveGame = activeGame && activeGame.game_type !== "generala";

  // --- SETUP ---
  if (phase === "setup") {
    return (
      <AppShell title="Generala" showBack>
        <div className="flex flex-col gap-4">
          {hasOtherActiveGame && (
            <div className="glass-card border-accent-500/20 p-4 text-center">
              <p className="text-sm text-accent-300">
                Ya hay una partida en curso de otro juego.
              </p>
              <p className="text-xs text-text-muted mt-1">
                Terminala o abandonala antes de empezar una nueva.
              </p>
            </div>
          )}

          <div className="glass-card p-5">
            <h2 className="text-sm font-semibold text-text-secondary mb-4">
              Jugadores (2-6)
            </h2>
            <PlayerPicker
              selectedIds={selectedPlayerIds}
              maxPlayers={6}
              onSelect={setSelectedPlayerIds}
            />
          </div>

          <button
            onClick={handleStart}
            disabled={!!hasOtherActiveGame || selectedPlayerIds.length < 2}
            className="rounded-xl bg-primary-500 py-4 text-sm font-semibold text-white hover:bg-primary-600 glow-blue-hover active:scale-[0.97] transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            Empezar
          </button>
        </div>
      </AppShell>
    );
  }

  // --- LOADING ---
  if (!scores || scores.length === 0 || !game || gamePlayers.length === 0) {
    return (
      <AppShell title="Generala" showBack>
        <div className="flex items-center justify-center py-12">
          <p className="text-text-muted text-sm">Cargando...</p>
        </div>
      </AppShell>
    );
  }

  // --- FINISHED ---
  if (phase === "finished") {
    const winnerId = game.winner_id;
    const winnerPlayer = winnerId
      ? gamePlayers.find((p) => p.id === winnerId)
      : null;
    const isTie = !winnerId;

    return (
      <AppShell title="Generala" showBack>
        <div className="flex flex-col gap-4">
          <div className="glass-card border-accent-500/30 glow-gold flex flex-col items-center gap-3 p-6">
            <Trophy size={40} className="text-accent-300 icon-glow-gold" />
            <h2 className="text-xl font-bold text-accent-300">
              {isTie ? "Empate" : winnerPlayer?.name ?? "—"}
            </h2>
            <p className="text-sm text-text-secondary">
              {isTie ? "No hay ganador" : "gana la partida!"}
            </p>
          </div>

          <GeneralaBoard
            scores={orderedScores}
            players={gamePlayers}
            onCellTap={() => {}}
            disabled
          />

          <div className="flex flex-col gap-3">
            <button
              onClick={handlePlayAgain}
              className="rounded-xl bg-primary-500 py-4 text-sm font-semibold text-white hover:bg-primary-600 glow-blue-hover active:scale-[0.97] transition-all"
            >
              Volver a jugar
            </button>
            <button
              onClick={() => router.push("/")}
              className="rounded-lg bg-white/5 px-4 py-3 text-sm font-medium text-text-secondary hover:bg-white/10 active:scale-[0.97] transition-all"
            >
              Ir al inicio
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  // --- PLAYING ---
  return (
    <AppShell title="Generala" showBack>
      <div className="flex flex-col gap-4">
        <GeneralaBoard
          scores={orderedScores}
          players={gamePlayers}
          onCellTap={handleCellTap}
          disabled={false}
        />

        <button
          onClick={() => setShowAbandonConfirm(true)}
          className="rounded-lg py-2.5 text-xs font-medium text-text-muted hover:text-text-secondary transition-colors"
        >
          Abandonar partida
        </button>
      </div>

      <GeneralaScoreInput
        open={modalOpen}
        playerName={modalPlayerName}
        category={modalCategory}
        currentValue={modalCurrentValue}
        onSelect={handleScoreSelect}
        onServidaWin={handleServidaWin}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmDialog
        open={showAbandonConfirm}
        title="Abandonar partida"
        message="Se perdera el progreso de la partida actual. Estas seguro?"
        confirmLabel="Abandonar"
        variant="danger"
        onConfirm={handleAbandon}
        onCancel={() => setShowAbandonConfirm(false)}
      />
    </AppShell>
  );
}
