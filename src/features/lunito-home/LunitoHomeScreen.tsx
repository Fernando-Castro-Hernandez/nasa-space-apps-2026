import { useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import { useLunitoDashboard } from "@/data/lunitoDashboard";
import { t } from "@/i18n";
import { DataPage } from "./DataPage";
import { ReferenceHeader, ReferenceNav } from "./ReferenceChrome";
import { TodayPage } from "./TodayPage";
import { useWide } from "./useWide";
import "./reference.css";
import "./today.css";
import "./data.css";
import "./mission.css";

const PAGES = 2;
const fieldsetReset = { margin: 0, padding: 0, border: 0, minWidth: 0 };
const pageLabel = (n: number) => t("home.carousel.pageOf", { n, total: PAGES });

export function LunitoHomeScreen() {
  const data = useLunitoDashboard();
  const [page, setPageState] = useState(0);
  // Hacia dónde se movió el carrusel: la página nueva entra desde ese lado.
  const [direction, setDirection] = useState<"next" | "prev" | null>(null);
  const setPage = (next: number) => {
    if (next === page) return;
    setDirection(next > page ? "next" : "prev");
    setPageState(next);
  };
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
        aria-label={t("home.carousel.label")}
        aria-roledescription={t("home.carousel.role")}
        data-direction={direction ?? undefined}
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
          style={fieldsetReset}
          aria-roledescription={t("home.carousel.page")}
          aria-label={pageLabel(1)}
        >
          <TodayPage data={data} onNext={() => setPage(1)} />
        </fieldset>
        <fieldset
          className="carousel-page"
          hidden={!wide && page !== 1}
          style={fieldsetReset}
          aria-roledescription={t("home.carousel.page")}
          aria-label={pageLabel(2)}
        >
          <DataPage data={data} />
        </fieldset>
      </main>
      <fieldset
        className="carousel-pagination"
        style={fieldsetReset}
        aria-label={t("home.carousel.pages")}
      >
        {[0, 1].map((index) => (
          <button
            key={index}
            aria-label={
              index === 0 ? t("home.today.title") : t("home.data.title")
            }
            aria-pressed={page === index}
            onClick={() => setPage(index)}
            onKeyDown={onKeyDown}
          >
            <span />
          </button>
        ))}
      </fieldset>
      <ReferenceNav pathname="/" />
    </div>
  );
}
