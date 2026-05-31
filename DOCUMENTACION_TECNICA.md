# Documentación Técnica — TeoricoB
> App para estudiar el permiso de conducción B en España

**Última actualización:** 31 mayo 2026  
**Versión app:** 0.6.0  
**Repositorio:** https://github.com/astorsnaider/TeoricoB  
**Autor:** Astor Snaider

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

### ¿Qué es TeoricoB?

**TeoricoB** es una aplicación móvil para ayudar a los jóvenes a preparar el examen teórico del permiso de conducción tipo B en España. Está inspirada en el modelo pedagógico de Duolingo: aprendizaje por lecciones cortas, gamificación progresiva y feedback inmediato.

### Objetivos pedagógicos

- Cubrir **todos los bloques temáticos** del examen DGT de conducción tipo B
- Ofrecer **explicaciones razonadas** de por qué cada respuesta es correcta o incorrecta
- Usar **gamificación** (XP, vidas, racha, ligas) para mantener la motivación diaria
- Simular el **examen real DGT** (30 preguntas, máximo 3 errores)

### Lo que NO hace la app

- No se conecta a ningún servidor externo (aplicación 100% offline)
- No reproduce las preguntas oficiales con copyright de la DGT (las preguntas son de elaboración propia, correctas en contenido pero redactadas de forma original)
- No almacena datos personales fuera del dispositivo

---

## 2. Arquitectura del sistema

```
┌─────────────────────────────────────────────────────┐
│                   DISPOSITIVO DEL USUARIO            │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │           APP REACT NATIVE (Expo)            │   │
│  │                                             │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │   │
│  │  │  Screens │  │Components│  │  Store   │  │   │
│  │  │ (vistas) │◄─┤(UI reus.)│  │(Zustand) │  │   │
│  │  └────┬─────┘  └──────────┘  └────┬─────┘  │   │
│  │       │                           │         │   │
│  │       ▼                           ▼         │   │
│  │  ┌─────────────────────────────────────┐   │   │
│  │  │         AsyncStorage (SQLite)        │   │   │
│  │  │    Persistencia local en dispositivo │   │   │
│  │  └─────────────────────────────────────┘   │   │
│  │                                             │   │
│  │  ┌─────────────────────────────────────┐   │   │
│  │  │      questions.ts (hardcoded)        │   │   │
│  │  │    Base de datos de preguntas DGT    │   │   │
│  │  └─────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘

              ↕ Solo para CI/CD

┌─────────────────────────────────────────────────────┐
│              GITHUB / GITHUB ACTIONS                 │
│  - Control de versiones (git)                        │
│  - Build automático en macOS (verificación)          │
│  - NO hay backend, NO hay base de datos remota       │
└─────────────────────────────────────────────────────┘
```

### Decisión de diseño: sin backend

La app es deliberadamente **offline-first** y **sin backend** por las siguientes razones:

| Razón | Explicación |
|-------|-------------|
| **Simplicidad** | No se necesita autenticación, servidores, ni base de datos remota |
| **Privacidad** | El progreso del usuario nunca sale del dispositivo |
| **Coste** | Elimina costes de infraestructura (servidores, BBDD en la nube) |
| **Fiabilidad** | Funciona sin conexión a internet |
| **GDPR** | Al no haber datos personales en servidores, el cumplimiento es trivial |

Los datos de "amigos" y "ligas" son actualmente **simulados localmente** con datos de ejemplo. En una futura versión con backend se gestionarían de forma real.

---

## 3. Stack tecnológico

### App principal — React Native + Expo

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **Expo SDK** | ~54.0 | Framework de desarrollo multiplataforma |
| **React Native** | 0.76.x | UI nativa para iOS y Android |
| **TypeScript** | 5.x | Tipado estático para mayor seguridad |
| **Zustand** | ^5.x | Gestión del estado global (ligero, sin boilerplate) |
| **AsyncStorage** | 2.2.0 | Persistencia local (equivalente a localStorage en web) |
| **expo-haptics** | ~15.0 | Vibración táctil en respuestas correctas/incorrectas |
| **expo-linear-gradient** | ~15.0 | Gradientes visuales en cabeceras y botones |
| **react-native-svg** | 15.12.1 | Iconos SVG vectoriales de señales de tráfico |

### App iOS nativa (paralela) — SwiftUI

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **Swift** | 5.9+ | Lenguaje de programación |
| **SwiftUI** | 5.0 | Framework de UI declarativa |
| **Combine** | — | Programación reactiva (timers, estado) |
| **UserDefaults** | — | Persistencia local |
| **iOS mínimo** | 17.0 | Target de plataforma |

### Herramientas de desarrollo

| Herramienta | Propósito |
|------------|---------|
| **Git + GitHub** | Control de versiones y repositorio |
| **GitHub Actions** | CI/CD: build automático en macOS para verificar que compila |
| **Expo Go** | Testing en dispositivo real (iPhone/Android) sin compilar |
| **Node.js 24** | Runtime para las herramientas de desarrollo |
| **npm 11** | Gestión de dependencias |

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
├── .github/
│   └── workflows/
│       └── build.yml               ← CI/CD: build iOS en macOS
│
├── TeoricoB-expo/                  ← App React Native (principal)
│   ├── App.tsx                     ← Punto de entrada, navegación por tabs
│   ├── src/
│   │   ├── types/
│   │   │   └── index.ts            ← Tipos TypeScript (Question, User, etc.)
│   │   ├── theme.ts                ← Colores y sombras globales
│   │   ├── data/
│   │   │   └── questions.ts        ← 250+ preguntas DGT hardcoded
│   │   ├── store/
│   │   │   └── useStore.ts         ← Estado global (Zustand + AsyncStorage)
│   │   ├── components/
│   │   │   ├── QuizModal.tsx       ← Modal del quiz (pregunta + opciones + feedback)
│   │   │   └── TopicIcon.tsx       ← Iconos SVG de señales de tráfico
│   │   └── screens/
│   │       ├── OnboardingScreen.tsx← Pantallas de bienvenida y creación de perfil
│   │       ├── HomeScreen.tsx      ← Dashboard: racha, XP, reto diario, examen
│   │       ├── LearnScreen.tsx     ← Lista de temas y lecciones
│   │       ├── LeagueScreen.tsx    ← Clasificación y ligas
│   │       └── ProfileScreen.tsx   ← Perfil, estadísticas y logros
│   └── package.json
│
└── TeoricoB.swiftpm/               ← App SwiftUI (versión iOS nativa)
    ├── Package.swift
    └── Sources/TeoricoB/
        ├── TeoricoBApp.swift
        ├── AppViewModel.swift
        ├── QuizViewModel.swift
        ├── QuestionsDatabase.swift
        ├── [Views...]
        └── [Models...]
```

---

## 5. Frontend — React Native / Expo

### Pantallas y responsabilidades

#### `App.tsx` — Orquestador principal
- Comprueba si el onboarding está completo
- Renderiza `OnboardingScreen` o el sistema de tabs
- Contiene la barra de navegación inferior (4 tabs)
- Muestra el toast de logros desbloqueados

#### `OnboardingScreen.tsx` — Primer uso
- 3 pasos: bienvenida → nombre → avatar
- Guarda el perfil en el store al terminar
- Genera el reto diario inicial y los standings de la liga

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
- Muestra una pregunta a la vez con 4 opciones (A/B/C/D)
- Bloqueo por vidas: si el usuario tiene 0 vidas, muestra la pantalla "Sin vidas 💔"
- Al seleccionar respuesta: feedback visual inmediato (verde/rojo), vibración háptica
- Explicación de la respuesta correcta siempre visible tras responder
- Animación de temblor en la respuesta incorrecta
- Botón "Continuar" con color según si fue correcta o no
- Pantalla de resultados con estadísticas: correctas, fallos, %, nota y XP ganados
- Modo examen: permite hasta 3 fallos (criterio DGT real), no bloquea por vidas

#### `LeagueScreen.tsx` — Ligas y competición
- Cabecera con la liga actual del usuario y progreso hacia la siguiente
- Clasificación semanal de 10 jugadores (usuario + 9 simulados)
- Sección de amigos (4 amigos de ejemplo) con liga y racha
- Mapa visual de todas las ligas (Bronce → Diamante) con estado desbloqueado/bloqueado

#### `ProfileScreen.tsx` — Perfil del usuario
- Avatar y nombre del usuario
- Badge de liga actual
- 6 estadísticas: XP total, racha, lecciones completadas, % acierto, vidas, gemas
- Barra de progreso por cada tema
- Grid de todos los logros (desbloqueados en color, bloqueados en gris)
- Botón de reiniciar progreso (con confirmación)

### Sistema de vidas (corazones)

```
Estado inicial:    ❤️❤️❤️❤️❤️  (5/5)
Error en quiz:     ❤️❤️❤️❤️🤍  (4/5) → pierde 1
Sin vidas:         🤍🤍🤍🤍🤍  (0/5) → bloqueado

Regeneración:      +1 vida cada 30 minutos automáticamente
Compra:            10 gemas → +1 vida (si gems >= 10)
```

El tiempo de regeneración se calcula en el cliente comparando `lastHeartRegenTime` (guardado en AsyncStorage) con la hora actual.

### Sistema de XP y niveles

```
Por respuesta correcta:    +10 XP
Bonus lección perfecta:    +20 XP  (0 fallos)
Bonus velocidad:           +10 XP  (media < 8 s/pregunta)
Reto diario completado:    +50 XP fijo

Nivel = Math.floor(XP_total / 100) + 1
XP en nivel actual = XP_total % 100
```

### Sistema de ligas

| Liga | XP requerido |
|------|-------------|
| Bronce | 0 |
| Plata | 500 |
| Oro | 1.500 |
| Zafiro | 3.000 |
| Rubí | 5.500 |
| Esmeralda | 9.000 |
| Amatista | 14.000 |
| Diamante | 20.000 |

Las ligas se actualizan automáticamente al ganar XP, sin necesidad de acción del usuario.

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

#### Estado persistido (guardado en el dispositivo):

```typescript
interface UserState {
  name: string               // Nombre del usuario
  avatarEmoji: string        // Emoji seleccionado en onboarding
  xp: number                 // XP total acumulado
  streak: number             // Días consecutivos de uso
  hearts: number             // Vidas actuales (0-5)
  maxHearts: number          // Máximo de vidas (siempre 5)
  lastHeartRegenTime: string // Timestamp de última regeneración
  league: LeagueType         // Liga actual
  leagueXP: number           // XP acumulado para la liga
  completedLessons: string[] // IDs de lecciones completadas
  completedTopics: string[]  // IDs de temas completados
  achievements: string[]     // IDs de logros desbloqueados
  lastActiveDate: string     // Fecha del último uso (para racha)
  totalCorrect: number       // Total de respuestas correctas
  totalAnswered: number      // Total de respuestas dadas
  weeklyXP: number           // XP de la semana actual
  gems: number               // Gemas (moneda para comprar vidas)
  friends: Friend[]          // Lista de amigos (simulados)
}
```

#### Estado no persistido (regenerado en cada sesión):

```typescript
topics: Topic[]              // Los temas con preguntas (de questions.ts)
leagueStandings: LeagueStanding[]  // Clasificación de la liga (generada dinámicamente)
dailyChallenge: DailyChallenge     // Reto del día (10 preguntas aleatorias)
newAchievement: Achievement | null // Logro recién desbloqueado (para el toast)
```

#### Clave de persistencia en AsyncStorage:

```
'teoricob-v2'
```

> **Nota:** La clave tiene versión para evitar conflictos con datos de versiones anteriores. Al cambiar la estructura del estado, se incrementa el número de versión y se usa la función `merge` del middleware `persist` para fusionar datos guardados con el esquema nuevo, usando `defaultUser` como base.

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
  options: string[]   // Siempre exactamente 4 opciones
  correctIndex: number // Índice (0-3) de la opción correcta
  explanation: string  // Explicación detallada de por qué es correcta
  category: string    // Categoría para estadísticas
}
```

### Distribución de preguntas por tema (v0.6.0)

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
- Clasificación de la liga (se recalcula con los datos del usuario)
- Nuevos logros pendientes de mostrar
- Los temas y preguntas (están hardcoded en `questions.ts`)

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

### Consideraciones de seguridad para esta app

Al ser una app **sin backend, sin autenticación y sin datos sensibles**, el riesgo de seguridad es mínimo. Las consideraciones aplicables son:

#### 9.1 Datos del usuario

| Dato | ¿Se guarda? | ¿Dónde? | ¿Riesgo? |
|------|-------------|---------|---------|
| Nombre | Sí | AsyncStorage local | Ninguno (no es dato personal sensible; no sale del dispositivo) |
| Progreso | Sí | AsyncStorage local | Ninguno |
| Email | ❌ No se pide | — | Ninguno |
| Contraseña | ❌ No hay auth | — | Ninguno |
| Ubicación | ❌ No se accede | — | Ninguno |
| Contactos | ❌ No se accede | — | Ninguno |

#### 9.2 Permisos de la app

La app **no solicita ningún permiso del sistema**:
- ❌ No accede a la cámara
- ❌ No accede al micrófono
- ❌ No accede a la ubicación
- ❌ No accede a los contactos
- ❌ No envía notificaciones push (todavía)
- ✅ Solo usa vibración háptica (no requiere permiso)

#### 9.3 Red

La app **no realiza ninguna llamada de red** durante el uso normal. La única comunicación externa ocurre:
- Durante la instalación de Expo Go (tienda de apps)
- Al iniciar `npx expo start` durante el desarrollo (Metro Bundler)

#### 9.4 Dependencias

Las dependencias de producción son todas de fuentes reconocidas (Expo, React Native, Zustand). No hay dependencias de terceros desconocidos.

#### 9.5 GDPR / LOPD

Al no recoger, almacenar ni transmitir datos personales identificables fuera del dispositivo, la app cumple de forma natural con:
- **GDPR** (Reglamento General de Protección de Datos europeo)
- **LOPD** (Ley Orgánica de Protección de Datos española)

No se requiere política de privacidad para la versión actual. Si en el futuro se añade backend o autenticación, deberá redactarse una política de privacidad completa.

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

### Testing manual (principal método actual)

| Método | Herramienta | Qué se verifica |
|--------|------------|----------------|
| Testing en dispositivo | Expo Go (iPhone) | UI, flujo completo, gestos, hápticos |
| Testing en dispositivo | Expo Go (Android) | Compatibilidad multiplataforma |
| Testing en web | Expo Web (navegador) | Compatibilidad básica |

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

No hay variables de entorno. La app no requiere claves de API ni configuración externa.

---

## 14. Registro de cambios

### v0.6.0 — Mayo 2026 (actual)

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
