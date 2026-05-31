# Roadmap TeoricoB — Tareas pendientes

> Documento vivo. Las tareas se trabajan **una a una en orden**. Conforme se completan se marcan `[x]` y se mueven a la sección de "Historial completado" al final, conservando fecha y commit asociado.

**Última actualización:** 2026-05-30

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

- [ ] **2. Más preguntas — objetivo 400-500**
  Añadir 80-100 preguntas extra. Especial foco en preguntas que **muestran la señal Wikimedia como pista visual** (q.signId).

- [ ] **3. Onboarding tutorial primer uso**
  3-4 pantallas guía tras el nombre/color: cómo funciona la app, qué es el examen, dónde está el manual. Marca `tutorialSeen` en store para que no aparezca dos veces.

- [ ] **4. Sonidos opcionales en quiz**
  Tic-toc de timer (últimos 5 min de examen), ding de acierto, buzz de error. Toggle en Ajustes (`soundsEnabled`). Archivos `.mp3` ligeros (<5KB cada uno).

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

### 2026-05-31
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
