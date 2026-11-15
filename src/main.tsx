import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { LocaleRoot } from "./i18n/LocaleRoot";
// Una sola tipografía: Nunito variable (la carga reference.css con la paleta).
import "./features/lunito-home/reference.css";
import "./index.css";

const root = document.getElementById("root");
if (!root) throw new Error("No se encontró el elemento #root");

createRoot(root).render(
  <StrictMode>
    <LocaleRoot>
      <App />
    </LocaleRoot>
  </StrictMode>,
);
