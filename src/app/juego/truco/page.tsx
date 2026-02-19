"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { TrucoBoard } from "@/components/truco/TrucoBoard";
import { TrucoControls } from "@/components/truco/TrucoControls";
import { useActiveGame, useGame } from "@/hooks/useGame";
import { useTrucoScores } from "@/hooks/useTrucoScores";
import { createGame, finishGame, deleteGame } from "@/lib/db/games";
import {
  createTrucoScores,
  updateTrucoScore,
  deleteTrucoScores,
} from "@/lib/db/scores";
import { checkWinner, getTeamName } from "@/lib/game-logic/truco";
import type { TrucoConfig } from "@/lib/types/game";

interface UndoEntry {
  scoreId: string;
  previousPoints: number;
}

export default function TrucoPage() {
  const router = useRouter();
  const activeGame = useActiveGame();
  const [gameId, setGameId] = useState<string | null>(null);
  const game = useGame(gameId ?? undefined);
  const scores = useTrucoScores(gameId ?? undefined);

  // Setup state
  const [targetScore, setTargetScore] = useState<15 | 30>(15);
  const [teamName1, setTeamName1] = useState("Nosotros");
  const [teamName2, setTeamName2] = useState("Ellos");

  // UI state
  const [undoStack, setUndoStack] = useState<UndoEntry[]>([]);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const hasFinished = useRef(false);

  // Derive phase
  const config = game?.config as TrucoConfig | undefined;
  const phase =
    gameId === null
      ? "setup"
      : game?.status === "finished"
        ? "finished"
        : "playing";

  // Resume active truco game
  useEffect(() => {
    if (activeGame?.game_type === "truco" && gameId === null) {
      setGameId(activeGame.id);
    }
  }, [activeGame, gameId]);

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

  // Reset finish guard when starting new game
  useEffect(() => {
    if (phase === "setup") {
      hasFinished.current = false;
    }
  }, [phase]);

  const handleStart = useCallback(async () => {
    if (activeGame && activeGame.game_type !== "truco") return;

    const trucoConfig: TrucoConfig = {
      target_score: targetScore,
      team_names: [teamName1, teamName2],
    };

    const newGame = await createGame("truco", trucoConfig, []);
    await createTrucoScores(newGame.id);
    setUndoStack([]);
    setGameId(newGame.id);
  }, [activeGame, targetScore, teamName1, teamName2]);

  const handleAddPoint = useCallback(
    async (team: "nosotros" | "ellos") => {
      if (!scores || !config) return;
      const score = scores.find((s) => s.team === team);
      if (!score) return;

      setUndoStack((prev) => [
        ...prev,
        { scoreId: score.id, previousPoints: score.points },
      ]);
      await updateTrucoScore(score.id, score.points + 1);
    },
    [scores, config]
  );

  const handleUndo = useCallback(async () => {
    const last = undoStack[undoStack.length - 1];
    if (!last) return;

    await updateTrucoScore(last.scoreId, last.previousPoints);
    setUndoStack((prev) => prev.slice(0, -1));
  }, [undoStack]);

  const handleAbandon = useCallback(async () => {
    if (!gameId) return;
    await deleteTrucoScores(gameId);
    await deleteGame(gameId);
    setGameId(null);
    setUndoStack([]);
    setShowAbandonConfirm(false);
  }, [gameId]);

  const handlePlayAgain = useCallback(async () => {
    if (!config) return;
    setTargetScore(config.target_score as 15 | 30);
    setTeamName1(config.team_names[0]);
    setTeamName2(config.team_names[1]);
    setGameId(null);
    setUndoStack([]);
  }, [config]);

  const winner = scores && config ? checkWinner(scores, config) : null;
  const hasOtherActiveGame = activeGame && activeGame.game_type !== "truco";

  // --- SETUP ---
  if (phase === "setup") {
    return (
      <AppShell title="Truco" showBack>
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
              Puntos para ganar
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTargetScore(15)}
                className={`rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.97] ${
                  targetScore === 15
                    ? "bg-primary-500 text-white glow-blue"
                    : "bg-white/5 text-text-secondary hover:bg-white/10"
                }`}
              >
                15 puntos
              </button>
              <button
                onClick={() => setTargetScore(30)}
                className={`rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.97] ${
                  targetScore === 30
                    ? "bg-primary-500 text-white glow-blue"
                    : "bg-white/5 text-text-secondary hover:bg-white/10"
                }`}
              >
                30 puntos
              </button>
            </div>
          </div>

          <div className="glass-card p-5">
            <h2 className="text-sm font-semibold text-text-secondary mb-4">
              Nombres de equipos
            </h2>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={teamName1}
                onChange={(e) => setTeamName1(e.target.value)}
                placeholder="Nosotros"
                className="glass-input rounded-lg px-3 py-2.5 text-sm text-text-primary"
              />
              <input
                type="text"
                value={teamName2}
                onChange={(e) => setTeamName2(e.target.value)}
                placeholder="Ellos"
                className="glass-input rounded-lg px-3 py-2.5 text-sm text-text-primary"
              />
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={
              !!hasOtherActiveGame ||
              teamName1.trim() === "" ||
              teamName2.trim() === ""
            }
            className="rounded-xl bg-primary-500 py-4 text-sm font-semibold text-white hover:bg-primary-600 glow-blue-hover active:scale-[0.97] transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            Empezar
          </button>
        </div>
      </AppShell>
    );
  }

  // --- LOADING ---
  if (!scores || !config || !game) {
    return (
      <AppShell title="Truco" showBack>
        <div className="flex items-center justify-center py-12">
          <p className="text-text-muted text-sm">Cargando...</p>
        </div>
      </AppShell>
    );
  }

  const teamNames = config.team_names;
  const nosotrosPoints =
    scores.find((s) => s.team === "nosotros")?.points ?? 0;
  const ellosPoints = scores.find((s) => s.team === "ellos")?.points ?? 0;

  // --- FINISHED ---
  if (phase === "finished" && winner) {
    const winnerName = getTeamName(winner, config);

    return (
      <AppShell title="Truco" showBack>
        <div className="flex flex-col gap-4">
          <div className="glass-card border-accent-500/30 glow-gold flex flex-col items-center gap-3 p-6">
            <Trophy size={40} className="text-accent-300 icon-glow-gold" />
            <h2 className="text-xl font-bold text-accent-300">
              {winnerName}
            </h2>
            <p className="text-sm text-text-secondary">gana la partida!</p>
          </div>

          <TrucoBoard
            teamNames={teamNames}
            scores={scores}
            targetScore={config.target_score}
            winner={winner}
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
    <AppShell title="Truco" showBack>
      <div className="flex flex-col min-h-[calc(100dvh-12rem)]">
        {/* Board fills available space */}
        <div className="flex-1 flex flex-col">
          <TrucoBoard
            teamNames={teamNames}
            scores={scores}
            targetScore={config.target_score}
            winner={null}
          />
        </div>

        {/* Controls pinned to bottom */}
        <div className="flex flex-col gap-3 pt-4">
          <TrucoControls
            teamNames={teamNames}
            scores={[nosotrosPoints, ellosPoints]}
            onAddPoint={handleAddPoint}
            onUndo={handleUndo}
            canUndo={undoStack.length > 0}
            disabled={false}
          />

          <button
            onClick={() => setShowAbandonConfirm(true)}
            className="rounded-lg py-2.5 text-xs font-medium text-text-muted hover:text-text-secondary transition-colors"
          >
            Abandonar partida
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={showAbandonConfirm}
        title="Abandonar partida"
        message="Se perderá el progreso de la partida actual. ¿Estás seguro?"
        confirmLabel="Abandonar"
        variant="danger"
        onConfirm={handleAbandon}
        onCancel={() => setShowAbandonConfirm(false)}
      />
    </AppShell>
  );
}
