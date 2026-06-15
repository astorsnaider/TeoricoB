# Documentación Técnica — Teoric (antes TeoricoB)
> App para estudiar el permiso de conducción B en España

**Última actualización:** 13 junio 2026  
**Versión app:** 0.6.0 (en desarrollo activo hacia 1.0)  
**Repositorio:** https://github.com/astorsnaider/TeoricoB (slug histórico)  
**Autor:** Astor Snaider

> **Nota de naming:** el producto se renombró de **TeoricoB** a **Teoric**
> (4 jun 2026) para poder cubrir en el futuro varios permisos DGT. El permiso
> B se perfecciona primero. El repositorio y algunos identificadores internos
> conservan el nombre antiguo.

---

## Índice

1. [Visión general del proyecto](#1-visión-general-del-proyecto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Stack tecnológico](#3-stack-tecnológico)
4. [Estructura de archivos](#4-estructura-de-archivos)
5. [Frontend — React Native / Expo](#5-frontend--react-native--expo)
6. [Gestión del estado](#6-gestión-del-estado)
7. [Base de datos de preguntas](#7-base-de-datos-de-preguntas)
8. [Persistencia de datos](#8-persistencia-de-datos)
9. [Seguridad](#9-seguridad)
10. [Calidad y correctness de las preguntas](#10-calidad-y-correctness-de-las-preguntas)
11. [Testing y CI/CD](#11-testing-y-cicd)
12. [Versión iOS nativa (SwiftUI)](#12-versión-ios-nativa-swiftui)
13. [Cómo ejecutar el proyecto](#13-cómo-ejecutar-el-proyecto)
14. [Registro de cambios](#14-registro-de-cambios)

---

## 1. Visión general del proyecto

### ¿Qué es Teoric?

**Teoric** es una aplicación móvil para preparar el examen teórico del permiso de conducción tipo B en España. Está inspirada en el modelo pedagógico de Duolingo: aprendizaje por lecciones cortas, gamificación progresiva y feedback inmediato.

### Objetivos pedagógicos

- Cubrir **todos los bloques temáticos** del examen DGT de conducción tipo B
- Ofrecer **explicaciones razonadas** de por qué cada respuesta es correcta o incorrecta
- Usar **gamificación** (XP, vidas, racha, liga semanal, logros) para mantener la motivación diaria
- Simular el **examen real DGT** (30 preguntas, máximo 3 errores, 30 min)

### Modelo local-first con backend opcional

- La app **funciona sin cuenta** (local-only): el progreso se guarda en el
  dispositivo con AsyncStorage. Crear cuenta es **opcional pero promovido**.
- Si el usuario **inicia sesión** (email + contraseña, verificado por código),
  su progreso se **sincroniza con Supabase** y se desbloquean las funciones
  sociales: **liga semanal real por cohortes, amigos, racha de amistad,
  clasificación en vivo**.
- Las preguntas son de **elaboración propia** (no reproducen el banco oficial
  DGT, protegido por copyright), pero fieles a la normativa vigente.

---

## 2. Arquitectura del sistema

```
┌─────────────────────────────────────────────────────┐
│                   DISPOSITIVO DEL USUARIO            │
│  ┌─────────────────────────────────────────────┐   │
│  │           APP REACT NATIVE (Expo)            │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │   │
│  │  │  Screens │  │Components│  │  Store   │  │   │
│  │  │ (vistas) │◄─┤(UI reus.)│  │(Zustand) │  │   │
│  │  └────┬─────┘  └──────────┘  └────┬─────┘  │   │
│  │       ▼                           ▼         │   │
│  │  ┌─────────────────────┐  ┌──────────────┐ │   │
│  │  │  AsyncStorage local │  │ questions.ts │ │   │
│  │  │  (progreso offline) │  │  (banco DGT) │ │   │
│  │  └─────────────────────┘  └──────────────┘ │   │
│  │            │  ▲  (syncEngine, last-write-wins)│   │
│  └────────────┼──┼─────────────────────────────┘   │
└───────────────┼──┼─────────────────────────────────┘
                ▼  │   HTTPS (solo si hay sesión)
┌─────────────────────────────────────────────────────┐
│                 SUPABASE (backend)                  │
│  - Auth (email+contraseña, OTP por código)           │
│  - Postgres con RLS: profiles, user_progress,        │
│    friendships, league_cohorts/members/state, …      │
│  - RPCs SECURITY DEFINER (amigos, liga, leaderboard) │
└─────────────────────────────────────────────────────┘
```

### Decisión de diseño: local-first + backend opcional

La app arranca **offline-first** (funciona sin cuenta) y añade un **backend
en Supabase** que solo entra en juego cuando el usuario inicia sesión:

| Aspecto | Cómo se resuelve |
|---|---|
| **Sin cuenta** | Todo el progreso vive en AsyncStorage; la app es 100% usable offline. |
| **Con cuenta** | El blob del store se sincroniza a `user_progress` (last-write-wins); se activan liga real por cohortes, amigos y racha de amistad. |
| **Autoridad** | Datos personales/competitivos sensibles (liga competitiva, amistades) son **server-owned** vía RPCs con RLS, no editables por el cliente. |
| **Privacidad** | Sin sesión no sale nada del dispositivo; con sesión aplica la política de privacidad y el borrado RGPD (`delete_my_account`). |

Las "ligas" y "amigos" **ya NO son simulados**: son reales contra Supabase
(con un fallback simulado solo cuando no hay sesión).

---

## 3. Stack tecnológico

### App principal — React Native + Expo (SDK 54)

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **Expo SDK** | ~54.0 | Framework de desarrollo multiplataforma |
| **React Native** | 0.81.5 | UI nativa para iOS y Android |
| **React** | 19.1 | — |
| **TypeScript** | ~5.9 | Tipado estático |
| **Zustand** | ^4.4 | Estado global (ligero) + middleware `persist` |
| **AsyncStorage** | ^2.2 | Persistencia local |
| **@supabase/supabase-js** | ^2.107 | Cliente del backend (auth, Postgres, RPCs) |
| **expo-notifications** | ~0.32 | Notificaciones locales (recordatorios, racha, sociales) |
| **expo-camera** | ~17.0 | Escáner de QR para añadir amigos |
| **react-native-qrcode-svg** | ^6.3 | Generación del QR propio |
| **expo-contacts** | ~15.0 | Buscar amigos por contactos (hash de email) |
| **expo-crypto** | ~15.0 | SHA-256 del email para el matching de contactos |
| **expo-image-picker** | ~17.0 | Foto de perfil |
| **react-native-pager-view** | 6.9 | Swipe horizontal entre tabs y carouseles |
| **react-native-gesture-handler** | ~2.28 | Swipe-back desde el borde (estilo iOS) |
| **react-native-confetti-cannon** | ^1.5 | Confeti en logros / resultados / cierre de liga |
| **expo-haptics** | ~15.0 | Vibración táctil |
| **expo-linear-gradient** | ~15.0 | Gradientes |
| **react-native-svg** | ^15.12 | Iconos SVG de señales |
| **expo-updates** | ~29.0 | OTA updates (canal preview/production con EAS) |
| **expo-audio** | ~1.1 | Efectos de sonido |

### Backend — Supabase

| Componente | Propósito |
|---|---|
| **Supabase Auth** | Cuentas email+contraseña, verificación por código OTP, reset y cambio de email/contraseña |
| **Postgres + RLS** | Tablas con Row-Level Security: `profiles`, `user_progress`, `friendships`, `league_state/cohorts/members`, … |
| **RPCs (SECURITY DEFINER)** | Operaciones controladas: amigos, racha de amistad, liga por cohortes, leaderboard, borrado RGPD |
| **EAS** | Build/submit a tiendas (perfiles dev/preview/production en `eas.json`) |

### App iOS nativa (legacy) — SwiftUI

Existe una implementación SwiftUI antigua en `TeoricoB.swiftpm` que **ya no se
mantiene** (quedó congelada antes de añadir backend, amigos y liga real). La
app activa es la de React Native/Expo.

### Herramientas de desarrollo

| Herramienta | Propósito |
|------------|---------|
| **Git + GitHub** | Control de versiones |
| **Supabase MCP** | Aplicar migraciones SQL al proyecto desde el entorno de desarrollo |
| **EAS CLI** | Builds en la nube (iOS/Android) y OTA updates |
| **`npx tsc --noEmit`** | Verificación de tipos antes de cada commit |
| **`npx expo export --platform web`** | Verificación de que el bundle compila |
| **Expo Go** | Testing rápido (limitado: sin cámara/notifs nativas) |

### ¿Por qué Zustand y no Redux?

Redux añade mucho boilerplate para un proyecto de este tamaño. Zustand ofrece:
- API simple (un solo hook)
- Compatibilidad nativa con `persist` para AsyncStorage
- Sin providers envolventes (más sencillo en Expo)
- Rendimiento equivalente o mejor

---

## 4. Estructura de archivos

```
proyectos/Teorico/
│
├── DOCUMENTACION_TECNICA.md        ← Este documento
├── AUDITORIA_PREGUNTAS.md          ← Informe de auditoría del banco
│
├── TeoricoB-expo/                  ← App React Native (principal)
│   ├── App.tsx                     ← Entry point: 5 tabs (PagerView), gestos, deep links
│   ├── app.json                    ← Config Expo: scheme teoric://, permisos, plugins
│   ├── eas.json                    ← Perfiles de build EAS (dev/preview/production)
│   ├── .env.local                  ← EXPO_PUBLIC_SUPABASE_URL / _ANON_KEY (gitignored)
│   ├── supabase/
│   │   └── schema.sql              ← Esquema completo (tablas, RLS, RPCs) versionado
│   ├── scripts/
│   │   └── audit_question_bias.py  ← Detector de sesgos de forma en el banco
│   └── src/
│       ├── api/        supabase.ts            ← Cliente Supabase + isSupabaseConfigured
│       ├── auth/       AuthContext.tsx, AuthScreen.tsx  ← Sesión, signup/login/OTP, cambio email/pass
│       ├── sync/       syncEngine.ts, useAutoSync.ts, useCohort.ts, useLeaderboard.ts, useSyncStatus.ts
│       ├── friends/    useFriends.ts, contacts.ts       ← Amigos, racha de amistad, contactos
│       ├── notifications/ scheduler.ts                  ← Notificaciones locales (recordatorio, racha, sociales)
│       ├── store/      useStore.ts             ← Estado global (Zustand + persist)
│       ├── data/       questions.ts (320), manualContent.ts, signCatalog.ts, examTemplates.ts
│       ├── legal/      config.ts, legalTexts.ts, manualLinks.ts
│       ├── hooks/      useTheme.ts
│       ├── audio/      useSoundEffect.ts
│       ├── theme.ts    types/index.ts  types/database.ts  utils/
│       ├── components/ QuizModal, ExamRunModal, ManualChapterModal, SubPage, TabPager(.web),
│       │               PagerControl, ConfettiBurst, AchievementUnlockModal, LeagueResultModal,
│       │               AvatarView, TrafficSign, TrafficScene, RoadScenario, TopicIcon
│       └── screens/    Onboarding, Tutorial, Disclaimer, Home, Learn, Manual, League, Profile,
│                       ProfileEdit, Settings, Preferences, Notifications, Privacy, Legal,
│                       Stats, Friends, FriendProfile, QRFriend, ExamList, ComingSoon
│
└── TeoricoB.swiftpm/               ← App SwiftUI (legacy, congelada)
```

---

## 5. Frontend — React Native / Expo

### Pantallas y responsabilidades

#### `App.tsx` — Orquestador principal
- Gatekeeping de arranque: Disclaimer → Onboarding → Tutorial → app.
- **5 tabs** (Inicio, Aprender, Manual, Liga, Perfil) con **swipe horizontal**
  vía `react-native-pager-view` (`TabPager`), envuelto en `GestureHandlerRootView`.
- Barra inferior que se **oculta** al entrar en subpáginas (`PagerControl`).
- Maneja **deep links** `teoric://u/<username>` (añadir amigo) y la apertura
  del Manual desde otras pantallas.
- Programa notificaciones locales y reproduce sonidos según cambios del store.
- Muestra el modal animado de logro desbloqueado (`AchievementUnlockModal`).

#### `OnboardingScreen.tsx` / `TutorialScreen.tsx` — Primer uso
- Carrusel (PagerView) theme-aware. Onboarding: bienvenida → nombre → color →
  cuenta (crear/entrar o saltar). Tutorial: 5 slides explicando lecciones,
  fallos, exámenes, liga y manual.
- `DisclaimerScreen` muestra el aviso legal obligatorio antes de usar la app.

#### `HomeScreen.tsx` — Dashboard
- Saludo personalizado con nombre y emoji del usuario
- Contador de racha (días consecutivos)
- Tarjetas de estadísticas: XP total, vidas, liga actual
- Barra de progreso hacia el siguiente nivel (cada 100 XP = 1 nivel)
- Reto diario (10 preguntas aleatorias, +50 XP, se resetea cada día)
- Acceso rápido a los 4 temas con más reciente actividad
- Botón de Examen Simulado (30 preguntas, criterios DGT reales)

#### `LearnScreen.tsx` — Aprendizaje
- Lista de todos los temas con icono SVG, progreso y metadata
- Al pulsar un tema → `TopicDetail` con sus lecciones
- Cada lección muestra dificultad, número de preguntas y estado (completada/pendiente)
- Al pulsar una lección → `QuizModal`

#### `QuizModal.tsx` — El corazón de la app
- Muestra una pregunta a la vez con **3 opciones (A/B/C)**, como el examen real DGT
- Bloqueo por vidas: si el usuario tiene 0 vidas, muestra la pantalla "Sin vidas 💔"
- Al seleccionar respuesta: feedback visual inmediato (verde/rojo), vibración háptica
- Explicación de la respuesta correcta siempre visible tras responder
- Animación de temblor en la respuesta incorrecta
- Botón "Continuar" con color según si fue correcta o no
- Pantalla de resultados con estadísticas: correctas, fallos, %, nota y XP ganados
- Modo examen: permite hasta 3 fallos (criterio DGT real), no bloquea por vidas

#### `ManualScreen.tsx` — Manual del conductor
- 18 capítulos de teoría + catálogo de señales (`signCatalog.ts`) y escenarios.
- Navegación interna a capítulo/grupo de señales como `SubPage` (slide-in +
  swipe-back). Se puede abrir un capítulo concreto desde el quiz al fallar
  (`ManualChapterModal` flotante, sin perder la pregunta).

#### `LeagueScreen.tsx` — Liga semanal por cohortes
- Hero con la liga actual y **contador "Termina en Xd Yh"**.
- **Cohorte de ~30** (de `useCohort`): podio top 3 + lista con **zona de
  ascenso** (verde, top 7) y **zona de descenso** (roja, últimos 5); tu fila
  resaltada. Fallback simulado si no hay sesión.
- Sección **Amigos** (reales) con XP semanal; botón a `FriendsScreen`.
- `LeagueResultModal` al cerrar la semana (asciendes/te mantienes/desciendes).
- Grid de todas las ligas (Bronce → Diamante).

#### `FriendsScreen.tsx` / `FriendProfileScreen.tsx` — Amigos
- Mi `@username` + compartir enlace, **buscador** por username, **importar
  contactos** (matching por hash de email), **QR** (`QRFriendScreen`).
- Solicitudes recibidas/enviadas (aceptar/rechazar/cancelar), lista de amigos
  con **racha de amistad** (🔥 compartida). Tocar un amigo abre su perfil con
  stats y botón **eliminar**.

#### `SettingsScreen` + sub-pantallas — Ajustes
- Hub con: **Perfil** (`ProfileEditScreen`: foto, nombre, @username, contraseña,
  email con verificación, borrar cuenta), **Preferencias** (modo oscuro,
  sonidos), **Notificaciones**, **Privacidad**, **Estadísticas** (`StatsScreen`),
  **Legal** y secciones "Próximamente" (`ComingSoonScreen`).

#### `ProfileScreen.tsx` — Perfil del usuario
- Avatar y nombre del usuario
- Badge de liga actual
- 6 estadísticas: XP total, racha, lecciones completadas, % acierto, vidas, gemas
- Barra de progreso por cada tema
- Grid de todos los logros (desbloqueados en color, bloqueados en gris)
- Botón de reiniciar progreso (con confirmación)

#### `ProfileEditScreen.tsx` — Edición de cuenta
Accesible desde Ajustes → Perfil. Permite editar:
- **Foto / color de avatar**, **nombre visible** y **@username** (con cooldown
  de 14 días, validado en el backend).
- **Contraseña**: modal con *actual / nueva / repetir*. Se re-verifica la
  contraseña actual con `reauthenticate()` (re-login silencioso) antes de
  llamar a `updatePassword()` → `supabase.auth.updateUser({ password })`.
- **Email**: modal en 2 pasos. Paso 1 = nuevo email + contraseña →
  `reauthenticate()` + `changeEmail()` (`updateUser({ email })`, envía código
  de 6 dígitos al nuevo correo). Paso 2 = código →
  `verifyEmailChange()` (`verifyOtp({ type: 'email_change' })`).
- **Teléfono**: "Próximamente" (requiere proveedor SMS de pago en Supabase).

Config Supabase necesaria para el cambio de email por código: plantilla
"Change Email Address" con `{{ .Token }}` y ajuste **"Secure email change" OFF**
(si no, exige confirmar también el email antiguo → dos códigos).

Los métodos de auth viven en `src/auth/AuthContext.tsx`:
`reauthenticate`, `changeEmail`, `verifyEmailChange`, `updatePassword`.

### Sistema de vidas (corazones)

```
Estado inicial:    ❤️❤️❤️❤️❤️  (5/5)
Error en quiz:     ❤️❤️❤️❤️🤍  (4/5) → pierde 1
Sin vidas:         🤍🤍🤍🤍🤍  (0/5) → bloqueado

Regeneración:      +1 vida cada 30 minutos automáticamente
Compra:            10 gemas → +1 vida (si gems >= 10)
```

El tiempo de regeneración se calcula en el cliente comparando `lastHeartRegenTime` (guardado en AsyncStorage) con la hora actual.

### Sistema de XP, niveles y techo por lección

```
Nivel = Math.floor(XP_total / 100) + 1   (permanente, nunca baja)

XP de una lección = (nº_preguntas − fallos) × 10
  · Solo se otorga al TERMINAR la lección.
  · Cada lección tiene un techo: rehacerla solo da el delta de mejora
    (user.lessonStats[lessonId] = { bestWrong, xpClaimed }). No se puede
    farmear repitiendo.
Reto diario:  +50 XP fijo.
Repaso de fallos:  XP reducido.
```

El mismo XP suma a la vez al **XP total** (nivel) y al **XP semanal** (liga).

### Liga semanal por cohortes (estilo Duolingo)

La liga **ya no** es un escalón permanente por XP total. Es una competición
**semanal** server-owned (Supabase):

- Estás en una **cohorte de ~30** personas de tu mismo nivel de liga.
- El `weekly_xp` se **resetea cada lunes** (lo hace el cliente al detectar
  semana nueva; el servidor toma snapshot del `score`).
- Al cerrar la semana: **top 7 ascienden**, **últimos 5 descienden** (Bronce no
  baja, Diamante no sube). Ascender y el top 3 dan gemas.
- Tablas: `league_state` (liga actual autoritativa), `league_cohorts`,
  `league_cohort_members`. RPCs: `sync_league()`, `get_my_cohort()`.

| Niveles de liga (de menor a mayor) |
|---|
| Bronce · Plata · Oro · Zafiro · Rubí · Esmeralda · Amatista · Diamante |

> Los umbrales de XP de versiones anteriores ya **no** determinan la liga.

### Iconos SVG de señales

Cada tema tiene su propio icono SVG dibujado con `react-native-svg`, imitando señales de tráfico reales:

| Tema | Icono SVG |
|------|-----------|
| Señales de Tráfico | Señal triangular de peligro (!) |
| Velocidades | Señal circular de limitación (120) |
| Preferencia de Paso | Señal octogonal STOP |
| Alcohol y Drogas | Círculo prohibido con vaso de cerveza |
| Distancias | Dos coches con flecha de distancia |
| Primeros Auxilios | Cruz roja sobre círculo |
| El Vehículo | Coche con ruedas y ventanas |
| Conducción Eficiente | Árbol/hoja verde |
| Infracciones y Sanciones | Ticket de multa con símbolo € |
| La Vía y el Entorno | Carretera en perspectiva |

---

## 6. Gestión del estado

### Zustand Store (`useStore.ts`)

Todo el estado de la app vive en un único store de Zustand con persistencia automática en AsyncStorage.

#### Estado persistido del usuario (campos principales):

```typescript
interface UserState {
  name, avatarEmoji, profilePhotoUri      // identidad local
  xp, streak, hearts, maxHearts, gems     // progreso y economía
  lastHeartRegenTime, lastActiveDate
  league: LeagueType                       // liga (cache de display; autoritativa en backend)
  weeklyXP, weeklyResetAt                  // XP de la liga semanal + marca de reset
  completedLessons[], completedTopics[]
  lessonStats: Record<lessonId, { bestWrong, xpClaimed, completedAt }>  // techo de XP por lección
  achievements[], totalCorrect, totalAnswered
  topicStats, examHistory, examTemplateStats, mistakes   // analítica y repaso
  streakFreeze* , dailyQuestStreak
  lastLeagueRewardWeek                     // dedupe del premio semanal de liga
  // friends[] solo se usa como fallback simulado sin sesión
}
```

> El **@username**, la foto en la nube y la liga competitiva **no** viven en
> este blob: están en `profiles` / `league_state` (Supabase), gestionados por
> RPCs. El cliente los lee, no los "empuja".

#### Estado no persistido (regenerado en cada sesión):
`topics`, `leagueStandings` (fallback simulado), `dailyChallenge`,
`dailyQuests`, `newAchievement`, flags de UI / deep-link
(`requestedManualChapter`, `pendingFriendUsername`).

#### Clave de persistencia en AsyncStorage: `'teoricob-v2'`

> La clave está versionada; la función `merge` del middleware `persist` fusiona
> datos guardados con `defaultUser` para no perder progreso al añadir campos.

---

## 7. Base de datos de preguntas

### Origen de las preguntas

Las preguntas de la app son de **elaboración propia**, basadas en:

| Fuente oficial | Documento/URL |
|----------------|---------------|
| **Reglamento General de Circulación** | Real Decreto 1428/2003 (y modificaciones posteriores) |
| **Reglamento General de Conductores** | Real Decreto 818/2009 |
| **Reforma de velocidades urbanas (2021)** | Instrucción 2021/V-046 DGT, en vigor desde 11 mayo 2021 |
| **Ley sobre Tráfico (LSV)** | Real Decreto Legislativo 6/2015, texto refundido |
| **Catálogo oficial de señales** | Publicación DGT "Señales de tráfico" (última edición) |
| **Normativa sobre alcohol y drogas** | Artículos 20-22 RGC; Real Decreto 1217/2009 |
| **Sistema de permiso por puntos** | Ley 17/2005 (modificada por Ley 6/2014) |
| **Normativa de ITV** | Real Decreto 920/2017 |
| **Etiquetas medioambientales DGT** | Resolución DGT de 20 de enero de 2016 (y actualizaciones) |

> ⚠️ **Importante:** Las preguntas NO son reproducción literal de los cuestionarios oficiales DGT (que están protegidos por derechos de autor). Todas las preguntas están redactadas de forma original por el autor, aunque el contenido técnico es fiel a la normativa vigente.

### Estructura de una pregunta

```typescript
interface Question {
  id: string          // Identificador único, ej: 's1q1'
  text: string        // Enunciado de la pregunta
  options: string[]   // Siempre exactamente 3 opciones (formato DGT: A, B, C)
  correctIndex: number // Índice (0-3) de la opción correcta
  explanation: string  // Explicación detallada de por qué es correcta
  category: string    // Categoría para estadísticas
  legalRef?: string   // Artículo legal (ej. "Art. 132 RGC")
  signId?: string     // Señal SVG a mostrar
  sceneId?: string    // Escenario cenital a mostrar
}
```

> **Banco actual: 320 preguntas.** Tras la auditoría de v0.6 se hizo además una
> pasada **anti-sesgos de forma** (que la opción correcta no se delate por ser
> más larga, tener paréntesis, etc.): `scripts/audit_question_bias.py` reporta
> **0% de sesgos delatadores** en las 320 preguntas.

### Distribución de preguntas por tema (referencia v0.6.0; total actual: 320)

| Tema | Lecciones | Preguntas | Con imagen |
|------|-----------|-----------|-----------|
| Señales de Tráfico | 5 | 46 | ~32 (con SVG Wikimedia) |
| Velocidades | 3 | 31 | 11 (con SVG de velocidad) |
| Preferencia de Paso | 3 | 28 | 3 (con SVG) |
| Alcohol y Drogas | 3 | 26 | — |
| Distancias y Adelantamiento | 2 | 24 | 3 (con SVG) |
| Primeros Auxilios | 2 | 25 | — |
| El Vehículo | 4 | 38 | — |
| Conducción Eficiente | 2 | 21 | — |
| Infracciones y Sanciones | 2 | 19 | — |
| La Vía y el Entorno | 4 | 42 | — |
| **TOTAL** | **30** | **300** | **~50** |

> Las preguntas con imagen muestran la señal SVG correspondiente durante el quiz. Las señales están referenciadas por su código oficial DGT (ej. "Señal R-2" para STOP).

> El examen simulado toma 30 preguntas aleatorias del pool completo, igual que el examen real de la DGT.

### Criterios de calidad de las preguntas

Cada pregunta debe cumplir:

1. **Veracidad:** La respuesta correcta debe ser verificable en la normativa oficial vigente
2. **Claridad:** El enunciado es inequívoco, sin dobles interpretaciones
3. **Distractores razonables:** Las 3 opciones incorrectas son plausibles (no absurdas)
4. **Explicación educativa:** La explicación no solo dice qué es correcto, sino POR QUÉ
5. **Actualización:** Se revisa cuando cambia la normativa (última revisión: mayo 2026)

---

## 8. Persistencia de datos

### AsyncStorage

La app usa `@react-native-async-storage/async-storage` para guardar el estado del usuario de forma persistente en el dispositivo.

```
Clave:   'teoricob-v2'
Formato: JSON serializado por Zustand/persist
Dónde:   Almacenamiento interno del dispositivo (no iCloud, no Google Drive)
```

#### Lo que se guarda:
- Perfil del usuario (nombre, avatar, XP, racha, liga, vidas...)
- Lecciones y temas completados
- Logros desbloqueados
- Estado del reto diario

#### Lo que NO se guarda (se regenera en cada inicio):
- Clasificación de la liga (cohorte real desde Supabase, o fallback simulado)
- Nuevos logros pendientes de mostrar
- Los temas y preguntas (están hardcoded en `questions.ts`)

### Sincronización con la nube (solo con sesión)

Cuando hay sesión Supabase, `src/sync/` mantiene el progreso en la nube:

- **`syncEngine.ts`** — `pushProgress()` hace `upsert` del blob completo del
  store en `user_progress` (columnas extraídas: `xp`, `weekly_xp`, `streak`,
  `league`, `last_active_date`, … + `state_blob` JSONB). Estrategia
  **last-write-wins** por el cliente. `pullProgress()` descarga el blob remoto.
- **`useAutoSync.ts`** — al iniciar sesión hace un pull y resuelve conflicto por
  "más XP gana"; luego empuja con **debounce de 5 s** ante cualquier cambio
  persistido; hace flush al cerrar sesión.
- **`useCohort.ts` / `useLeaderboard.ts`** — leen la liga semanal real.
- **`useSyncStatus.ts`** — estado de sync para el indicador del perfil.

> El `weekly_xp` y el `streak` son client-owned (viajan en el blob); la liga
> competitiva y las amistades son server-owned (RPCs), para que no sean
> trampeables.

### Migración de datos entre versiones

El middleware `persist` de Zustand incluye una función `merge` que fusiona los datos guardados con el esquema por defecto:

```typescript
merge: (persisted: any, current) => ({
  ...current,
  ...persisted,
  user: { ...defaultUser, ...(persisted as any)?.user, friends: MOCK_FRIENDS },
})
```

Esto garantiza que si añadimos nuevos campos al estado (como `lastHeartRegenTime` en v0.3), los usuarios con datos antiguos no pierden su progreso.

---

## 9. Seguridad

### Modelo de seguridad (con backend)

La app **sin sesión** sigue siendo offline (sin datos en la nube). **Con
sesión** entran auth real, datos personales y permisos del sistema. Las
consideraciones:

#### 9.1 Autenticación

- **Email + contraseña** vía Supabase Auth. El registro exige verificación por
  **código OTP de 6 dígitos** enviado al correo (no link, para que funcione
  igual en iOS/Android/Web).
- **Reset** y **cambio de contraseña/email** soportados; el cambio sensible
  re-verifica la contraseña actual (`reauthenticate`).
- Las claves del proyecto se leen de `.env.local`
  (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`); en builds EAS
  se inyectan como variables de entorno. La **anon key** es pública por diseño;
  la seguridad real la da **RLS**.

#### 9.2 Row-Level Security y RPCs

- Todas las tablas con datos de usuario tienen **RLS**: cada uno solo ve/edita
  lo suyo (`profiles`, `user_progress`, `friendships`, …).
- Las operaciones que cruzan usuarios (ver leaderboard, gestionar amistades,
  calcular liga) usan **funciones `SECURITY DEFINER`** que exponen solo los
  campos públicos mínimos y validan `auth.uid()`.
- Los datos competitivos (liga, amistades) son **server-owned**: el cliente no
  puede falsificarlos por mucho que manipule su store local.

#### 9.3 Permisos del sistema (solo cuando se usan)

| Permiso | Cuándo | Para qué |
|---|---|---|
| **Notificaciones** | al activarlas | recordatorio diario, racha, vidas, sociales |
| **Cámara** | al escanear QR de un amigo | añadir por QR (`expo-camera`) |
| **Contactos** | al pulsar "importar contactos" | encontrar amigos (solo se envían **hashes SHA-256** de emails, nunca el email en claro) |
| **Galería** | al cambiar la foto de perfil | `expo-image-picker` |
| **Háptica** | siempre | vibración (no requiere permiso) |

#### 9.4 Privacidad de contactos

El matching de contactos **nunca** sube emails ni la libreta: se calcula
`sha256('teoric_v1:'+email)` en el dispositivo y solo se envían los hashes a la
RPC `find_users_by_email_hashes`. No se almacena nada de la libreta.

#### 9.5 RGPD / LOPD

Con backend **sí** se tratan datos personales (email, progreso en la nube), por
lo que aplica:
- **Política de privacidad** y aviso legal (en `src/legal/`, accesibles desde
  Ajustes y obligatorios en el `DisclaimerScreen` de arranque).
- **Derecho de supresión (Art. 17)**: la RPC `delete_my_account` borra los datos
  del usuario; el registro de `auth.users` se purga después.
- Datos mínimos: solo email + lo necesario para el producto.

---

## 10. Calidad y correctness de las preguntas

### Proceso de verificación

Cada pregunta pasa por el siguiente proceso antes de incluirse:

```
1. REDACCIÓN
   └─ Se formula la pregunta basada en el artículo/norma específica

2. VERIFICACIÓN NORMATIVA
   └─ Se comprueba que la respuesta correcta es fiel al texto legal vigente
   └─ Se anota la fuente normativa (RGC, LSV, circular DGT...)

3. REVISIÓN DE DISTRACTORES
   └─ Las 3 opciones incorrectas son razonables pero claramente erróneas
   └─ Ningún distractor puede ser "técnicamente correcto también"

4. EXPLICACIÓN EDUCATIVA
   └─ La explicación cita la razón real (no solo repite la respuesta)
   └─ Añade contexto útil para el aprendizaje

5. REVISIÓN DE ACTUALIDAD
   └─ Se verifica que la norma no ha sido modificada o derogada recientemente
```

### Áreas de especial atención

Estas áreas de la normativa han sufrido cambios recientes y se revisan con especial cuidado:

| Área | Cambio | En vigor desde |
|------|--------|---------------|
| Velocidades urbanas | 50→30 km/h en calles de un carril | 11 mayo 2021 |
| Multas por móvil al volante | 200€ + 6 puntos | 21 marzo 2022 |
| Cinturones y SRI | Obligatorio en microbuses | 2021 |
| Adelantamiento a ciclistas | Mínimo 1,5 m lateral | 2015 (reforzado 2022) |

### Limitaciones conocidas

- Las preguntas de señales no incluyen **imágenes de señales reales** (trabajo futuro)
- Los escenarios de **primeros auxilios** siguen las guías ERC 2021, que pueden actualizarse
- Las **multas en euros** pueden variar por inflación y actualizaciones del Código de Circulación

---

## 11. Testing y CI/CD

### Verificación por cambio (obligatoria antes de commit)

| Comando | Qué verifica |
|--------|----------------|
| `npx tsc --noEmit` | Que no hay errores de tipos en toda la app |
| `npx expo export --platform web` | Que el bundle compila (detecta imports nativos rotos en web) |

### Testing manual

| Método | Herramienta | Qué se verifica |
|--------|------------|----------------|
| Dispositivo (JS) | Expo Go | UI, flujo, gestos, hápticos, sync básico |
| Build nativa | EAS preview (.ipa/.apk) | Cámara (QR), notificaciones, contactos, deep links |
| Web | Expo Web | Compatibilidad básica (cámara/QR/notifs caen a fallback) |

> Las funciones que dependen de permisos nativos (cámara, contactos,
> notificaciones) **no** se pueden probar del todo en Expo Go ni en web:
> requieren una **build EAS** (perfil `preview`).

### Migraciones de base de datos

El esquema vive versionado en `TeoricoB-expo/supabase/schema.sql`. Los cambios
se aplican al proyecto Supabase (`putsyjnzqqbptqrlcdrd`) con el **MCP de
Supabase** (`apply_migration`) y se reflejan en ese archivo para tener historia.

### CI/CD — GitHub Actions

**Archivo:** `.github/workflows/build.yml`

El workflow se ejecuta automáticamente en cada `git push`:

```yaml
Trigger:  push a cualquier rama
Runner:   macos-15 (con Xcode 16.2)
Pasos:
  1. Checkout del código
  2. Build con xcodebuild para iOS Simulator (iPhone 16)
  3. Si el build falla → el commit queda marcado con ❌ en GitHub
```

**Qué verifica el CI:**
- ✅ El código Swift compila sin errores
- ✅ No hay referencias a tipos o funciones inexistentes
- ✅ El Package.swift está correctamente configurado

**Qué NO verifica el CI (trabajo futuro):**
- ❌ Tests unitarios (no escritos todavía)
- ❌ Tests de UI automatizados
- ❌ Correctness del contenido de las preguntas
- ❌ Build de la app React Native/Expo

### Testing de la versión React Native

Actualmente el testing de la versión React Native se hace exclusivamente de forma **manual con Expo Go**. Los pasos son:

```bash
# En el PC (con el móvil en la misma red WiFi):
cd TeoricoB-expo
npx expo start --lan

# En el iPhone/Android:
# Abrir Expo Go → escanear QR o introducir URL manualmente
# URL: exp://[IP_LOCAL]:8081
```

---

## 12. Versión iOS nativa (SwiftUI)

Existe una segunda implementación de la misma app en **SwiftUI** (carpeta `TeoricoB.swiftpm`), mantenida en paralelo como implementación nativa de iOS.

### Diferencias respecto a la versión React Native

| Aspecto | React Native (Expo) | SwiftUI |
|---------|--------------------|----|
| Plataformas | iOS + Android + Web | Solo iOS/macOS |
| Testing | Expo Go (cualquier iOS) | Requiere Xcode o Swift Playgrounds (iOS 17+) |
| Distribución | Expo + App Store | App Store |
| Rendimiento | Muy bueno | Nativo (máximo posible) |
| Estado actual | Principal (activa) | Secundaria (referencia) |

### Estructura SwiftUI

```
TeoricoBApp.swift      → @main, decide onboarding vs app principal
AppViewModel.swift     → ObservableObject con toda la lógica de negocio
QuizViewModel.swift    → Estado de una sesión de quiz
QuestionsDatabase.swift→ Preguntas DGT (mismo contenido que questions.ts)
Views/                 → HomeView, LearnView, QuizView, LeagueView, ProfileView
Models/                → User, Question, Topic, Lesson, LeagueType
Extensions/            → Color+Theme, ShakeModifier, haptic()
```

---

## 13. Cómo ejecutar el proyecto

### Requisitos previos

```
- Windows 10/11 (o macOS/Linux)
- Node.js 18+ (instalado con: winget install OpenJS.NodeJS.LTS)
- Git (instalado con: winget install Git.Git)
- iPhone o Android con Expo Go instalado
```

### Iniciar la versión React Native

```bash
# 1. Clonar el repositorio
git clone https://github.com/astorsnaider/TeoricoB.git
cd TeoricoB/TeoricoB-expo

# 2. Instalar dependencias
npm install --legacy-peer-deps

# 3. Iniciar el servidor de desarrollo (red local)
npx expo start --lan

# 4. En el móvil:
#    - Abrir Expo Go
#    - Pulsar "Enter URL manually" o escanear el QR
#    - Introducir: exp://[TU_IP_LOCAL]:8081
```

### Iniciar la versión SwiftUI (requiere Mac o iPad)

```bash
# En Mac con Xcode:
cd TeoricoB/TeoricoB.swiftpm
open .  # Abre en Xcode automáticamente

# En iPad con Swift Playgrounds:
# 1. Copiar la carpeta TeoricoB.swiftpm a iCloud Drive
# 2. Abrir desde la app Archivos en el iPad
# 3. Swift Playgrounds la reconoce como paquete ejecutable
```

### Variables de entorno

La app funciona offline sin configuración, pero para activar el backend
(cuenta, liga real, amigos) hace falta un archivo **`.env.local`** en
`TeoricoB-expo/` (gitignored):

```bash
EXPO_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key del proyecto>
```

Sin estas variables, `isSupabaseConfigured` es `false` y la app cae a modo
local + datos simulados. En builds EAS se suben como variables de entorno del
perfil (`eas env:create`).

---

## 14. Registro de cambios

### En curso — Junio 2026 (post v0.6): backend, social y liga real

Gran bloque de trabajo que convierte la app de offline-only a **local-first con
backend Supabase**:

**Backend y cuentas**
- Supabase: auth email+contraseña con verificación por **código OTP**; tablas
  con RLS (`profiles`, `user_progress`, `friendships`, liga); RPCs
  `SECURITY DEFINER`; sync del store (last-write-wins) con `useAutoSync`.
- **Edición de cuenta**: cambiar contraseña y **email con verificación**
  (re-login para confirmar la actual). Teléfono "Próximamente" (necesita SMS).
- Borrado de cuenta RGPD (`delete_my_account`), indicador de sync, disclaimer.

**Social**
- **Amigos reales**: `@username` (único, cooldown 14 días), buscador, importar
  **contactos** (matching por hash de email, sin subir emails), **QR**
  (generar + escanear), compartir enlace `teoric://u/<username>` (deep link).
- Gestor de amigos: ver perfil, eliminar; solicitudes recibidas/enviadas.
- **Racha de amistad** compartida (estilo Duolingo) entre cada pareja.
- **Notificaciones sociales**: nueva solicitud, racha de amistad en peligro,
  un amigo te supera en XP.

**Liga semanal por cohortes**
- Reemplaza el ranking global por escalón de XP. Cohortes de ~30, **reseteo
  semanal** del XP, **ascensos/descensos** (top 7 / últimos 5), premios en
  gemas, modal de cierre de semana. Tablas `league_state/cohorts/members`.

**Pedagogía y UX**
- Banco a **320 preguntas** con auditoría **anti-sesgos de forma** (0%).
- Lecciones con **techo de XP** (no farmeable) y tracking de fallos por lección.
- Manual accesible como **modal flotante** desde el quiz al fallar.
- **Movimiento iOS**: swipe entre tabs (PagerView), swipe-back desde el borde,
  subpáginas con slide-in, tab bar que se oculta.
- Rediseño estilo Duolingo de **Perfil** (+ hub de Ajustes), **Liga**,
  **Onboarding/Tutorial** (carrusel), **resultados de quiz** y **logros** (con
  confeti). Recomendaciones de lecciones en Inicio.
- Rebranding **TeoricoB → Teoric**; bundle IDs e config EAS.

---

### v0.6.0 — Mayo 2026

**Auditoría completa y reescritura del banco de preguntas:**

Tras detectar que muchas preguntas eran demasiado simples (definiciones puras tipo "¿qué forma tiene una señal de peligro?") o tenían distractores absurdos comparados con el examen real DGT, se hizo una auditoría exhaustiva una a una de las 220 preguntas existentes y se documentó el resultado en `AUDITORIA_PREGUNTAS.md`.

**Fase A — Auditoría:** Clasificación pregunta a pregunta. Resultado: 80% buenas (177), 16% mejorables (36) y 3% erróneas (7). El cuello de botella era el Tema 1 (Señales) con 67% de problemas.

**Fase B — Corrección y reescritura (43 cambios):**

3 errores fácticos corregidos:
- `v3q1` — Velocidad noveles: el límite específico de 100 km/h para conductores noveles está derogado desde 2014. Cambiada respuesta y explicación.
- `inf2q5` — Conducir sin seguro NO descuenta puntos (está regulado por la LRCSCVM, no por la LSV). Cambiada respuesta y explicación.
- `s4q12` — Explicación de la R-500 corregida: cancela TODAS las prohibiciones, incluida la de adelantar (antes decía lo contrario).

5 preguntas eliminadas por trivia/duplicidad: `s1q7`, `s2q7`, `v3q4`, `v3q5`, `p3q10`.

27 preguntas del Tema Señales reescritas con patrón DGT real: escenarios prácticos en lugar de definiciones, distractores plausibles (señales visualmente similares en vez de conceptos absurdos), referencias legales explícitas.

8 ajustes menores en preguntas con imprecisiones (`v2q6`, `p2q5`, `a2q4`, `a3q5`, `vh1q3`, `inf1q3`, `inf2q2`, `va1q1`).

**Fase C — Ampliación (+43 nuevas):**

- Señales sen_l5: +9 preguntas usando signIds Wikimedia disponibles (cadenas, doble curva, zona peatonal, carril bici, prohibido girar derecha, prohibido adelantar camiones, calzada irregular, peligro genérico, jerarquía completa de señalización).
- Velocidades vel_l3: +5 preguntas sobre radares (margen oficial 7%, radar de tramo, vehículo prioritario y velocidad, señales temporales).
- Preferencia pref_l3: +5 preguntas sobre rotondas multicarril, vehículos prioritarios en túnel, regla de la derecha, incorporación a autopista.
- Alcohol alc_l3: +3 sobre conducción por amigo no bebido, tramos sancionadores, denuncia a taxista.
- Distancias dist_l2: +4 sobre peatón en arcén durante adelantamiento, formar cola y facilitar adelantamiento, 50m mínimo en autopista, frenado en cadena.
- Vehículo veh_l3: +4 sobre ABS en frenada, testigo check engine, frenos asimétricos, fading.
- Auxilios aux_l2: +4 sobre lesión vertebral, fractura abierta, conmoción cerebral, protocolo PAS nocturno.
- Infracciones inf_l2: +5 sobre SRI menores, neumático en mal estado, carné caducado, móvil vs cinturón, descuento por pronto pago.
- Vías via_l3: +4 sobre cambio de sentido prohibido, BUS-VAO, kamikaze en autopista, lado de estacionamiento.

**Estado final tras Fase C extendida:** **300 preguntas exactas** (subió de 220, neto +80). Objetivo alcanzado.

**Lecciones nuevas añadidas:**
- `veh_l4` "Pasajeros y Carga" (12 preguntas): SRI infantil, airbag con sillita, portabicis y matrícula V-20, carga sobresaliente, transporte de animales, baca/cofre, exceso de plazas.
- `via_l4` "Maniobras" (12 preguntas): marcha atrás, estacionamiento en batería y línea, orientación de ruedas en pendiente, giro a la izquierda multicarril, cambio de carril (espejos + punto ciego), abrir puerta sin mirar (dooring), giro en U prohibido, atasco con warning.

**Ampliaciones en lecciones existentes:**
- `eco_l2` Etiquetas DGT y ZBE (+4): etiqueta para motos, modo ECO, residentes en ZBE, ventilación interior recirculada.
- `vel_l1` Límites Generales (+3): plataforma única (20 km/h), furgoneta hasta 3.500 kg, remolque ligero ≤750 kg.
- `dist_l1` Distancia de Seguridad (+3): bus saliendo de parada, separación lateral con tractor agrícola, regla de 2 segundos a 100 km/h.
- `via_l1` Tipos de Vías (+3): carril de deceleración, travesía vs vía urbana, vías rápidas.
- `aux_l1` Protocolo PAS (+3): no dar de beber a heridos, V-16 conectado obligatorio desde 2026, desmayo/síncope.
- `pref_l2` Casos Especiales (+2): estrechamiento autobús vs turismo, tren aproximándose a paso a nivel.

**Archivo nuevo:** [`AUDITORIA_PREGUNTAS.md`](AUDITORIA_PREGUNTAS.md) — informe completo de la auditoría con tabla de calidad por tema y listado de problemas detectados.

---

### v0.4.0 — Mayo 2026

**Nuevas funcionalidades:**
- **Biblioteca de señales SVG**: 50+ señales de tráfico dibujadas como SVG vectoriales siguiendo el RGC (señales de peligro, prohibición, obligación, indicación, semáforos, marcas viales)
- **Preguntas con imagen**: 22 preguntas nuevas con señal SVG real mostrada durante el quiz (lecciones "Identifica la Señal" y "Señales de Obligación y Especiales")
- **Campo `legalRef`** en preguntas: referencia al artículo legal exacto (ej. "Art. 132 RGC")
- **Tab "Manual"** en la navegación (5 tabs en total)
- **Manual del Conductor completo**: 11 capítulos con señales ilustradas, normativa, consejos y alertas, basado en el manual oficial DGT
- Links a recursos oficiales: manual DGT (PDF), BOE (RGC, LSV), cuadro de sanciones, etiquetas medioambientales
- Aclaración legal: las preguntas son de elaboración propia (no reproducción del banco DGT, que está protegido por copyright)

**Cambios técnicos:**
- Nuevo archivo `src/components/TrafficSign.tsx`: componente `TrafficSign` con mapa de 50+ señales
- Nuevo archivo `src/screens/ManualScreen.tsx`: manual interactivo con capítulos y señales incrustadas
- `Question` interface ampliada con `signId?: string` y `legalRef?: string`
- `QuizModal` muestra el SVG de la señal cuando `question.signId` está definido
- `App.tsx` actualizado para incluir el tab Manual y tipo `Tab` ampliado

---

### v0.3.0 — Mayo 2026

**Nuevas funcionalidades:**
- Iconos SVG vectoriales por tema (señales de tráfico reales)
- Sistema de vidas completo: bloqueo al llegar a 0, regeneración automática cada 30 min, compra con gemas
- Pantalla "Sin vidas" con contador de tiempo hasta la próxima vida
- Gradientes visuales con `expo-linear-gradient` en cabeceras y botones
- 2 nuevos temas: Infracciones y Sanciones, La Vía y el Entorno
- ~130 preguntas adicionales (total ~250)

**Bugs corregidos:**
- Crash en pantalla de Ligas por `user.friends` siendo `undefined`
- La app ya no permite continuar el quiz cuando se agotan las vidas
- Versiones incompatibles de paquetes Expo (react-native-svg, expo-linear-gradient)

**Cambios técnicos:**
- `UserState` ampliado con `friends`, `lastHeartRegenTime`
- Clave de AsyncStorage cambiada a `teoricob-v2` con migración automática
- `LEAGUES` y `ACHIEVEMENTS` exportados desde el store para uso en componentes
- Función `merge` en persist para compatibilidad con datos de versiones anteriores

---

### v0.2.0 — Mayo 2026

**Nuevas funcionalidades:**
- Conversión de SwiftUI a React Native/Expo (para testing sin Mac)
- Onboarding de 3 pasos (bienvenida, nombre, avatar)
- Sistema de tabs (Inicio, Aprender, Liga, Perfil)
- QuizModal interactivo con feedback háptico
- 8 temas, ~120 preguntas DGT
- Sistema de XP, niveles, racha y liga básico
- Persistencia con AsyncStorage vía Zustand persist

**Bugs corregidos:**
- Build de CI fallaba porque `swift build` no compila código iOS (cambiado a `xcodebuild`)
- Versión mínima iOS actualizada a 17.0 en SwiftUI (usaba APIs de iOS 17)

---

### v0.1.0 — Mayo 2026

**Versión inicial:**
- App SwiftUI completa (estructura de archivos)
- Modelos: User, Question, Topic, Lesson, LeagueType, Achievement
- Base de datos de preguntas DGT inicial
- Onboarding, HomeView, LearnView, QuizView, LeagueView, ProfileView
- CI/CD con GitHub Actions (build en macOS)
- Estructura `.swiftpm` para Swift Playgrounds en iPad

---

*Documento mantenido por Astor Snaider. Se actualiza con cada modificación significativa del proyecto.*
