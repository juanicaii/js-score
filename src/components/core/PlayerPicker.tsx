"use client";

import { useState } from "react";
import { Search, GripVertical, X, Plus } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { usePlayers } from "@/hooks/usePlayers";
import { createPlayer } from "@/lib/db/players";
import { playerNameSchema } from "@/lib/validations/player";
import type { Player } from "@/lib/types/player";

interface PlayerPickerProps {
  selectedIds: string[];
  maxPlayers?: number;
  onSelect: (ids: string[]) => void;
}

function SortablePlayer({
  player,
  index,
  onRemove,
}: {
  player: Player;
  index: number;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: player.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-1 rounded-lg bg-primary-500/10 px-2 py-2 ${
        isDragging ? "z-50 shadow-lg shadow-primary-500/20 opacity-90" : ""
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="touch-none rounded p-1 text-text-muted hover:text-text-primary transition-colors cursor-grab active:cursor-grabbing"
        aria-label="Arrastrar para reordenar"
      >
        <GripVertical size={16} />
      </button>
      <span className="w-5 text-center text-xs font-bold text-primary-400 tabular-nums">
        {index + 1}
      </span>
      <span className="flex-1 text-sm font-medium text-text-primary truncate">
        {player.name}
      </span>
      <button
        onClick={() => onRemove(player.id)}
        className="rounded p-1 text-text-muted hover:text-danger-400 transition-colors"
        aria-label="Quitar"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function PlayerPicker({
  selectedIds,
  maxPlayers,
  onSelect,
}: PlayerPickerProps) {
  const players = usePlayers();
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    })
  );

  if (players === undefined) {
    return <div className="text-sm text-text-muted">Cargando jugadores...</div>;
  }

  const selectedPlayers = selectedIds
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean) as Player[];

  const query = search.trim().toLowerCase();
  const availablePlayers = players.filter(
    (p) =>
      !selectedIds.includes(p.id) &&
      (query === "" || p.name.toLowerCase().includes(query))
  );

  const exactMatch = players.some((p) => p.name.toLowerCase() === query);
  const canCreate = query.length > 0 && !exactMatch;

  const handleAdd = (id: string) => {
    if (maxPlayers && selectedIds.length >= maxPlayers) return;
    onSelect([...selectedIds, id]);
    setSearch("");
  };

  const handleRemove = (id: string) => {
    onSelect(selectedIds.filter((pid) => pid !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = selectedIds.indexOf(String(active.id));
    const newIndex = selectedIds.indexOf(String(over.id));
    onSelect(arrayMove(selectedIds, oldIndex, newIndex));
  };

  const handleCreate = async () => {
    const result = playerNameSchema.safeParse(search);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError("");
    const player = await createPlayer(result.data);
    setSearch("");
    if (!maxPlayers || selectedIds.length < maxPlayers) {
      onSelect([...selectedIds, player.id]);
    }
  };

  const atLimit = !!maxPlayers && selectedIds.length >= maxPlayers;

  return (
    <div className="space-y-3">
      {/* Selected players — drag to reorder */}
      {selectedPlayers.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={selectedIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {selectedPlayers.map((player, i) => (
                <SortablePlayer
                  key={player.id}
                  player={player}
                  index={i}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Search input */}
      {!atLimit && (
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (availablePlayers.length === 1) {
                  handleAdd(availablePlayers[0].id);
                } else if (canCreate) {
                  handleCreate();
                }
              }
            }}
            placeholder="Buscar o crear jugador..."
            className="glass-input w-full pl-9 pr-3"
          />
        </div>
      )}

      {error && <p className="text-xs text-danger-400">{error}</p>}

      {/* Available players list (filtered) */}
      {!atLimit && (search !== "" || selectedIds.length === 0) && (
        <div className="max-h-44 overflow-y-auto space-y-0.5">
          {availablePlayers.map((player) => (
            <button
              key={player.id}
              onClick={() => handleAdd(player.id)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-white/5 active:scale-[0.98] transition-all"
            >
              <Plus size={14} className="text-text-muted shrink-0" />
              <span className="text-sm text-text-primary">{player.name}</span>
            </button>
          ))}

          {canCreate && (
            <button
              onClick={handleCreate}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-primary-500/10 active:scale-[0.98] transition-all"
            >
              <Plus size={14} className="text-primary-400 shrink-0" />
              <span className="text-sm text-primary-300">
                Crear &quot;{search.trim()}&quot;
              </span>
            </button>
          )}

          {availablePlayers.length === 0 && !canCreate && query !== "" && (
            <p className="px-3 py-2 text-xs text-text-muted">
              No se encontraron jugadores
            </p>
          )}
        </div>
      )}
    </div>
  );
}
