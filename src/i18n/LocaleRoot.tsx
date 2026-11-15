// Envuelve la app: al cambiar de idioma la vuelve a montar (así se recalculan
// también los textos que salen de funciones puras) y mantiene <html lang> al
// día para los lectores de pantalla y la voz del navegador.
import { Fragment, useEffect, type ReactNode } from "react";
import { useLocale } from "./index";

export function LocaleRoot({ children }: { children: ReactNode }) {
  const locale = useLocale();
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return <Fragment key={locale}>{children}</Fragment>;
}
