# Roadmap TeoricoB — Tareas pendientes

> Documento vivo. Las tareas se trabajan **una a una en orden**. Conforme se completan se marcan `[x]` y se mueven a la sección de "Historial completado" al final, conservando fecha y commit asociado.

**Última actualización:** 2026-06-02

---

## Tier 1 — Quick wins (1 sesión cada uno)

- [x] **1. Señales Wikimedia completado (42/~50)** ✅
  Progreso final 2026-05-31: catálogo Wikimedia cerrado al límite práctico de disponibilidad. **+16 señales** añadidas en dos sesiones consecutivas (26 → 42).

  **Sesión 2026-05-30**: vel_max 20/60/70/80/110 · dirección prohibida (R-200) · cadenas (R-409) · peligro genérico (P-50) · calzada irregular (P-15).
  **Sesión 2026-05-31**: prohibido girar derecha (R-302) · prohibido adelantar camiones (R-307) · sentido obligatorio izquierda (R-400b) · paso obligatorio izquierda (R-401b) · doble curva (P-2) · zona peatonal (S-28) · carril bici (S-29).

  Las **~8 señales que faltan** NO existen como SVG independientes en Wikimedia y se quedan con mis fallbacks dibujados a mano:
  - **Semáforos en colores aislados** (rojo, ámbar, verde) — no son señales sino estados luminosos
  - **Marcas viales** (línea continua/discontinua, ceda en suelo, stop en suelo) — son pintura sobre asfalto, no señales
  - **Sentido obligatorio recto** (R-400a) — Wikimedia usa esto como flecha derecha, no recto
  - **Vel. mínima 60** (R-411) — existe como variante con paréntesis, formato Adobe roto al renderizar

  El catálogo final cubre **toda señalización oficial relevante** para el examen DGT.

- [x] **2. Auditoría completa + reescritura del banco — 300/300 (100%)** ✅
  **Sesión 2026-05-31 (cerrada):** Auditoría exhaustiva una a una de las 220 preguntas originales (informe en [`AUDITORIA_PREGUNTAS.md`](AUDITORIA_PREGUNTAS.md)).

  **Fase B aplicada:** 3 errores fácticos corregidos, 5 preguntas eliminadas (trivias/duplicadas), 27 preguntas del Tema Señales reescritas con patrón DGT real, y 8 ajustes menores en otros temas.

  **Fase C aplicada (+83 nuevas):** 2 lecciones nuevas (`veh_l4` Pasajeros y Carga, `via_l4` Maniobras), ampliaciones en lecciones existentes (Señales, Velocidades, Preferencia, Alcohol, Distancias, Auxilios, Vehículo, Medioambiente, Infracciones, Vías), aprovechando signIds Wikimedia.

  **Resultado:** banco final de **300 preguntas exactas** en **30 lecciones**, distribuidas en 10 temas. Calidad DGT consistente: escenarios prácticos, distractores plausibles, referencias legales explícitas.

- [x] **3. Onboarding tutorial primer uso** ✅
  Completado 2026-06-02: 4 pantallas tras nombre/color explicando lecciones, fallos, examen simulado y manual. Persistencia `tutorialSeen` para que no aparezca dos veces.

- [x] **4. Sonidos opcionales en quiz** ✅
  Completado 2026-06-02: efectos discretos de acierto/error y tic suave en examen durante los últimos 5 minutos. Toggle en Ajustes (`soundsEnabled`) persistido. Assets `.wav` locales ligeros (<1KB cada uno aprox.).

## Tier 2 — Medios (1-2 sesiones)

- [ ] **5. Notificaciones push**
  - Recordatorio diario de racha si no abrió la app en 20h
  - Aviso de vidas llenas
  - Reto diario nuevo cada mañana
  Requiere `expo-notifications` + flujo de permisos + `expo-task-manager`.

- [ ] **6. Preguntas con imagen de escenario (la más impactante)**
  SVGs propios de situaciones: cruces, rotondas, adelantamientos. 20-30 preguntas tipo "qué hace el coche rojo".

- [ ] **7. Logros mejorados**
  - Animación celebratoria al desbloquear (confetti)
  - Más logros: 50 lecciones · 1.000 preguntas · 10 exámenes pasados · 100% accuracy en tema
  - Sonido especial

- [ ] **8. Editor de avatar avanzado**
  Combinaciones de fondo + figura + accesorio. Estilo Notion/Memoji simplificado.

## Tier 3 — Avanzado (varias sesiones)

- [ ] **9. Cuenta y sincronización en nube**
  Auth con Apple/Google. Backend en Firebase o Supabase. Backup automático del progreso.

- [ ] **10. Amigos reales**
  Sistema de invitación por código. Ranking entre amigos. Notificaciones cuando un amigo te supera.

- [ ] **11. Audio narración**
  Leer preguntas en voz alta. Útil para accesibilidad visual y estudio mientras caminas. Usar `expo-speech` (gratis, offline).

## Tier 4 — Pre-lanzamiento

- [ ] **12. Búsqueda de marca "TeoricoB"** en OEPM (~150€)
- [ ] **13. Cuenta Apple Developer** (99€/año + DUNS)
- [ ] **14. Cuenta Google Play** (25€ una vez)
- [ ] **15. Capturas y descripción** para ambas tiendas (5-10 por tienda, varios idiomas)
- [ ] **16. Revisión legal** por abogado especializado antes de publicar
- [ ] **17. Dominio web** (teoricob.es / .com / .app)
- [ ] **18. Política de privacidad firmada** y publicada con datos del responsable

---

## Ideas extra (en cola, sin orden)

> Sección para anotar mejoras que se nos ocurran durante el trabajo. Se priorizan al revisar el roadmap.

- [ ] Modo "repasa fallos" — que recupere las preguntas que has fallado más de 2 veces y te las muestre en bucle hasta dominarlas
- [ ] Estadísticas extendidas: tiempo medio por pregunta · curva de aprendizaje semanal
- [ ] Plan de estudio personalizado: "Si tu examen es el día X, hoy estudia el tema Y"
- [ ] Modo "examen rápido": 10 preguntas en 5 min para días con poco tiempo
- [ ] Compartir resultado de examen a redes (Instagram story / Twitter)
- [ ] Widget de iOS con racha y XP del día
- [ ] Modo competitivo: examen 1v1 contra un amigo en tiempo real
- [ ] Tipos de preguntas alternativos: verdadero/falso, rellenar hueco, ordenar pasos
- [ ] Tema de la app: clarito/oscurito + opcionales tipo "carbono", "neón"
- [ ] Integración con calendario: marca "examen DGT" como evento y la app prepara plan
- [ ] Modo prueba de daltónicos para señales de colores
- [ ] Glosario de términos DGT (Cilindrada, MMA, Aerodinámica…) accesible desde cualquier explicación
- [ ] Versión para padres/instructores: vista resumida del progreso de un alumno

---

## Historial completado

### 2026-06-02
- [x] **Tarea #4 — Sonidos opcionales en quiz** | commit pendiente
  - `expo-audio` instalado con la versión compatible del SDK 54
  - Switch "Efectos de sonido" en Ajustes, persistido como `soundsEnabled`
  - Sonidos locales suaves: acierto, error y tic periódico cada 30s en los últimos 5 min del examen
  - Verificado con `npx tsc --noEmit`, `npm ls expo-audio` y tamaños de assets; `expo export` no se pudo repetir por bloqueo de aprobación del entorno

- [x] **Tarea #3 — Onboarding tutorial primer uso** | commit pendiente
  - Nueva pantalla de tutorial de 4 pasos tras completar nombre/color
  - Flag persistido `tutorialSeen` en Zustand y reseteo correcto con `resetProgress`
  - Verificado con `npx tsc --noEmit`, servidor web local HTTP 200 y `npx expo export --platform web --output-dir dist-check`

### 2026-05-31
- [x] **Tarea #2 — Auditoría y reescritura banco preguntas (220 → 300)** | commit `9b97e00` + cierre Fase C extendida
  - Auditoría exhaustiva una a una documentada en AUDITORIA_PREGUNTAS.md
  - Fase B: 3 errores fácticos, 5 eliminaciones, 27 reescrituras Tema Señales, 8 ajustes menores
  - Fase C: 2 lecciones nuevas (`veh_l4` Pasajeros y Carga, `via_l4` Maniobras) + ampliaciones en 8 lecciones existentes
  - Resultado: 300 preguntas exactas en 30 lecciones, calidad DGT consistente
- [x] **Tarea #1 — Señales Wikimedia (42/~50)** | commits `302a515` (sesión 30) + cierre sesión 31
  - +16 señales nuevas integradas en 2 sesiones, catálogo cerrado al límite práctico de disponibilidad en Wikimedia

### Anteriores a 2026-05-30 (fundamentos del proyecto)

- [x] Manual del Conductor completo (18 capítulos basados en RGC/LSV)
- [x] Modo Examen DGT real (timer 30 min, máx 3 errores, repaso)
- [x] Pantalla de Estadísticas con `topicStats` y `examHistory`
- [x] 26 señales Wikimedia integradas (de ~50 objetivo)
- [x] 249 preguntas (8 lecciones nuevas avanzadas)
- [x] Branding propio: icono, splash, app.json, bundle IDs
- [x] Modo oscuro funcional
- [x] Avatar con foto o color seleccionable
- [x] Documentos legales (T&C, Privacidad, Disclaimer, Aviso)
- [x] Botón "Ver en BOE" en cada pregunta con fallback por categoría
- [x] Botón "Ver en Manual" en cada pregunta para profundizar

---

*Para añadir ideas: edita la sección "Ideas extra". Para marcar progreso: mueve la tarea con `[x]` al historial.*
