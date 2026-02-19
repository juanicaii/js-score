"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GameRulesButton } from "@/components/layout/GameRulesSheet";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { PlayerPicker } from "@/components/core/PlayerPicker";
import { DiezMilBoard } from "@/components/diez-mil/DiezMilBoard";
import { DiezMilTurnCard } from "@/components/diez-mil/DiezMilTurnCard";
import { DiezMilPlayerList } from "@/components/diez-mil/DiezMilPlayerList";
import { DiezMilScoreInput } from "@/components/diez-mil/DiezMilScoreInput";
import { useActiveGame, useGame } from "@/hooks/useGame";
import { usePlayers } from "@/hooks/usePlayers";
import { useDiezMilScores } from "@/hooks/useDiezMilScores";
import { createGame, finishGame, deleteGame } from "@/lib/db/games";
import {
  createDiezMilScores,
  addDiezMilTurn,
  deleteDiezMilScores,
} from "@/lib/db/scores";
import { checkWinner, isPlayerOpened } from "@/lib/game-logic/diez-mil";
import type { DiezMilConfig } from "@/lib/types/game";

export default function DiezMilPage() {
  const router = useRouter();
  const activeGame = useActiveGame();
  const allPlayers = usePlayers();
  const [gameId, setGameId] = useState<string | null>(null);
  const game = useGame(gameId ?? undefined);
  const scores = useDiezMilScores(gameId ?? undefined);

  // Setup state
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [require1000, setRequire1000] = useState(true);

  // Turn state
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [turnAdds, setTurnAdds] = useState<number[]>([]);

  // Modal state
  const [customModalOpen, setCustomModalOpen] = useState(false);

  // UI state
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const hasFinished = useRef(false);

  const config = game?.config as DiezMilConfig | undefined;

  const phase =
    gameId === null
      ? "setup"
      : game?.status === "finished"
        ? "finished"
        : "playing";

  // Resume active diez_mil game
  useEffect(() => {
    if (activeGame?.game_type === "diez_mil" && gameId === null) {
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

  // Resolve player objects
  const gamePlayers = useMemo(() => {
    if (!allPlayers || !game) return [];
    return game.player_ids
      .map((id) => allPlayers.find((p) => p.id === id))
      .filter(Boolean) as NonNullable<(typeof allPlayers)[number]>[];
  }, [allPlayers, game]);

  // Auto-recover missing scores
  const recoveredRef = useRef(false);
  useEffect(() => {
    if (!game || game.status === "finished" || recoveredRef.current) return;
    if (!scores) return;
    if (game.player_ids.length === 0) return;

    const existingPlayerIds = new Set(scores.map((s) => s.player_id));
    const missingPlayerIds = game.player_ids.filter((id) => !existingPlayerIds.has(id));
    if (missingPlayerIds.length === 0) return;

    recoveredRef.current = true;
    createDiezMilScores(game.id, missingPlayerIds);
  }, [game, scores]);

  // Auto-finish when winner detected
  useEffect(() => {
    if (!scores || !config || !game || game.status === "finished") return;
    if (hasFinished.current) return;
    const winner = checkWinner(scores, config);
    if (winner) {
      hasFinished.current = true;
      finishGame(game.id, winner);
    }
  }, [scores, config, game]);

  // Reset finish guard + turn state
  useEffect(() => {
    if (phase === "setup") {
      hasFinished.current = false;
      setCurrentPlayerIdx(0);
      setTurnAdds([]);
    }
  }, [phase]);

  const advancePlayer = useCallback(() => {
    setTurnAdds([]);
    setCurrentPlayerIdx((prev) =>
      orderedScores.length > 0 ? (prev + 1) % orderedScores.length : 0
    );
  }, [orderedScores.length]);

  const handleStart = useCallback(async () => {
    if (activeGame && activeGame.game_type !== "diez_mil") return;
    if (selectedPlayerIds.length < 2) return;

    const diezMilConfig: DiezMilConfig = {
      target_score: 10000,
      require_1000: require1000,
    };
    const newGame = await createGame("diez_mil", diezMilConfig, selectedPlayerIds);
    try {
      await createDiezMilScores(newGame.id, selectedPlayerIds);
    } catch {
      await deleteGame(newGame.id);
      return;
    }
    recoveredRef.current = false;
    setCurrentPlayerIdx(0);
    setTurnAdds([]);
    setGameId(newGame.id);
  }, [activeGame, selectedPlayerIds, require1000]);

  const handleQuickAdd = useCallback((amount: number) => {
    setTurnAdds((prev) => [...prev, amount]);
  }, []);

  const handleCustomAdd = useCallback((amount: number) => {
    setTurnAdds((prev) => [...prev, amount]);
  }, []);

  const handleUndoAdd = useCallback(() => {
    setTurnAdds((prev) => prev.slice(0, -1));
  }, []);

  const handleBank = useCallback(async () => {
    const score = orderedScores[currentPlayerIdx];
    if (!score || !config) return;

    const turnTotal = turnAdds.reduce((a, b) => a + b, 0);
    if (turnTotal <= 0) return;
    if (score.total_points + turnTotal > config.target_score) return;

    const newTotal = score.total_points + turnTotal;
    const turnNumber = score.turns.length + 1;

    await addDiezMilTurn(
      score.id,
      {
        turn_number: turnNumber,
        points_earned: turnTotal,
        combination: "",
        total_after: newTotal,
      },
      newTotal
    );
    advancePlayer();
  }, [orderedScores, currentPlayerIdx, turnAdds, advancePlayer, config]);

  const handlePifia = useCallback(async () => {
    const score = orderedScores[currentPlayerIdx];
    if (!score) return;

    const turnNumber = score.turns.length + 1;

    await addDiezMilTurn(
      score.id,
      {
        turn_number: turnNumber,
        points_earned: 0,
        combination: "",
        total_after: score.total_points,
      },
      score.total_points
    );
    advancePlayer();
  }, [orderedScores, currentPlayerIdx, advancePlayer]);

  const handleSelectPlayer = useCallback(
    (idx: number) => {
      if (idx === currentPlayerIdx) return;
      setTurnAdds([]);
      setCurrentPlayerIdx(idx);
    },
    [currentPlayerIdx]
  );

  const handleAbandon = useCallback(async () => {
    if (!gameId) return;
    await deleteDiezMilScores(gameId);
    await deleteGame(gameId);
    setGameId(null);
    setShowAbandonConfirm(false);
  }, [gameId]);

  const handlePlayAgain = useCallback(() => {
    if (!game) return;
    setSelectedPlayerIds(game.player_ids);
    if (config) setRequire1000(config.require_1000);
    setGameId(null);
  }, [game, config]);

  const hasOtherActiveGame = activeGame && activeGame.game_type !== "diez_mil";

  // --- SETUP ---
  if (phase === "setup") {
    return (
      <AppShell title="10.000" showBack headerRight={<GameRulesButton gameType="diez_mil" />}>
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

          <div className="glass-card p-5">
            <h2 className="text-sm font-semibold text-text-secondary mb-3">
              Reglas
            </h2>
            <button
              onClick={() => setRequire1000((v) => !v)}
              className="flex w-full items-center justify-between rounded-xl bg-white/5 px-4 py-3 transition-colors hover:bg-white/10"
            >
              <span className="text-sm text-text-primary">
                Sacar 1.000 para abrir
              </span>
              <span
                className={`flex h-6 w-11 items-center rounded-full transition-colors ${
                  require1000 ? "bg-primary-500" : "bg-white/10"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                    require1000 ? "translate-x-[1.375rem]" : "translate-x-0.5"
                  }`}
                />
              </span>
            </button>
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
  if (!scores || scores.length === 0 || !game || !config || gamePlayers.length === 0) {
    return (
      <AppShell title="10.000" showBack headerRight={<GameRulesButton gameType="diez_mil" />}>
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
    const winnerScore = winnerId
      ? orderedScores.find((s) => s.player_id === winnerId)
      : null;

    return (
      <AppShell title="10.000" showBack headerRight={<GameRulesButton gameType="diez_mil" />}>
        <div className="flex flex-col gap-4">
          <div className="glass-card border-accent-500/30 glow-gold flex flex-col items-center gap-3 p-6">
            <Trophy size={40} className="text-accent-300 icon-glow-gold" />
            <h2 className="text-xl font-bold text-accent-300">
              {winnerPlayer?.name ?? "—"}
            </h2>
            <p className="text-sm text-text-secondary">
              {winnerScore
                ? `${winnerScore.total_points.toLocaleString("es-AR")} puntos`
                : "gana la partida!"}
            </p>
          </div>

          <DiezMilBoard
            scores={orderedScores}
            players={gamePlayers}
            config={config}
            onPlayerTap={() => {}}
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
  const currentScore = orderedScores[currentPlayerIdx];
  const currentPlayer = currentScore
    ? gamePlayers.find((p) => p.id === currentScore.player_id)
    : undefined;

  return (
    <AppShell title="10.000" showBack headerRight={<GameRulesButton gameType="diez_mil" />}>
      <div className="flex flex-col gap-4">
        {currentScore && (
          <DiezMilTurnCard
            playerName={currentPlayer?.name ?? "—"}
            totalPoints={currentScore.total_points}
            targetScore={config.target_score}
            isOpened={isPlayerOpened(currentScore)}
            requiresOpen={config.require_1000}
            turnAdds={turnAdds}
            onQuickAdd={handleQuickAdd}
            onCustom={() => setCustomModalOpen(true)}
            onBank={handleBank}
            onPifia={handlePifia}
            onUndoAdd={handleUndoAdd}
          />
        )}

        <DiezMilPlayerList
          scores={orderedScores}
          players={gamePlayers}
          config={config}
          currentPlayerIdx={currentPlayerIdx}
          onSelectPlayer={handleSelectPlayer}
        />

        <button
          onClick={() => setShowAbandonConfirm(true)}
          className="rounded-lg py-2.5 text-xs font-medium text-text-muted hover:text-text-secondary transition-colors"
        >
          Abandonar partida
        </button>
      </div>

      <DiezMilScoreInput
        open={customModalOpen}
        onConfirm={handleCustomAdd}
        onClose={() => setCustomModalOpen(false)}
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
