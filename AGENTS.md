# Contexto para agentes

Este archivo es la fuente de verdad para cualquier agente de código (Claude Code, Cursor, Codex u otro) que trabaje en este repo. Léelo completo antes de proponer o cambiar algo.

## Qué es este repo

Proyecto del equipo **Nóstos**, de seis personas, para el **NASA Space Apps Challenge 2026** (14 y 15 de noviembre de 2026). El reto elegido es **Create Health Monitoring Software for Astronauts on Space Missions**: una herramienta visual para que un astronauta evalúe su propia salud durante una misión y reciba guía sobre qué hacer.

Lee también, en este orden:

1. [docs/BRIEF.md](docs/BRIEF.md): el hackatón y el reto, resumidos.
2. [docs/DECISIONS.md](docs/DECISIONS.md): qué está decidido y qué sigue abierto.
3. [docs/SISTEMA.md](docs/SISTEMA.md): el sistema que vamos a construir. Su propuesta visual está en [docs/DISENO.md](docs/DISENO.md).
4. [docs/PRD.md](docs/PRD.md): requisitos y alcance del MVP.
5. [docs/HISTORIAS.md](docs/HISTORIAS.md): historias de usuario y criterios de aceptación.
6. [docs/REPARTO.md](docs/REPARTO.md): responsables, módulos, pantallas y límites de integración.
7. [docs/FUENTES.md](docs/FUENTES.md): reglas de salud y sus fuentes.
8. [docs/WORKFLOW.md](docs/WORKFLOW.md): ramas, PRs, CI y despliegue.
9. [docs/LESSONS.md](docs/LESSONS.md): errores que ya nos pasaron y no queremos repetir.
10. [docs/TEAM.md](docs/TEAM.md): quiénes somos y el prefijo de rama de cada quien.
11. [docs/CHALLENGE.md](docs/CHALLENGE.md): enunciado oficial completo, en inglés.
12. [docs/resources/](docs/resources/README.md): extractos de las fuentes oficiales del reto. Consúltalos antes de buscar en internet.

## Estado actual

El repo es una **plantilla**: app mínima, checks y despliegue. **El producto ya está definido** en [docs/SISTEMA.md](docs/SISTEMA.md), pero todavía no está construido.

- Construye lo que describen `docs/PRD.md` y `docs/HISTORIAS.md`, respetando la propiedad de `docs/REPARTO.md`. No inventes funcionalidades, pantallas ni modelos de datos del producto que no estén ahí.
- Si te piden algo que depende de una decisión abierta, dilo y pregunta antes de construir.

## Stack

- Node 24 y pnpm (versión fijada en `package.json`). No uses npm, yarn ni bun.
- Vite, React y TypeScript estricto. Se entrega como web instalable (PWA), no como app nativa.
- Prettier (formato), Oxlint (lint), Vitest (unitarias e integración), Playwright (E2E).
- Despliegue en Cloudflare Workers como sitio estático (`wrangler.jsonc`).

## Comandos

| Comando       | Qué hace                                                      |
| ------------- | ------------------------------------------------------------- |
| `pnpm dev`    | Servidor de desarrollo.                                       |
| `pnpm check`  | Formato, lint, tipos, pruebas y build. Es lo mismo que el CI. |
| `pnpm format` | Aplica Prettier.                                              |
| `pnpm test`   | Pruebas con Vitest.                                           |
| `pnpm e2e`    | Prueba de humo con Playwright sobre el build.                 |

## Cómo se trabaja

- Cada cambio va en una rama propia creada **desde `staging`** y entra por PR **a `staging`**.
- El nombre de la rama empieza con el prefijo de quien la crea, en mayúscula: `F/descripcion-corta`. Los prefijos están en [docs/TEAM.md](docs/TEAM.md).
- Antes de empezar un cambio, lee [docs/LESSONS.md](docs/LESSONS.md). Si alguien del equipo te corrige algo que podría repetirse, agrega una línea ahí en el mismo PR.
- `main` solo recibe PRs desde `staging`. Nunca hagas push directo a `main` ni a `staging`.
- Un cambio está terminado cuando `pnpm check` pasa en local y el PR tiene el CI en verde.
- No hagas commit, push ni abras PRs sin que la persona con la que trabajas te lo pida.
- Detalle completo en [docs/WORKFLOW.md](docs/WORKFLOW.md).

## Convenciones

- Documentación, commits, PRs y textos de la interfaz en español. Código (nombres de variables, funciones, archivos) en inglés.
- Cambios pequeños y enfocados: un PR resuelve una sola cosa.
- La lógica que no sea de interfaz va en funciones puras con su prueba en Vitest (`*.test.ts` junto al archivo).
- Antes de agregar una dependencia, comprueba que haga falta y anótala en `docs/DECISIONS.md`.
- No subas secretos ni llaves de API al repo. Las variables `VITE_*` terminan en el navegador y son públicas.

## Reglas del dominio

- Es un prototipo de hackatón, no un dispositivo médico. La interfaz no debe presentarse como diagnóstico.
- Cualquier umbral, rango o recomendación de salud que aparezca en el producto debe tener una fuente citada (NASA Human Research Program u otra agencia espacial o fuente médica reconocida). Primero busca en [docs/FUENTES.md](docs/FUENTES.md), donde están las reglas ya citadas, y después en [docs/resources/](docs/resources/README.md). Si no hay fuente, no lo inventes: márcalo como pendiente de validar.

## Mantén este contexto al día

Cuando el equipo tome una decisión (qué se construye, una librería nueva, un cambio de flujo), actualiza `docs/DECISIONS.md` en el mismo PR. Así el agente de cada integrante parte del mismo contexto.
