# Órbita en staging — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preservar la maqueta Órbita aprobada, integrar la parte React propiedad de Mateo y fusionar el cambio a `staging` sin invadir módulos de otros responsables.

**Architecture:** La maqueta HTML queda como referencia visual versionada en `docs/diseno/prototipos/`. La aplicación continúa en React: Inicio y Tu evolución usan los componentes ya creados en esta rama; el shell, tokens globales y navegación se entregan a Ariff mediante `DISENO.md` y `REPARTO.md`.

**Tech Stack:** HTML/CSS/JavaScript para la referencia; React 19, TypeScript estricto, Tailwind 4 y Vitest para producción.

**Spec:** `docs/superpowers/specs/2026-11-14-orbita-design.md`

## Global Constraints

- No modificar `src/App.tsx`, `src/index.css` ni `src/app/`: son propiedad exclusiva de Ariff.
- No reemplazar la app React con la maqueta estática.
- Mantener Emergencia visible, estados siempre con palabra y el aviso de prototipo no diagnóstico.
- No agregar dependencias.

## Review Focus

- La referencia debe abrir sin servidor de compilación y conservar todas sus pantallas.
- Inicio debe seguir usando las reglas puras de `domain/vitals`, no estados visuales inventados.
- El movimiento reducido debe seguir desactivando animaciones.
- La rama debe pasar lint, tipos, pruebas y build.
- El PR debe apuntar a `staging` y no hacer push directo a esa rama.

---

### Task 1: Versionar la maqueta aprobada

**Files:**

- Create: `docs/diseno/prototipos/orbita.html`
- Modify: `docs/DISENO.md`
- Modify: `docs/DECISIONS.md`

- [ ] Copiar la versión final servida en `localhost:4321` sin alterar su comportamiento.
- [ ] Declararla referencia integral para estructura y lenguaje visual.
- [ ] Registrar que la maqueta no sustituye el código React ni cambia la propiedad de archivos.
- [ ] Abrir el HTML y comprobar Inicio, Equipo, Tareas, Ajustes, Check-in y Emergencia.

### Task 2: Verificar la implementación React de Mateo

**Files:**

- Existing: `src/features/lunito/`
- Existing: `src/features/status/`
- Existing: `src/features/demo/`
- Existing: `src/data/dashboard.ts`

- [ ] Ejecutar las pruebas unitarias de dashboard, layout, gráficas y lectura simulada.
- [ ] Ejecutar lint, tipos y build.
- [ ] Confirmar que el diff no toca archivos exclusivos de Ariff, Jenni o Fernando salvo integraciones previamente acordadas.

### Task 3: Entregar a staging

**Files:**

- Commit only the prototype, approved design documents, plan, and existing branch implementation.

- [ ] Eliminar o excluir artefactos locales de Playwright.
- [ ] Crear un commit convencional enfocado.
- [ ] Push a `M/inicio-dashboard`.
- [ ] Abrir o actualizar el PR hacia `staging`.
- [ ] Esperar CI verde y fusionar el PR.
- [ ] Actualizar la copia local de `staging` con `pull --ff-only`.
