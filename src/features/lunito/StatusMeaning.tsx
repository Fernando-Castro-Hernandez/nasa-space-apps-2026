// "Qué significa": explica el semáforo en una hoja desde abajo.
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Status } from "@/domain/vitals";
import { STATUS_MEANING, STATUS_NAME } from "./dashboardData";
import { DASH_VARS, STATUS_VIEW } from "./theme";

const ORDER: Status[] = ["verde", "ambar", "rojo"];

export function StatusMeaning() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-11 text-base text-primary underline underline-offset-4"
      >
        Qué significa
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          // La hoja se pinta en un portal, fuera del contenedor con las variables.
          style={DASH_VARS}
          className="rounded-t-3xl p-6 md:mx-auto md:max-w-lg"
        >
          <SheetHeader className="p-0">
            <SheetTitle className="text-xl">
              Qué significa cada estado
            </SheetTitle>
            <SheetDescription>
              Es una guía para ti, no un diagnóstico.
            </SheetDescription>
          </SheetHeader>
          <ul className="flex flex-col gap-4">
            {ORDER.map((s) => (
              <li key={s} className="flex items-start gap-3">
                <span
                  className="mt-1.5 size-3 shrink-0 rounded-full"
                  style={{ background: STATUS_VIEW[s].color }}
                  aria-hidden="true"
                />
                <span>
                  <strong className="block text-base">{STATUS_NAME[s]}</strong>
                  <span className="text-muted-foreground">
                    {STATUS_MEANING[s]}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>
    </>
  );
}
