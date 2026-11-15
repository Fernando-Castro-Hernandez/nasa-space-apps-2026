// La constelación: los Lunitos de la tripulación con nombre y estado en
// palabras, nunca números (regla 4 de Lunito, SISTEMA.md §1).
import { CREW, type CrewMember } from "@/data/crew";
import { STATUS_TOKEN } from "@/domain/status";
import { STATUS_VIEW } from "@/features/lunito/theme";
import { cn } from "@/lib/utils";
import { publicStatus, type Shared } from "./privacy";

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
  shared: Shared;
  /** Perfil activo: lleva la marca "tú". */
  me: string;
};

export function Constellation({ selected, onSelect, pair, shared, me }: Props) {
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
          shared={shared}
          isMe={c.id === me}
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
  shared: Shared;
  isMe: boolean;
  x: number;
  y: number;
  active: boolean;
  onClick: () => void;
};

function Star({ member, shared, isMe, x, y, active, onClick }: StarProps) {
  const status = publicStatus(member, shared);
  const mood = status ? member.mood : "Sin compartir";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${member.name}: ${mood}`}
      className={cn(
        "absolute flex w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-2xl p-2 transition-colors",
        active ? "bg-accent ring-2 ring-primary" : "hover:bg-muted",
      )}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <img
        src={STATUS_VIEW[status ?? "verde"].image}
        alt=""
        className={cn("h-16 w-auto md:h-20", !status && "opacity-40 grayscale")}
      />
      <span className="text-sm font-semibold">
        {member.name}
        {isMe && " · tú"}
      </span>
      <span
        className="text-xs font-semibold"
        style={{ color: status ? STATUS_TOKEN[status] : undefined }}
      >
        {mood}
      </span>
    </button>
  );
}
