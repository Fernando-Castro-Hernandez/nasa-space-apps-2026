# Propuesta visual

Dirección visual de la app. El concepto de Lunito y sus reglas están en [SISTEMA.md](SISTEMA.md) (sección 1); las pantallas, en la sección 9.

## Idea

Profesional pero limpio. **Lunito es la única ilustración**: todo lo demás es tipografía, tarjetas y color de estado. Fondo de noche espacial oscura y una luna clara detrás de Lunito en la pantalla de inicio.

## Lunito

![Hoja de personaje de Lunito](diseno/lunito-hoja.jpg)

El semáforo vive en su pancita:

| Verde                                    | Ámbar                                    | Rojo                                   |
| ---------------------------------------- | ---------------------------------------- | -------------------------------------- |
| ![Lunito verde](diseno/lunito-verde.png) | ![Lunito ámbar](diseno/lunito-ambar.png) | ![Lunito rojo](diseno/lunito-rojo.png) |
| "Todo en orden"                          | "Revisar · motivo"                       | "Atención · motivo"                    |

- `lunito-hoja.jpg`: hoja original (frente, perfil, espalda y tres cuartos).
- `lunito-verde.png`, `lunito-ambar.png`, `lunito-rojo.png`: frente sin fondo, listas para usar en la app.
- El color nunca va solo: siempre lo acompaña una palabra (regla 3 de Lunito).
- Pendiente: cómo distinguir al Lunito de cada tripulante (color de aletas o un accesorio).

## Colores

| Uso                  | Color     |
| -------------------- | --------- |
| Fondo                | `#0B0D1F` |
| Fondo elevado        | `#1A1C3A` |
| Texto                | `#F2F0FA` |
| Texto secundario     | `#A9A6C4` |
| Acento (Lunito, voz) | `#B9A6FF` |
| Estado verde         | `#3CE1A0` |
| Estado ámbar         | `#FFB840` |
| Estado rojo          | `#FF5A6E` |
| Banner de emergencia | `#C8243B` |

Verde, ámbar y rojo se usan **solo** para estados, nunca como decoración.

## Tipografía

- Títulos y números: **Space Grotesk** (500 y 600).
- Texto: **Inter** (400, 500 y 600).
- Mínimo 15 px para texto de lectura y botones de al menos 44 px de alto: se usa flotando y con prisa.

## Patrones

- Tarjetas con fondo blanco al 5 % y borde blanco al 8 %, esquinas de 18 a 20 px.
- Botón principal: píldora clara (`#F2F0FA`) con texto oscuro, 56 px de alto.
- Gráficas de 7 días con la línea base punteada.
- En emergencia desaparece todo lo lúdico: banner rojo, alto contraste y nada de animaciones decorativas.
