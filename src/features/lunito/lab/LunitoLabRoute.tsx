// Entrada de la ruta oculta /lunito: carga la galería aparte para que no
// pese en el arranque de la app. Se abre desde el panel de la demo y vuelve a
// él; como en toda la app, Emergencia queda a un toque.
import { ChevronLeft } from "lucide-react";
import { lazy, Suspense } from "react";
import { EmergencyLink } from "@/components/emergency-access";
import { t } from "@/i18n";

const LunitoLab = lazy(() => import("./LunitoLab"));

export function LunitoLabRoute() {
  return (
    <>
      <header className="flex items-center justify-between px-4 pt-3 text-lg font-extrabold text-primary">
        <a href="/demo" className="reference-back">
          <ChevronLeft aria-hidden="true" />
          {t("shell.titles.demo")}
        </a>
        <EmergencyLink />
      </header>
      <Suspense fallback={null}>
        <LunitoLab />
      </Suspense>
    </>
  );
}
