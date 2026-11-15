// Respuesta del cirujano: llega a la nave como un paso nuevo de la checklist.
// Solo con el caso abierto: un caso cerrado ya no recibe indicaciones.
import { useState } from "react";
import { t } from "@/i18n";
import { addOrder } from "./caseLogic";
import { updateCase } from "./caseStore";

export function ReplyBox() {
  const [text, setText] = useState("");
  const send = () => {
    if (!text.trim()) return;
    updateCase((c) => addOrder(c, text, Date.now()));
    setText("");
  };

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      <label htmlFor="ground-reply" className="text-base font-bold">
        {t("ground.reply.label")}
      </label>
      <textarea
        id="ground-reply"
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("ground.reply.placeholder")}
        className="resize-y rounded-xl border-2 border-input bg-card p-3 text-base outline-none focus-visible:border-foreground"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[15px] text-muted-foreground">
          {t("ground.reply.hint")}
        </span>
        <button
          type="submit"
          disabled={!text.trim()}
          className="em-tap min-h-12 rounded-xl bg-primary px-5 text-base font-bold text-primary-foreground disabled:bg-muted disabled:text-muted-foreground"
        >
          {t("ground.reply.send")}
        </button>
      </div>
    </form>
  );
}
