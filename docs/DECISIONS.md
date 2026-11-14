# Decisiones

Registro corto de lo que el equipo ya decidió y de lo que sigue abierto. Cuando algo cambie, se actualiza aquí en el mismo PR.

## Decidido

| Fecha      | Decisión                                                                                                               | Motivo                                                                                      |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 2026-11-06 | El reto es Create Health Monitoring Software for Astronauts on Space Missions.                                         | Elección del equipo.                                                                        |
| 2026-11-06 | Web instalable (PWA). No habrá app nativa.                                                                             | Lo que importa es la velocidad para construir un producto; los jueces lo abren con una URL. |
| 2026-11-06 | Stack: Node 24, pnpm, Vite, React y TypeScript.                                                                        | Un solo runtime y un solo gestor de paquetes para todo el equipo.                           |
| 2026-11-06 | Calidad: Prettier, Oxlint, Vitest y Playwright.                                                                        | Checks rápidos que también sirven de guía para los agentes.                                 |
| 2026-11-06 | Despliegue en Cloudflare Workers, con un sitio para `main` y otro para `staging`.                                      | Ver los cambios de ambas ramas sin tener que pasar todo a `main`.                           |
| 2026-11-06 | Ramas: features desde `staging`, PR a `staging`, y PR de `staging` a `main` cuando esté validado.                      | Mantener `main` siempre estable para el demo.                                               |
| 2026-11-06 | Sin issues y sin previews por PR, por ahora.                                                                           | Ahorrar tiempo.                                                                             |
| 2026-11-06 | Playwright se usa con la versión 1.64.1.                                                                               | La 1.65.0 salió el 5 de noviembre y pnpm bloquea por defecto versiones tan recientes.       |
| 2026-11-06 | El equipo se llama Nóstos.                                                                                             | Elección del equipo.                                                                        |
| 2026-11-07 | Las ramas de trabajo empiezan con el prefijo en mayúscula de quien las crea: `F/descripcion-corta` (tabla en TEAM.md). | Saber de un vistazo de quién es cada rama.                                                  |
| 2026-11-07 | `docs/LESSONS.md` guarda los errores a no repetir; los agentes lo leen antes de cada cambio.                           | Evitar repetir correcciones entre seis personas y seis agentes.                             |
| 2026-11-07 | Sin sistema de tareas con índice y archivo; el PR en borrador hace de tarea.                                           | Un índice compartido se desfasa en horas y genera conflictos de merge.                      |
| 2026-11-14 | Qué construimos: el sistema descrito en `docs/SISTEMA.md`, organizado por los 5 peligros de NASA (RIDGE).              | Resultado de la lluvia de ideas del equipo.                                                 |

## Abierto

- **IA dentro del producto.** Se quiere usar, pero falta decidir para qué. Nota técnica: una llave de API no puede vivir en el navegador, así que cualquier llamada a un modelo necesitará una función pequeña del lado del servidor en Cloudflare.
- **Dónde viven los datos.** La propuesta es que se guarden en el navegador y no haya backend ni cuentas de usuario. Falta confirmarlo cuando se defina el producto.
- **Interfaz.** Falta elegir librería de estilos, componentes y gráficas.
- **Nombre del producto.** "Health Monitor" es provisional.

## Para más adelante

El equipo decidió dejar estos temas para el final:

- Skills compartidas para los agentes. Se revisan con cuidado porque algunas traen sus propias convenciones.
- Subagentes y orquestación.
- Contratos de datos compartidos entre módulos.
