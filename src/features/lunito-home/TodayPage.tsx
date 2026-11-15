import {
  ArrowRight,
  Check,
  Droplet,
  Heart,
  HeartPulse,
  Pencil,
} from "lucide-react";
import type { LunitoDashboard } from "@/data/lunitoDashboard";
import { STATUS_LABEL } from "@/domain/status";
import { StatusMeaning } from "@/features/lunito/StatusMeaning";
import lunito from "@/features/day-checkin/assets/lunito-pregunta-clean.png";
import { Marea } from "./Marea";

export function TodayPage({
  data,
  onNext,
}: {
  data: LunitoDashboard;
  onNext: () => void;
}) {
  return (
    <section className="today-page" aria-labelledby="today-heading">
      <h1 id="today-heading">Así estás hoy</h1>
      <div className="today-status" data-status={data.status}>
        <span className="status-check">
          <Check aria-hidden="true" />
        </span>
        <strong>{STATUS_LABEL[data.status]}</strong>
        <span className="status-divider" />
        <StatusMeaning />
      </div>
      <div className="today-scene">
        <Marea />
        <img
          className="today-lunito"
          src={lunito}
          alt="Lunito con su pancita aqua"
        />
        <svg
          className="metric-connectors"
          viewBox="0 0 511 485"
          aria-hidden="true"
        >
          <g
            fill="none"
            style={{ stroke: "var(--reference-surface)" }}
            strokeWidth="3"
          >
            <path d="M389 151 Q335 148 304 213" />
            <path d="M395 239 Q340 223 300 247" />
            <path d="M123 263 Q144 274 170 289" />
          </g>
          <g
            style={{
              fill: "var(--reference-surface)",
              stroke: "var(--reference-glow)",
            }}
            strokeWidth="2"
          >
            <circle cx="304" cy="213" r="4" />
            <circle cx="300" cy="247" r="4" />
            <circle cx="170" cy="289" r="4" />
          </g>
        </svg>
        <a href="/estado" className="metric-bubble bubble-pulse">
          <Heart aria-hidden="true" />
          <span>Pulso</span>
          <strong>
            {data.reading.bpm}
            <small> lpm</small>
          </strong>
        </a>
        <a href="/estado" className="metric-bubble bubble-hrv">
          <HeartPulse aria-hidden="true" />
          <span>
            Variabilidad
            <br />
            cardíaca
          </span>
          <strong>
            {data.reading.hrv}
            <small> ms</small>
          </strong>
        </a>
        <a href="/estado" className="metric-bubble bubble-oxygen">
          <Droplet aria-hidden="true" />
          <span>
            Oxígeno
            <br />
            en sangre
          </span>
          <strong>
            {data.reading.spo2}
            <small> %</small>
          </strong>
        </a>
      </div>
      <a className="my-lunito" href="/check-in">
        <Pencil aria-hidden="true" />
        Mi Lunito
      </a>
      <button className="swipe-invitation" onClick={onNext}>
        Desliza para ver tus datos <ArrowRight aria-hidden="true" />
      </button>
    </section>
  );
}
