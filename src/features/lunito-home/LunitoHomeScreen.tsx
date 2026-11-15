import { useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import { useLunitoDashboard } from "@/data/lunitoDashboard";
import { DataPage } from "./DataPage";
import { ReferenceHeader, ReferenceNav } from "./ReferenceChrome";
import { TodayPage } from "./TodayPage";
import { useWide } from "./useWide";
import "./reference.css";
import "./today.css";
import "./data.css";
import "./mission.css";

export function LunitoHomeScreen() {
  const data = useLunitoDashboard();
  const [page, setPage] = useState(0);
  // On wide screens both pages show side by side (DISENO.md §2).
  const wide = useWide();
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchEnd = (event: TouchEvent) => {
    const start = touchStart.current;
    const end = event.changedTouches[0];
    touchStart.current = null;
    if (!start || !end) return;
    const dx = end.clientX - start.x;
    const dy = end.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5)
      setPage(dx < 0 ? 1 : 0);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (
      event.target !== event.currentTarget ||
      !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
    )
      return;
    event.preventDefault();
    const nextPage = event.key === "ArrowRight" || event.key === "End" ? 1 : 0;
    setPage(nextPage);
    const nextButton = event.currentTarget.parentElement
      ?.querySelectorAll("button")
      .item(nextPage);
    nextButton?.focus();
  };
  return (
    <div className="reference-app">
      <ReferenceHeader />
      <main
        className="home-carousel"
        aria-label="Inicio"
        aria-roledescription="carrusel"
        onTouchStart={(event) => {
          const touch = event.touches[0];
          if (touch)
            touchStart.current = { x: touch.clientX, y: touch.clientY };
        }}
        onTouchEnd={touchEnd}
      >
        <fieldset
          className="carousel-page"
          hidden={!wide && page !== 0}
          style={{ margin: 0, padding: 0, border: 0, minWidth: 0 }}
          aria-roledescription="página"
          aria-label="1 de 2"
        >
          <TodayPage data={data} onNext={() => setPage(1)} />
        </fieldset>
        <fieldset
          className="carousel-page"
          hidden={!wide && page !== 1}
          style={{ margin: 0, padding: 0, border: 0, minWidth: 0 }}
          aria-roledescription="página"
          aria-label="2 de 2"
        >
          <DataPage data={data} />
        </fieldset>
      </main>
      <fieldset
        className="carousel-pagination"
        style={{ margin: 0, padding: 0, border: 0, minWidth: 0 }}
        aria-label="Páginas de Inicio"
      >
        {[0, 1].map((index) => (
          <button
            key={index}
            aria-label={index === 0 ? "Así estás hoy" : "Tus datos"}
            aria-pressed={page === index}
            onClick={() => setPage(index)}
            onKeyDown={onKeyDown}
          >
            <span />
          </button>
        ))}
      </fieldset>
      <ReferenceNav />
    </div>
  );
}
