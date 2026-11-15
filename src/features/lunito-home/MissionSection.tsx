import { ChevronDown, ChevronUp, Heart } from "lucide-react";
import type { LunitoDashboard } from "@/data/lunitoDashboard";
import { STATUS_LABEL } from "@/domain/status";
import { Marea } from "./Marea";

export function MissionSection({
  data,
  scrolled,
  onToggle,
}: {
  data: LunitoDashboard;
  scrolled: boolean;
  onToggle: () => void;
}) {
  const { mission } = data;
  // Target tick on the 84-radius arc centered at (100,100): 0 % left, 100 % right.
  const angle = Math.PI * (1 - mission.target / 100);
  const tick = (r: number) =>
    `${100 + r * Math.cos(angle)} ${100 - r * Math.sin(angle)}`;
  return (
    <section className="mission-section" aria-labelledby="mission-heading">
      <Marea variant="mission" />
      <button
        className="mission-toggle"
        onClick={onToggle}
        aria-controls="mission-content"
      >
        <h2 id="mission-heading">Tu misión</h2>
        {scrolled ? (
          <ChevronUp aria-hidden="true" />
        ) : (
          <ChevronDown aria-hidden="true" />
        )}
      </button>
      <div id="mission-content" className="mission-content">
        <article className="companion-panel">
          <div>
            <p className="mission-eyebrow">Compañero del día</p>
            <h3>
              {mission.companion
                ? `Hoy acompañas a ${mission.companion.name}`
                : "Tu compañero del día"}
            </h3>
            <p>
              {mission.companion
                ? "Pregúntale cómo durmió"
                : "No hay una pareja disponible"}
            </p>
          </div>
          <button
            className="encouragement"
            disabled={!data.capabilities.remoteEncouragement}
            title="El envío de ánimo aún no está disponible: falta el backend"
          >
            <Heart aria-hidden="true" />
            Enviar ánimo
          </button>
        </article>
        <article className="autonomy-panel">
          <div>
            <p className="mission-eyebrow">Autonomía de la fase</p>
            <p>Lo que resolvemos a bordo</p>
            <p className="autonomy-target">
              Objetivo <strong>{mission.target} %</strong>
            </p>
          </div>
          <figure
            className="autonomy-gauge"
            aria-label={`Autonomía ${mission.autonomy} %, objetivo ${mission.target} %`}
          >
            <svg viewBox="0 0 200 112" aria-hidden="true">
              <defs>
                <linearGradient id="gauge-color">
                  <stop style={{ stopColor: "var(--reference-violet)" }} />
                  <stop
                    offset="1"
                    style={{ stopColor: "var(--reference-violet-soft)" }}
                  />
                </linearGradient>
              </defs>
              <path
                d="M16 100 A84 84 0 0 1 184 100"
                fill="none"
                style={{ stroke: "var(--reference-lavender-200)" }}
                strokeWidth="15"
                strokeLinecap="round"
              />
              <path
                d="M16 100 A84 84 0 0 1 184 100"
                fill="none"
                stroke="url(#gauge-color)"
                strokeWidth="15"
                strokeLinecap="round"
                pathLength="100"
                strokeDasharray={`${mission.autonomy} 100`}
              />
              <path
                d={`M${tick(76)} L${tick(96)}`}
                style={{ stroke: "var(--reference-violet)" }}
                strokeWidth="3"
              />
            </svg>
            <strong>{mission.autonomy} %</strong>
          </figure>
        </article>
        {data.isCommander && (
          <article className="ridge-panel">
            <h3>Panel del comandante · RIDGE</h3>
            <p>Vista comandante · Solo lectura</p>
            <ul aria-label="Panel RIDGE">
              {mission.ridge.map((hazard) => (
                <li key={hazard.key}>
                  <span className="ridge-key">{hazard.key}</span>
                  <span>
                    {hazard.key === "D"
                      ? "Distancia de la Tierra"
                      : hazard.key === "E"
                        ? "Ambiente cerrado"
                        : hazard.label}
                  </span>
                  <strong data-status={hazard.status}>
                    {STATUS_LABEL[hazard.status]}
                  </strong>
                </li>
              ))}
            </ul>
          </article>
        )}
        <p className="demo-disclosure">
          Datos de demostración · Sin conexión a un backend. El envío de ánimo
          no está disponible.
        </p>
      </div>
    </section>
  );
}
