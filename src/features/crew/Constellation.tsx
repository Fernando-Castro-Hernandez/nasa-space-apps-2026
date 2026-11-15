// La constelación: los Lunitos de la tripulación con nombre y estado en
// palabras, nunca números (regla 4 de Lunito, SISTEMA.md §1).
import { CREW, ME, type CrewMember } from "@/data/crew";
import type { Status } from "@/domain/vitals";
import { STATUS_TOKEN } from "@/domain/status";
import { cn } from "@/lib/utils";
import ambar from "./assets/lunito-ambar.png";
import rojo from "./assets/lunito-rojo.png";
import verde from "./assets/lunito-verde.png";

const IMG: Record<Status, string> = { verde, ambar, rojo };

// Posiciones en % del contenedor, en el orden de CREW.
const POS = [
  { x: 24, y: 64 },
  { x: 72, y: 66 },
  { x: 30, y: 22 },
  { x: 76, y: 24 },
];

const at = (id: string) => POS[CREW.findIndex((c) => c.id === id)]!;
const LINKS: [string, string][] = [
  ["mei", "omar"],
  ["mei", "ana"],
  ["omar", "luis"],
];

type Props = {
  selected: string | null;
  onSelect: (id: string) => void;
  /** Par unido por el compañero del día: se dibuja con línea punteada. */
  pair: [string, string] | null;
};

export function Constellation({ selected, onSelect, pair }: Props) {
  return (
    <div className="relative h-80 w-full md:h-96">
      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {LINKS.map(([a, b]) => (
          <line
            key={a + b}
            x1={at(a).x}
            y1={at(a).y}
            x2={at(b).x}
            y2={at(b).y}
            stroke="var(--border)"
            strokeWidth={0.4}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {pair && (
          <line
            x1={at(pair[0]).x}
            y1={at(pair[0]).y}
            x2={at(pair[1]).x}
            y2={at(pair[1]).y}
            stroke="var(--status-warn)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
      {CREW.map((c, i) => (
        <Star
          key={c.id}
          member={c}
          x={POS[i]!.x}
          y={POS[i]!.y}
          active={selected === c.id}
          onClick={() => onSelect(c.id)}
        />
      ))}
    </div>
  );
}

type StarProps = {
  member: CrewMember;
  x: number;
  y: number;
  active: boolean;
  onClick: () => void;
};

function Star({ member, x, y, active, onClick }: StarProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${member.name}: ${member.mood}`}
      className={cn(
        "absolute flex w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-2xl p-2 transition-colors",
        active ? "bg-accent ring-2 ring-primary" : "hover:bg-muted",
      )}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <img src={IMG[member.status]} alt="" className="h-16 w-auto md:h-20" />
      <span className="text-sm font-semibold">
        {member.name}
        {member.id === ME && " · tú"}
      </span>
      <span
        className="text-xs font-semibold"
        style={{ color: STATUS_TOKEN[member.status] }}
      >
        {member.mood}
      </span>
    </button>
  );
}
