"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { Drawer } from "vaul";
import type { GameType } from "@/lib/types/game";

// --- Dice SVG ---

const DOT_POSITIONS: Record<number, [number, number][]> = {
  1: [[14, 14]],
  2: [[20, 8], [8, 20]],
  3: [[20, 8], [14, 14], [8, 20]],
  4: [[8, 8], [20, 8], [8, 20], [20, 20]],
  5: [[8, 8], [20, 8], [14, 14], [8, 20], [20, 20]],
  6: [[8, 8], [20, 8], [8, 14], [20, 14], [8, 20], [20, 20]],
};

function DiceFace({ value, size = 24 }: { value: number; size?: number }) {
  const dots = DOT_POSITIONS[value] ?? [];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      className="shrink-0"
    >
      <rect
        x="1"
        y="1"
        width="26"
        height="26"
        rx="5"
        fill="rgba(255,255,255,0.12)"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1"
      />
      {dots.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3" fill="rgba(255,255,255,0.9)" />
      ))}
    </svg>
  );
}

function DiceGroup({ dice }: { dice: number[] }) {
  return (
    <span className="flex items-center gap-1">
      {dice.map((d, i) => (
        <DiceFace key={i} value={d} size={22} />
      ))}
    </span>
  );
}

// --- Component ---

interface GameRulesSheetProps {
  gameType: GameType;
}

export function GameRulesButton({ gameType }: GameRulesSheetProps) {
  const [open, setOpen] = useState(false);
  const rules = RULES[gameType];
  if (!rules) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-white/5 hover:text-text-primary transition-colors"
        aria-label="Reglas del juego"
      >
        <Info size={20} strokeWidth={2} />
      </button>

      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-black/60" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl glass outline-none max-h-[85vh]">
            <div className="flex justify-center pt-3 pb-1">
              <Drawer.Handle className="h-1.5 w-10 rounded-full bg-white/20" />
            </div>

            <div className="overflow-y-auto px-5 pt-2 pb-4">
              <Drawer.Title className="text-lg font-bold mb-4">
                {rules.title}
              </Drawer.Title>
              <Drawer.Description className="sr-only">
                Reglas y puntajes del juego
              </Drawer.Description>

              <div className="flex flex-col gap-4">
                {rules.sections.map((section) => (
                  <div key={section.heading}>
                    <h3 className="text-sm font-semibold text-primary-300 mb-2">
                      {section.heading}
                    </h3>
                    {section.items ? (
                      <div className="flex flex-col gap-1">
                        {section.items.map((item) => (
                          <div
                            key={item.label}
                            className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {item.dice && <DiceGroup dice={item.dice} />}
                              <span className="text-sm text-text-primary">
                                {item.label}
                              </span>
                            </div>
                            <span className="text-sm font-semibold tabular-nums text-text-secondary shrink-0">
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {section.text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/5 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                onClick={() => setOpen(false)}
                className="w-full rounded-lg bg-white/5 px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-white/10 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}

// --- Rules data ---

interface RuleItem {
  label: string;
  value: string;
  dice?: number[];
}

interface RuleSection {
  heading: string;
  items?: RuleItem[];
  text?: string;
}

interface GameRules {
  title: string;
  sections: RuleSection[];
}

const RULES: Partial<Record<GameType, GameRules>> = {
  diez_mil: {
    title: "Reglas — 10.000",
    sections: [
      {
        heading: "Objetivo",
        text: "Ser el primero en llegar a 10.000 puntos acumulando puntaje en cada turno con los dados.",
      },
      {
        heading: "Puntaje de dados",
        items: [
          { label: "Cada 1", value: "100", dice: [1] },
          { label: "Cada 5", value: "50", dice: [5] },
          { label: "Tres 1s", value: "1.000", dice: [1, 1, 1] },
          { label: "Tres 2s", value: "200", dice: [2, 2, 2] },
          { label: "Tres 3s", value: "300", dice: [3, 3, 3] },
          { label: "Tres 4s", value: "400", dice: [4, 4, 4] },
          { label: "Tres 5s", value: "500", dice: [5, 5, 5] },
          { label: "Tres 6s", value: "600", dice: [6, 6, 6] },
        ],
      },
      {
        heading: "Combinaciones especiales",
        items: [
          { label: "Escalera", value: "1.500", dice: [1, 2, 3, 4, 5, 6] },
          { label: "Tres pares", value: "1.500", dice: [2, 2, 4, 4, 6, 6] },
          { label: "Cuatro iguales", value: "x2" },
          { label: "Cinco iguales", value: "x4" },
          { label: "Seis iguales", value: "x8" },
        ],
      },
      {
        heading: "Pifia",
        text: "Si en una tirada no sacas ningun dado que puntue, perdes todos los puntos del turno.",
      },
      {
        heading: "Abrir",
        text: "Si esta activado, necesitas sumar al menos 1.000 en un turno para empezar a acumular puntos.",
      },
    ],
  },
  generala: {
    title: "Reglas — Generala",
    sections: [
      {
        heading: "Objetivo",
        text: "Completar todas las categorias con la mayor cantidad de puntos posible.",
      },
      {
        heading: "Numeros (1 al 6)",
        items: [
          { label: "Unos", value: "suma", dice: [1] },
          { label: "Dos", value: "suma", dice: [2] },
          { label: "Tres", value: "suma", dice: [3] },
          { label: "Cuatros", value: "suma", dice: [4] },
          { label: "Cincos", value: "suma", dice: [5] },
          { label: "Seis", value: "suma", dice: [6] },
        ],
      },
      {
        heading: "Combinaciones",
        items: [
          { label: "Escalera", value: "20 pts", dice: [1, 2, 3, 4, 5] },
          { label: "Escalera servida", value: "25 pts", dice: [1, 2, 3, 4, 5] },
          { label: "Full", value: "30 pts", dice: [3, 3, 5, 5, 5] },
          { label: "Full servido", value: "35 pts", dice: [3, 3, 5, 5, 5] },
          { label: "Poker", value: "40 pts", dice: [4, 4, 4, 4] },
          { label: "Poker servido", value: "45 pts", dice: [4, 4, 4, 4] },
          { label: "Generala", value: "50 pts", dice: [6, 6, 6, 6, 6] },
          { label: "Generala doble", value: "100 pts", dice: [6, 6, 6, 6, 6] },
        ],
      },
      {
        heading: "Servida",
        text: "Si sacas la combinacion en la primera tirada (sin volver a tirar), vale mas puntos. La Generala servida gana la partida automaticamente.",
      },
    ],
  },
  chinchon: {
    title: "Reglas — Chinchon",
    sections: [
      {
        heading: "Objetivo",
        text: "No llegar al puntaje de eliminacion. El ultimo jugador en pie gana la partida.",
      },
      {
        heading: "Como se juega",
        text: "Se reparten 7 cartas espanolas a cada jugador. Por turnos, cada jugador roba una carta del mazo o del descarte y luego descarta una. El objetivo es formar combinaciones (escaleras del mismo palo o grupos del mismo numero) para quedarse con la menor cantidad de puntos en la mano. Cuando un jugador puede combinar todas sus cartas, corta y los demas suman los puntos de las cartas que no pudieron ligar.",
      },
      {
        heading: "Valor de las cartas",
        items: [
          { label: "1 (As)", value: "1 pt" },
          { label: "2 al 7", value: "su valor" },
          { label: "10 (Sota)", value: "10 pts" },
          { label: "11 (Caballo)", value: "10 pts" },
          { label: "12 (Rey)", value: "10 pts" },
        ],
      },
      {
        heading: "Chinchon",
        text: "7 cartas en escalera del mismo palo. Vale -10 puntos para quien lo tiene. Si la regla 'Chinchon gana' esta activada, gana la partida automaticamente.",
      },
      {
        heading: "Eliminacion",
        text: "Cuando un jugador alcanza o supera el puntaje limite (100, 150 o 200), queda eliminado y no participa en las rondas siguientes.",
      },
    ],
  },
  truco: {
    title: "Reglas — Truco",
    sections: [
      {
        heading: "Objetivo",
        text: "El primer equipo en llegar a 15 (o 30) puntos gana la partida.",
      },
      {
        heading: "Puntos por ronda",
        items: [
          { label: "Truco", value: "2 pts" },
          { label: "Retruco", value: "3 pts" },
          { label: "Vale cuatro", value: "4 pts" },
          { label: "Envido", value: "2 pts" },
          { label: "Real envido", value: "3 pts" },
          { label: "Falta envido", value: "lo que falta" },
        ],
      },
      {
        heading: "Flor",
        items: [
          { label: "Flor", value: "3 pts" },
          { label: "Contra flor", value: "6 pts" },
          { label: "Contra flor al resto", value: "lo que falta" },
        ],
      },
    ],
  },
};
