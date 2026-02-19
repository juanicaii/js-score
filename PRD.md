# PRD — Anotador de Juegos

**Versión:** 1.0
**Fecha:** 18 de Febrero de 2026
**Stack:** Next.js + TypeScript + Tailwind CSS (PWA)
**Horas estimadas:** ~120h

---

## 1. Resumen Ejecutivo

### Problema

Cada vez que un grupo se junta a jugar juegos de mesa o cartas (Generala, Chinchón, Truco, 10.000), alguien tiene que buscar papel, lapicera, y recordar las reglas de puntuación. Los anotadores se pierden, los cálculos se hacen mal, y no queda registro de las partidas.

### Solución

Una PWA mobile-first que funciona como anotador inteligente para los juegos más populares de Argentina. Cada juego tiene su lógica de puntuación integrada (categorías de Generala, eliminación en Chinchón, palitos en Truco, combinaciones en 10.000). Funciona 100% offline, guarda jugadores reutilizables e historial de partidas.

### Métricas de éxito

- La app funciona 100% offline después de la primera carga
- Tiempo desde abrir la app hasta empezar a anotar: < 15 segundos
- Cero errores de cálculo en los puntajes automáticos
- Historial de partidas persistente entre sesiones

### Tech Stack

| Tecnología | Uso | Versión |
|---|---|---|
| Next.js 14 | Framework fullstack con App Router | ^14.0 |
| TypeScript | Type safety | ^5.3 |
| Tailwind CSS | Utility-first styling | ^3.4 |
| next-pwa | Service Worker y PWA support | ^5.6 |
| idb / Dexie.js | Wrapper para IndexedDB | ^4.0 |
| Zod | Validación de schemas | ^3.22 |

---

## 2. Usuarios y Roles

Al ser una app client-side sin autenticación, hay un único tipo de usuario.

### Usuario (Jugador)

- **Descripción:** Cualquier persona que abre la app en su celular para anotar una partida
- **Necesita:** Empezar una partida rápido, anotar puntos sin errores, ver quién va ganando, guardar el historial
- **Puede hacer:** Crear/editar/eliminar jugadores, iniciar partidas de cualquier juego, configurar reglas, anotar puntos, ver historial

---

## 3. Modelo de Datos (IndexedDB)

Dado que la app es 100% client-side, el modelo de datos se almacena en IndexedDB. Los nombres de campos usan `snake_case` siguiendo la convención de base de datos.

### 3.1 Player

| Campo | Tipo | Descripción |
|---|---|---|
| id | string (uuid) | Identificador único |
| name | string | Nombre del jugador |
| created_at | timestamp | Fecha de creación |

### 3.2 Game

| Campo | Tipo | Descripción |
|---|---|---|
| id | string (uuid) | Identificador único |
| game_type | enum | `generala`, `chinchon`, `truco`, `diez_mil`, `universal` |
| status | enum | `in_progress`, `finished` |
| config | JSON | Configuración específica del juego (ver detalle por juego) |
| player_ids | string[] | IDs de jugadores participantes |
| winner_id | string? | ID del jugador/equipo ganador |
| created_at | timestamp | Fecha de inicio |
| finished_at | timestamp? | Fecha de finalización |

### 3.3 GameConfig (JSON por tipo de juego)

#### Generala Config

```json
{
  "max_players": 6
}
```

#### Chinchón Config

```json
{
  "elimination_score": 100,
  "chinchon_wins": true
}
```

#### Truco Config

```json
{
  "target_score": 15,
  "team_names": ["Nosotros", "Ellos"]
}
```

#### 10.000 Config

```json
{
  "target_score": 10000
}
```

#### Universal Config

```json
{
  "target_score": 100,
  "highest_wins": true
}
```

### 3.4 GameScore

Almacena las anotaciones específicas por juego.

#### GeneralaScore

| Campo | Tipo | Descripción |
|---|---|---|
| id | string (uuid) | Identificador único |
| game_id | string | FK a Game |
| player_id | string | FK a Player |
| ones | int? | Puntaje de 1s |
| twos | int? | Puntaje de 2s |
| threes | int? | Puntaje de 3s |
| fours | int? | Puntaje de 4s |
| fives | int? | Puntaje de 5s |
| sixes | int? | Puntaje de 6s |
| straight | int? | Escalera (20 pts, servida 25) |
| full_house | int? | Full (30 pts, servida 35) |
| poker | int? | Póker (40 pts, servida 45) |
| generala | int? | Generala (50 pts) |
| double_generala | int? | Doble Generala (100 pts) |

Nota: `null` = no anotado, valor numérico = anotado (0 = tachado).

#### ChinchonScore

| Campo | Tipo | Descripción |
|---|---|---|
| id | string (uuid) | Identificador único |
| game_id | string | FK a Game |
| player_id | string | FK a Player |
| rounds | JSON[] | Array de `{ round_number, points }` |
| total_points | int | Suma acumulada |
| is_eliminated | boolean | Si fue eliminado por pasar el límite |

#### TrucoScore

| Campo | Tipo | Descripción |
|---|---|---|
| id | string (uuid) | Identificador único |
| game_id | string | FK a Game |
| team | enum | `nosotros`, `ellos` |
| points | int | Puntos actuales (palitos) |

#### DiezMilScore

| Campo | Tipo | Descripción |
|---|---|---|
| id | string (uuid) | Identificador único |
| game_id | string | FK a Game |
| player_id | string | FK a Player |
| turns | JSON[] | Array de `{ turn_number, points_earned, combination, total_after }` |
| total_points | int | Puntaje acumulado |

#### UniversalScore

| Campo | Tipo | Descripción |
|---|---|---|
| id | string (uuid) | Identificador único |
| game_id | string | FK a Game |
| player_id | string | FK a Player |
| rounds | JSON[] | Array de `{ round_number, points }` |
| total_points | int | Suma acumulada |

---

## 4. Lógica de Juegos

### 4.1 Generala

#### Categorías y puntajes

| Categoría | Puntaje | Servida |
|---|---|---|
| 1s, 2s, 3s, 4s, 5s, 6s | Suma de los dados iguales | — |
| Escalera | 20 pts | 25 pts |
| Full | 30 pts | 35 pts |
| Póker | 40 pts | 45 pts |
| Generala | 50 pts | Cierra el juego |
| Doble Generala | 100 pts | Cierra el juego |

#### Reglas de negocio

- Cada jugador tiene una grilla con todas las categorías.
- Cada categoría se puede usar una sola vez.
- El jugador puede "tachar" una categoría (anotar 0).
- Para números (1s-6s), el puntaje es la suma de los dados de ese número (ej: tres 4s = 12).
- La partida termina cuando todos los jugadores completaron todas las categorías.
- Gana el jugador con mayor puntaje total.
- Si alguien saca Generala servida, gana automáticamente.

### 4.2 Chinchón

#### Reglas de negocio

- Al finalizar cada ronda, se anotan los puntos que le quedaron a cada jugador en la mano.
- Los puntos se acumulan ronda a ronda.
- Si un jugador supera el límite configurado (default 100), queda **eliminado**.
- Si un jugador hace **Chinchón** (cierra con todas las cartas ligadas), gana la partida inmediatamente.
- El último jugador que queda en pie gana (si no hubo chinchón).
- El puntaje más bajo es mejor (querés sumar lo menos posible).

### 4.3 Truco

#### Reglas de negocio

- Siempre 2 equipos: "Nosotros" vs "Ellos".
- Se anotan puntos con **palitos** clásicos (visual: ||||).
- El objetivo es configurable: **15 puntos** o **30 puntos**.
- Cada equipo suma puntos de a 1.
- El primer equipo en llegar al objetivo gana.
- Opcionalmente mostrar los palitos agrupados de a 5 (estilo clásico argentino: 4 verticales + 1 diagonal).

### 4.4 Diez Mil (10.000)

#### Combinaciones de dados y puntajes

| Combinación | Puntaje |
|---|---|
| Cada 1 suelto | 100 pts |
| Cada 5 suelto | 50 pts |
| Tres 1s | 1.000 pts |
| Tres 2s | 200 pts |
| Tres 3s | 300 pts |
| Tres 4s | 400 pts |
| Tres 5s | 500 pts |
| Tres 6s | 600 pts |
| Escalera (1-2-3-4-5-6) | 3.000 pts |
| Tres pares | 1.500 pts |

#### Reglas de negocio

- Botones rápidos principales: **+100** y **+50** para anotar dados sueltos.
- Selector de combinaciones para triples y especiales.
- Se acumulan puntos por turno antes de "plantar".
- El primer jugador en llegar a 10.000 gana.
- Si un jugador no anota puntos en un turno, pierde lo acumulado en ese turno.

### 4.5 Anotador Universal

#### Reglas de negocio

- Cantidad libre de jugadores (con límite configurable).
- Se agrega un puntaje por ronda a cada jugador (puede ser positivo o negativo).
- Puntaje objetivo configurable para definir ganador.
- Configurable si gana el que más puntos o menos puntos tiene.
- La partida termina cuando algún jugador alcanza el objetivo, o manualmente.

---

## 5. Estructura de Páginas

### 5.1 Rutas Públicas (todas, no hay auth)

| Ruta | Descripción | Componentes principales |
|---|---|---|
| `/` | Home — Selección de juego | GameSelector, ActiveGameBanner |
| `/jugadores` | Gestión de jugadores reutilizables | PlayerList, PlayerForm |
| `/historial` | Historial de partidas pasadas | GameHistoryList, GameHistoryCard |
| `/juego/generala` | Configuración y partida de Generala | GeneralaSetup, GeneralaBoard |
| `/juego/chinchon` | Configuración y partida de Chinchón | ChinchonSetup, ChinchonBoard |
| `/juego/truco` | Configuración y partida de Truco | TrucoSetup, TrucoBoard |
| `/juego/diez-mil` | Configuración y partida de 10.000 | DiezMilSetup, DiezMilBoard |
| `/juego/universal` | Configuración y partida universal | UniversalSetup, UniversalBoard |
| `/juego/[id]/resultado` | Pantalla de resultado final | GameResult, Podium, PlayAgainButton |

---

## 6. Componentes Principales

### 6.1 Componentes Core

| Componente | Props principales | Descripción |
|---|---|---|
| `GameSelector` | `onSelect(gameType)` | Grid de juegos disponibles con ícono y nombre |
| `ActiveGameBanner` | `game, onResume, onAbandon` | Banner que aparece si hay una partida en curso |
| `PlayerPicker` | `selectedIds, maxPlayers, onSelect` | Selector de jugadores existentes + crear nuevo |
| `ScoreDisplay` | `score, label, variant` | Muestra un puntaje con formato consistente |
| `RoundInput` | `players, onSubmit` | Input de puntos para una ronda (Chinchón, Universal) |
| `Podium` | `players, scores` | Podio de resultados al terminar partida |
| `PlayAgainButton` | `gameType, playerIds, config` | Botón para rearmar partida con mismos jugadores/config |

### 6.2 Componentes por Juego

#### Generala

| Componente | Props principales | Descripción |
|---|---|---|
| `GeneralaBoard` | `gameId, players` | Grilla completa con categorías x jugadores |
| `GeneralaCategoryRow` | `category, scores, onScore` | Fila de una categoría con celdas por jugador |
| `GeneralaScoreInput` | `category, onConfirm, onCross` | Modal para ingresar puntaje o tachar |
| `GeneralaTotals` | `players, scores` | Fila de totales al pie de la grilla |

#### Chinchón

| Componente | Props principales | Descripción |
|---|---|---|
| `ChinchonBoard` | `gameId, players` | Tabla de rondas con puntajes acumulados |
| `ChinchonRoundInput` | `activePlayers, onSubmit, onChinchon` | Input de puntos de ronda + botón "Chinchón!" |
| `ChinchonPlayerStatus` | `player, totalPoints, isEliminated, limit` | Estado del jugador (activo/eliminado, puntos) |

#### Truco

| Componente | Props principales | Descripción |
|---|---|---|
| `TrucoBoard` | `gameId, targetScore` | Vista de dos columnas con palitos |
| `TrucoPalitos` | `points, maxPoints` | Visualización de palitos clásicos agrupados de a 5 |
| `TrucoControls` | `onAddPoint(team)` | Botones +1 para cada equipo |

#### 10.000

| Componente | Props principales | Descripción |
|---|---|---|
| `DiezMilBoard` | `gameId, players` | Scoreboard con puntajes acumulados |
| `DiezMilTurnInput` | `playerId, onConfirm` | Panel de turno con botones +100, +50 y selector |
| `DiezMilCombinationPicker` | `onSelect(combination)` | Selector de combinaciones (tres 1s, tres 2s, etc.) |
| `DiezMilTurnSummary` | `turnPoints, combinations` | Resumen del turno antes de confirmar |

#### Universal

| Componente | Props principales | Descripción |
|---|---|---|
| `UniversalBoard` | `gameId, players, config` | Tabla de rondas con totales |
| `UniversalRoundInput` | `players, onSubmit` | Input libre de puntos (+/-) por jugador |

### 6.3 Componentes de Layout

| Componente | Props principales | Descripción |
|---|---|---|
| `AppShell` | `children, title, showBack` | Layout principal con header y navegación |
| `BottomNav` | `currentRoute` | Navegación inferior (Juegos, Jugadores, Historial) |
| `ConfirmDialog` | `title, message, onConfirm, onCancel` | Dialog de confirmación para acciones destructivas |

---

## 7. Flujos de Usuario

### 7.1 Flujo Principal — Iniciar Partida

1. Usuario abre la app (Home).
2. Sistema muestra los 5 juegos disponibles como cards/grid.
3. Si hay una partida en curso, sistema muestra banner "Partida en curso" con opción de continuar o abandonar.
4. Usuario selecciona un juego.
5. Sistema navega a la pantalla de setup del juego.
6. Usuario selecciona jugadores de la lista de jugadores guardados (o crea nuevos).
7. Usuario configura las reglas del juego (límite de puntos, etc.).
8. Usuario presiona "Empezar partida".
9. Sistema crea la partida en IndexedDB y navega al board del juego.

### 7.2 Flujo Generala

1. Sistema muestra grilla: filas = categorías, columnas = jugadores.
2. Usuario toca una celda vacía para anotar.
3. Sistema abre modal de puntaje para esa categoría.
4. Usuario ingresa el puntaje o presiona "Tachar" (anota 0).
5. Sistema valida el puntaje, actualiza la celda y recalcula el total.
6. Se repite hasta que todas las celdas estén completas.
7. Sistema detecta partida terminada, muestra resultado con podio.

### 7.3 Flujo Chinchón

1. Sistema muestra tabla de jugadores con puntajes acumulados.
2. Usuario presiona "Nueva ronda".
3. Sistema muestra input de puntos para cada jugador activo (no eliminado).
4. Usuario ingresa puntos de cada jugador o presiona "¡Chinchón!" para un jugador.
5. Si Chinchón: sistema termina la partida, ese jugador gana.
6. Si ronda normal: sistema suma puntos, verifica eliminaciones.
7. Si un jugador supera el límite, sistema lo marca como eliminado.
8. Si queda un solo jugador activo, sistema termina la partida.

### 7.4 Flujo Truco

1. Sistema muestra dos columnas: "Nosotros" y "Ellos" con palitos.
2. Usuario presiona "+1" en el equipo que anotó.
3. Sistema agrega un palito y actualiza el conteo.
4. Los palitos se agrupan visualmente de a 5 (4 verticales + 1 diagonal).
5. Cuando un equipo llega al objetivo (15 o 30), sistema muestra ganador.

### 7.5 Flujo 10.000

1. Sistema muestra scoreboard con jugadores y puntajes.
2. Sistema indica de quién es el turno.
3. Usuario usa botones **+100**, **+50** o el **selector de combinaciones** para sumar puntos del turno.
4. Sistema muestra resumen del turno con desglose.
5. Usuario presiona "Plantar" para confirmar o "Pierde turno" si no anotó.
6. Sistema suma al total del jugador y pasa al siguiente.
7. Cuando un jugador llega a 10.000, sistema muestra ganador.

### 7.6 Flujo Anotador Universal

1. Sistema muestra tabla de jugadores con puntajes.
2. Usuario presiona "Nueva ronda".
3. Sistema muestra input de puntos para cada jugador (acepta positivos y negativos).
4. Usuario ingresa puntos y confirma.
5. Sistema actualiza totales.
6. Si algún jugador alcanza el objetivo configurado, sistema muestra ganador.
7. Si no hay objetivo, la partida se termina manualmente.

### 7.7 Flujo — Volver a Jugar

1. En la pantalla de resultado, usuario presiona "Volver a jugar".
2. Sistema crea nueva partida con los mismos jugadores y configuración.
3. Sistema navega al board del juego con todo reseteado.

### 7.8 Flujo — Gestión de Jugadores

1. Usuario navega a "Jugadores" desde el bottom nav.
2. Sistema muestra lista de jugadores guardados.
3. Usuario puede crear nuevo jugador (ingresa nombre).
4. Usuario puede editar nombre o eliminar jugador existente.
5. Los jugadores eliminados no afectan partidas ya finalizadas en el historial.

---

## 8. Seguridad

No aplica autenticación ni autorización en esta versión. Todos los datos son locales al dispositivo.

### Consideraciones

- Los datos se almacenan exclusivamente en IndexedDB del navegador.
- No hay transmisión de datos a ningún servidor.
- Si el usuario borra los datos del navegador, se pierde todo.
- Considerar en el futuro: exportar/importar datos como backup (JSON).

---

## 9. Estructura del Proyecto

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                          # Home - Game selector
│   ├── jugadores/
│   │   └── page.tsx                      # Player management
│   ├── historial/
│   │   └── page.tsx                      # Game history
│   └── juego/
│       ├── generala/
│       │   └── page.tsx                  # Generala setup + board
│       ├── chinchon/
│       │   └── page.tsx                  # Chinchón setup + board
│       ├── truco/
│       │   └── page.tsx                  # Truco setup + board
│       ├── diez-mil/
│       │   └── page.tsx                  # 10.000 setup + board
│       ├── universal/
│       │   └── page.tsx                  # Universal setup + board
│       └── [id]/
│           └── resultado/
│               └── page.tsx              # Game result
├── components/
│   ├── core/
│   │   ├── GameSelector.tsx
│   │   ├── ActiveGameBanner.tsx
│   │   ├── PlayerPicker.tsx
│   │   ├── ScoreDisplay.tsx
│   │   ├── RoundInput.tsx
│   │   ├── Podium.tsx
│   │   └── PlayAgainButton.tsx
│   ├── generala/
│   │   ├── GeneralaBoard.tsx
│   │   ├── GeneralaCategoryRow.tsx
│   │   ├── GeneralaScoreInput.tsx
│   │   └── GeneralaTotals.tsx
│   ├── chinchon/
│   │   ├── ChinchonBoard.tsx
│   │   ├── ChinchonRoundInput.tsx
│   │   └── ChinchonPlayerStatus.tsx
│   ├── truco/
│   │   ├── TrucoBoard.tsx
│   │   ├── TrucoPalitos.tsx
│   │   └── TrucoControls.tsx
│   ├── diez-mil/
│   │   ├── DiezMilBoard.tsx
│   │   ├── DiezMilTurnInput.tsx
│   │   ├── DiezMilCombinationPicker.tsx
│   │   └── DiezMilTurnSummary.tsx
│   ├── universal/
│   │   ├── UniversalBoard.tsx
│   │   └── UniversalRoundInput.tsx
│   └── layout/
│       ├── AppShell.tsx
│       ├── BottomNav.tsx
│       └── ConfirmDialog.tsx
├── lib/
│   ├── db/
│   │   ├── index.ts                      # Dexie DB instance
│   │   ├── players.ts                    # Player CRUD operations
│   │   ├── games.ts                      # Game CRUD operations
│   │   └── scores.ts                     # Score operations por juego
│   ├── game-logic/
│   │   ├── generala.ts                   # Cálculos y validaciones Generala
│   │   ├── chinchon.ts                   # Lógica de eliminación Chinchón
│   │   ├── truco.ts                      # Lógica de palitos Truco
│   │   ├── diez-mil.ts                   # Combinaciones y cálculos 10.000
│   │   └── universal.ts                  # Lógica genérica
│   ├── types/
│   │   ├── game.ts                       # Tipos de juegos y configs
│   │   ├── player.ts                     # Tipo Player
│   │   └── score.ts                      # Tipos de scores por juego
│   └── utils/
│       ├── id.ts                         # Generación de UUIDs
│       └── format.ts                     # Formateo de números/puntajes
├── hooks/
│   ├── useGame.ts                        # Hook para estado de partida
│   ├── usePlayers.ts                     # Hook para gestión de jugadores
│   └── useHistory.ts                     # Hook para historial
└── public/
    ├── manifest.json                     # PWA manifest
    ├── sw.js                             # Service Worker
    └── icons/                            # App icons (192x192, 512x512)
```

---

## 10. Timeline

### Fases de desarrollo

| Fase | Duración | Entregables |
|---|---|---|
| **Fase 1 — Setup & Core** | ~1 semana (16h) | Proyecto Next.js + PWA + IndexedDB + Layout + Navegación + Gestión de jugadores |
| **Fase 2 — Truco** | ~1 semana (12h) | Setup + Board + Palitos + Lógica 15/30 (juego más simple, valida la arquitectura) |
| **Fase 3 — Generala** | ~2 semanas (24h) | Setup + Grilla de categorías + Score input + Tachar + Cálculos + Servida |
| **Fase 4 — Chinchón** | ~1 semana (16h) | Setup + Rondas + Eliminación + Chinchón instantáneo |
| **Fase 5 — 10.000** | ~1.5 semanas (20h) | Setup + Botones rápidos + Selector combinaciones + Turnos |
| **Fase 6 — Universal** | ~0.5 semanas (8h) | Setup + Rondas + Config flexible (reutiliza mucho de Chinchón) |
| **Fase 7 — Historial & Polish** | ~1.5 semanas (16h) | Historial de partidas + Volver a jugar + Resultado/Podio + PWA polish |
| **Fase 8 — Testing & QA** | ~1 semana (8h) | Testing manual en dispositivos, fix de bugs, optimización offline |

### Resumen

| Métrica | Valor |
|---|---|
| **Total estimado** | ~120 horas (~8 semanas) |
| **Con buffer (15%)** | ~138 horas (~9 semanas) |

### MVP vs Full

| Prioridad | Features | Horas |
|---|---|---|
| **P0 — MVP** | Setup + Truco + Generala + Jugadores + PWA básica | ~52h |
| **P1 — Core** | Chinchón + 10.000 + Universal | ~44h |
| **P2 — Polish** | Historial + Volver a jugar + Podio + QA | ~24h |

---

## 11. Dependencias

| Paquete | Versión | Uso |
|---|---|---|
| next | ^14.0 | Framework React fullstack |
| react | ^18.2 | UI library |
| typescript | ^5.3 | Type safety |
| tailwindcss | ^3.4 | Styling utility-first |
| dexie | ^4.0 | Wrapper IndexedDB (simple, typed) |
| next-pwa | ^5.6 | PWA support (service worker, manifest) |
| zod | ^3.22 | Validación de schemas |
| uuid | ^9.0 | Generación de IDs únicos |

---

## 12. Variables de Entorno

```bash
# App
NEXT_PUBLIC_APP_NAME="Anotador de Juegos"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

Nota: Al ser 100% client-side, prácticamente no hay variables de entorno necesarias. Esto cambiará si se agrega backend en el futuro.

---

## 13. Consideraciones Futuras (Fuera de Alcance)

- **Autenticación y backend**: Para sincronizar datos entre dispositivos.
- **Compartir partida en tiempo real**: Que todos los jugadores vean el anotador en su celular.
- **Más juegos**: Escoba de 15, Carioca, Uno, etc.
- **Estadísticas**: Quién ganó más partidas, promedios, rachas.
- **Temas y personalización**: Dark/light mode, colores de equipo.
- **Export/Import**: Exportar historial como JSON para backup.
- **Monetización**: Ads no intrusivos o versión premium sin ads.