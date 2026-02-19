"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GameRulesButton } from "@/components/layout/GameRulesSheet";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { PlayerPicker } from "@/components/core/PlayerPicker";
import { ChinchonBoard } from "@/components/chinchon/ChinchonBoard";
import { ChinchonRoundInput } from "@/components/chinchon/ChinchonRoundInput";
import { useActiveGame, useGame } from "@/hooks/useGame";
import { usePlayers } from "@/hooks/usePlayers";
import { useChinchonScores } from "@/hooks/useChinchonScores";
import { createGame, finishGame, deleteGame } from "@/lib/db/games";
import {
  createChinchonScores,
  addChinchonRound,
  undoLastChinchonRound,
  deleteChinchonScores,
} from "@/lib/db/scores";
import { checkGameEnd } from "@/lib/game-logic/chinchon";
import type { ChinchonConfig } from "@/lib/types/game";

const ELIMINATION_OPTIONS = [100, 150, 200];

export default function ChinchonPage() {
  const router = useRouter();
  const activeGame = useActiveGame();
  const allPlayers = usePlayers();
  const [gameId, setGameId] = useState<string | null>(null);
  const game = useGame(gameId ?? undefined);
  const scores = useChinchonScores(gameId ?? undefined);

  // Setup state
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [eliminationScore, setEliminationScore] = useState(100);
  const [chinchonWins, setChinchonWins] = useState(false);

  // Modal state
  const [roundInputOpen, setRoundInputOpen] = useState(false);

  // UI state
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const hasFinished = useRef(false);

  const config = game?.config as ChinchonConfig | undefined;

  const phase =
    gameId === null
      ? "setup"
      : game?.status === "finished"
        ? "finished"
        : "playing";

  // Resume active chinchon game
  useEffect(() => {
    if (activeGame?.game_type === "chinchon" && gameId === null) {
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
    createChinchonScores(game.id, missingPlayerIds);
  }, [game, scores]);

  // Auto-finish when 1 player remains active
  useEffect(() => {
    if (!scores || !game || game.status === "finished") return;
    if (hasFinished.current) return;
    if (scores.length === 0) return;

    const result = checkGameEnd(scores);
    if (result) {
      hasFinished.current = true;
      finishGame(game.id, result.winnerId);
    }
  }, [scores, game]);

  // Reset finish guard when going back to setup
  useEffect(() => {
    if (phase === "setup") {
      hasFinished.current = false;
    }
  }, [phase]);

  const handleStart = useCallback(async () => {
    if (activeGame && activeGame.game_type !== "chinchon") return;
    if (selectedPlayerIds.length < 2) return;

    const chinchonConfig: ChinchonConfig = {
      elimination_score: eliminationScore,
      chinchon_wins: chinchonWins,
    };
    const newGame = await createGame("chinchon", chinchonConfig, selectedPlayerIds);
    try {
      await createChinchonScores(newGame.id, selectedPlayerIds);
    } catch {
      await deleteGame(newGame.id);
      return;
    }
    recoveredRef.current = false;
    setGameId(newGame.id);
  }, [activeGame, selectedPlayerIds, eliminationScore, chinchonWins]);

  const handleRoundConfirm = useCallback(
    async (entries: { id: string; points: number }[]) => {
      if (!config || !scores) return;

      const roundNumber =
        Math.max(0, ...scores.map((s) => s.rounds.length)) + 1;

      const updates = entries.map((e) => {
        const score = scores.find((s) => s.id === e.id);
        const newTotal = (score?.total_points ?? 0) + e.points;
        const isEliminated = newTotal >= config.elimination_score;
        return {
          id: e.id,
          round: { round_number: roundNumber, points: e.points },
          newTotal,
          isEliminated,
        };
      });

      await addChinchonRound(updates);
    },
    [config, scores]
  );

  const handleChinchonWin = useCallback(
    async (playerId: string) => {
      if (!game) return;
      hasFinished.current = true;
      await finishGame(game.id, playerId);
    },
    [game]
  );

  const handleUndo = useCallback(async () => {
    if (!gameId) return;
    await undoLastChinchonRound(gameId);
  }, [gameId]);

  const handleAbandon = useCallback(async () => {
    if (!gameId) return;
    await deleteChinchonScores(gameId);
    await deleteGame(gameId);
    setGameId(null);
    setShowAbandonConfirm(false);
  }, [gameId]);

  const handlePlayAgain = useCallback(() => {
    if (!game || !config) return;
    setSelectedPlayerIds(game.player_ids);
    setEliminationScore(config.elimination_score);
    setChinchonWins(config.chinchon_wins);
    setGameId(null);
  }, [game, config]);

  const hasOtherActiveGame = activeGame && activeGame.game_type !== "chinchon";
  const hasRounds =
    orderedScores.length > 0 &&
    orderedScores.some((s) => s.rounds.length > 0);

  // --- SETUP ---
  if (phase === "setup") {
    return (
      <AppShell title="Chinchon" showBack headerRight={<GameRulesButton gameType="chinchon" />}>
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
              Jugadores (2-8)
            </h2>
            <PlayerPicker
              selectedIds={selectedPlayerIds}
              maxPlayers={8}
              onSelect={setSelectedPlayerIds}
            />
          </div>

          <div className="glass-card p-5">
            <h2 className="text-sm font-semibold text-text-secondary mb-3">
              Puntaje de eliminacion
            </h2>
            <div className="flex gap-2">
              {ELIMINATION_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setEliminationScore(opt)}
                  className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all active:scale-95 ${
                    eliminationScore === opt
                      ? "bg-primary-500 text-white glow-blue"
                      : "bg-white/5 text-text-secondary hover:bg-white/10"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <h2 className="text-sm font-semibold text-text-secondary mb-3">
              Reglas
            </h2>
            <button
              onClick={() => setChinchonWins((v) => !v)}
              className="flex w-full items-center justify-between rounded-xl bg-white/5 px-4 py-3 transition-colors hover:bg-white/10"
            >
              <span className="text-sm text-text-primary">
                Chinchon gana la partida
              </span>
              <span
                className={`flex h-6 w-11 items-center rounded-full transition-colors ${
                  chinchonWins ? "bg-primary-500" : "bg-white/10"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                    chinchonWins ? "translate-x-[1.375rem]" : "translate-x-0.5"
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
      <AppShell title="Chinchon" showBack headerRight={<GameRulesButton gameType="chinchon" />}>
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

    return (
      <AppShell title="Chinchon" showBack headerRight={<GameRulesButton gameType="chinchon" />}>
        <div className="flex flex-col gap-4">
          <div className="glass-card border-accent-500/30 glow-gold flex flex-col items-center gap-3 p-6">
            <Trophy size={40} className="text-accent-300 icon-glow-gold" />
            <h2 className="text-xl font-bold text-accent-300">
              {winnerPlayer?.name ?? "—"}
            </h2>
            <p className="text-sm text-text-secondary">
              gana la partida!
            </p>
          </div>

          <ChinchonBoard scores={orderedScores} players={gamePlayers} />

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
    <AppShell title="Chinchon" showBack headerRight={<GameRulesButton gameType="chinchon" />}>
      <div className="flex flex-col gap-4">
        <ChinchonBoard scores={orderedScores} players={gamePlayers} />

        <button
          onClick={() => setRoundInputOpen(true)}
          className="rounded-xl bg-primary-500 py-4 text-sm font-semibold text-white hover:bg-primary-600 glow-blue-hover active:scale-[0.97] transition-all"
        >
          Anotar ronda
        </button>

        {hasRounds && (
          <button
            onClick={handleUndo}
            className="rounded-lg bg-white/5 px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-white/10 active:scale-[0.97] transition-all"
          >
            Deshacer ultima ronda
          </button>
        )}

        <button
          onClick={() => setShowAbandonConfirm(true)}
          className="rounded-lg py-2.5 text-xs font-medium text-text-muted hover:text-text-secondary transition-colors"
        >
          Abandonar partida
        </button>
      </div>

      <ChinchonRoundInput
        open={roundInputOpen}
        scores={orderedScores}
        players={gamePlayers}
        chinchonWins={config.chinchon_wins}
        onConfirm={handleRoundConfirm}
        onChinchonWin={handleChinchonWin}
        onClose={() => setRoundInputOpen(false)}
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
