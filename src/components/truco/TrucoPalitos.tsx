import { getBuenasMalas } from "@/lib/game-logic/truco";

interface TrucoPalitosProps {
  points: number;
  targetScore: number;
}

/**
 * Square + diagonal pattern (like fósforos/matches):
 * 1: left vertical  |
 * 2: top horizontal  ─
 * 3: right vertical    |
 * 4: bottom horizontal ─  (now a square)
 * 5: diagonal /
 */
function PalitoGroup({ count }: { count: number }) {
  const size = 44;
  const pad = 4;
  const sw = 3;

  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [
    { x1: pad, y1: pad, x2: pad, y2: size - pad },
    { x1: pad, y1: pad, x2: size - pad, y2: pad },
    { x1: size - pad, y1: pad, x2: size - pad, y2: size - pad },
    { x1: pad, y1: size - pad, x2: size - pad, y2: size - pad },
    { x1: pad, y1: size - pad, x2: size - pad, y2: pad },
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      className="shrink-0"
    >
      {lines.slice(0, count).map((line, i) => (
        <line
          key={i}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="currentColor"
          strokeWidth={sw}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

function PalitosRow({ points }: { points: number }) {
  if (points === 0) return null;

  const fullGroups = Math.floor(points / 5);
  const remainder = points % 5;

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {Array.from({ length: fullGroups }, (_, i) => (
        <PalitoGroup key={`full-${i}`} count={5} />
      ))}
      {remainder > 0 && <PalitoGroup key="remainder" count={remainder} />}
    </div>
  );
}

function SectionLabel({
  label,
  points,
  active,
}: {
  label: string;
  points: number;
  active: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={`text-[11px] font-semibold uppercase tracking-wider ${
          active ? "text-text-secondary" : "text-text-muted/50"
        }`}
      >
        {label}
      </span>
      <span
        className={`text-[11px] tabular-nums ${
          active ? "text-text-muted" : "text-text-muted/40"
        }`}
      >
        {points} / 15
      </span>
    </div>
  );
}

export function TrucoPalitos({ points, targetScore }: TrucoPalitosProps) {
  if (targetScore === 30) {
    const { malas, buenas, inBuenas } = getBuenasMalas(points);

    return (
      <div className="flex flex-col gap-3 w-full">
        <div className={inBuenas ? "opacity-40" : ""}>
          <SectionLabel label="Malas" points={malas} active={!inBuenas} />
          <div className="mt-1 min-h-[44px]">
            <PalitosRow points={malas} />
          </div>
        </div>
        <div className="border-t border-white/5" />
        <div className={!inBuenas ? "opacity-40" : ""}>
          <SectionLabel label="Buenas" points={buenas} active={inBuenas} />
          <div className="mt-1 min-h-[44px]">
            <PalitosRow points={buenas} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-end">
        <span className="text-[11px] tabular-nums text-text-muted">
          {points} / {targetScore}
        </span>
      </div>
      <div className="min-h-[44px]">
        <PalitosRow points={points} />
      </div>
    </div>
  );
}
