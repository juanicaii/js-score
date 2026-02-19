"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { usePlayers } from "@/hooks/usePlayers";
import {
  createPlayer,
  updatePlayer,
  deletePlayer,
} from "@/lib/db/players";
import { playerNameSchema } from "@/lib/validations/player";
import { Users, Pencil, Trash2 } from "lucide-react";

export default function JugadoresPage() {
  const players = usePlayers();

  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editError, setEditError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleAdd = async () => {
    const result = playerNameSchema.safeParse(newName);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError("");
    await createPlayer(result.data);
    setNewName("");
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
    setEditError("");
  };

  const handleEdit = async () => {
    if (!editingId) return;
    const result = playerNameSchema.safeParse(editName);
    if (!result.success) {
      setEditError(result.error.issues[0].message);
      return;
    }
    await updatePlayer(editingId, { name: result.data });
    setEditingId(null);
    setEditError("");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deletePlayer(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <AppShell title="Jugadores">
      {/* Add form */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Nombre del jugador..."
            className="glass-input flex-1 py-2.5"
          />
          <button
            onClick={handleAdd}
            className="rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-600 glow-blue-hover transition-colors"
          >
            Agregar
          </button>
        </div>
        {error && <p className="mt-1.5 text-xs text-danger-400">{error}</p>}
      </div>

      {/* Player list */}
      {players === undefined ? (
        <p className="text-sm text-text-muted">Cargando...</p>
      ) : players.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <Users size={40} strokeWidth={1.75} className="mb-3 text-text-muted" />
          <p className="text-text-secondary">No hay jugadores todavía</p>
          <p className="text-sm text-text-muted mt-1">
            Agregá jugadores para empezar a jugar
          </p>
        </div>
      ) : (
        <ul className="space-y-1">
          {players.map((player) => (
            <li
              key={player.id}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors"
            >
              {editingId === player.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEdit();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    autoFocus
                    className="glass-input flex-1 border-primary-400/50"
                  />
                  <button
                    onClick={handleEdit}
                    className="rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-600 glow-blue-hover transition-colors"
                  >
                    OK
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-white/10 transition-colors"
                  >
                    X
                  </button>
                  {editError && (
                    <p className="text-xs text-danger-400">{editError}</p>
                  )}
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-text-primary">{player.name}</span>
                  <button
                    onClick={() => startEdit(player.id, player.name)}
                    className="rounded-lg p-2 text-text-muted hover:bg-white/5 hover:text-text-primary transition-colors"
                    aria-label="Editar"
                  >
                    <Pencil size={16} strokeWidth={2} />
                  </button>
                  <button
                    onClick={() =>
                      setDeleteTarget({ id: player.id, name: player.name })
                    }
                    className="rounded-lg p-2 text-text-muted hover:bg-danger-500/10 hover:text-danger-400 transition-colors"
                    aria-label="Eliminar"
                  >
                    <Trash2 size={16} strokeWidth={2} />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar jugador"
        message={`¿Eliminar a "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppShell>
  );
}
