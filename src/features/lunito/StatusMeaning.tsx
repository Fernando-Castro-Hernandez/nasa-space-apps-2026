// "Qué significa": explica el semáforo en una hoja desde abajo, con el mismo
// ícono, palabra y color de cada estado que se ven en Inicio.
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { STATUS_LABEL } from "@/domain/status";
import { t } from "@/i18n";
import { StatusMark } from "./StatusMark";
import { STATUS_ORDER } from "./theme";

export function StatusMeaning({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "min-h-12 text-base text-primary underline underline-offset-4"
        }
      >
        {t("home.meaning.open")}
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="px-6 pt-3 pb-8 md:mx-auto md:max-w-lg"
        >
          <SheetHeader className="p-0">
            <SheetTitle className="text-2xl">
              {t("home.meaning.title")}
            </SheetTitle>
          </SheetHeader>
          <ul className="flex flex-col gap-5">
            {STATUS_ORDER.map((s) => (
              <li key={s} className="flex items-start gap-3">
                <StatusMark status={s} className="mt-0.5 size-8" />
                <span>
                  <strong className="block text-lg font-extrabold">
                    {STATUS_LABEL[s]}
                  </strong>
                  <span className="text-base text-muted-foreground">
                    {t(`home.meaning.${s}`)}
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
