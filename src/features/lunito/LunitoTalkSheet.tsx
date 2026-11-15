// "Hablar con Lunito" en una hoja inferior: se abre al tocar a Lunito o la
// fila bajo él en Inicio. La hoja no lleva un Lunito animado (uno solo por
// pantalla): el del héroe sigue a la vista y piensa o habla solo. La hoja
// (components/ui/sheet) ya trae Emergencia y el cierre.
//
//   <LunitoTalkSheet open={open} onOpenChange={setOpen}
//     status={data.status} reason={data.reason} />
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Status } from "@/domain/vitals";
import { t } from "@/i18n";
import { LunitoChat } from "./LunitoChat";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Estado y motivo del día: los mismos que muestra la pantalla. */
  status: Status;
  reason: string | null;
};

export function LunitoTalkSheet({ open, onOpenChange, status, reason }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* En celular deja ver la cara de Lunito arriba; desde 768 px va sobre
          la columna de Tus datos y Lunito queda entero a la izquierda. */}
      <SheetContent
        side="bottom"
        className="max-h-[80dvh] gap-3 overflow-y-auto px-5 pt-3 pb-5 md:right-auto! md:left-[calc(50%+16px)]! md:w-[min(512px,calc(50%-32px))]"
      >
        {/* El título ocupa el hueco a la izquierda de Emergencia y Cerrar. */}
        <SheetHeader className="absolute top-3 left-5 h-12 max-w-[34%] justify-center p-0">
          <SheetTitle className="text-lg leading-tight">
            {t("lunito.chat.region")}
          </SheetTitle>
        </SheetHeader>
        {open && <LunitoChat status={status} reason={reason} speakFirst />}
      </SheetContent>
    </Sheet>
  );
}
