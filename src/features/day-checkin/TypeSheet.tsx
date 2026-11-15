import { useEffect, useRef, useState } from "react";

type Props = { onCancel: () => void; onSubmit: (text: string) => void };

/** "Escribir respuesta": la misma pregunta, por teclado. Sube desde abajo. */
export function TypeSheet({ onCancel, onSubmit }: Props) {
  const [text, setText] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement;
    element?.showModal();
    // React enfoca antes de showModal; el diálogo nativo volvería al primer botón.
    field.current?.focus();
    return () => {
      element?.close();
      if (previous instanceof HTMLElement && previous.isConnected)
        previous.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-labelledby="type-sheet-title"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = event.currentTarget.querySelectorAll<HTMLElement>(
          "button:not(:disabled), textarea",
        );
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      className="day-type-sheet fixed inset-0 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0"
    >
      <div className="flex min-h-full items-end justify-center">
        <button
          type="button"
          aria-label="Cerrar"
          onClick={onCancel}
          className="sheet-backdrop absolute inset-0 bg-black/15 backdrop-blur-[2px]"
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (text.trim()) onSubmit(text.trim());
          }}
          className="sheet-panel relative w-full max-w-xl rounded-t-[2rem] bg-white px-6 pt-6 pb-8 shadow-[0_-12px_40px_rgb(117_99_182/0.18)]"
        >
          <span className="mx-auto mb-5 block h-1.5 w-12 rounded-full bg-violet-200" />
          <label
            id="type-sheet-title"
            htmlFor="type-sheet-text"
            className="text-2xl font-bold"
          >
            ¿Cómo amaneciste hoy?
          </label>
          <textarea
            id="type-sheet-text"
            ref={field}
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Cuéntame cómo te sientes"
            className="mt-4 w-full resize-none rounded-2xl border border-violet-200 bg-white px-4 py-3 text-lg outline-none placeholder:text-inherit focus:border-violet-500"
          />
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="h-12 flex-1 rounded-full text-base font-semibold hover:bg-violet-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!text.trim()}
              className="h-12 flex-1 rounded-full bg-violet-700 text-base font-semibold text-white transition-opacity disabled:opacity-40"
            >
              Continuar
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
