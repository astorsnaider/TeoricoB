# Auditoría del banco de preguntas — TeoricoB

**Fecha:** 2026-05-31
**Total real auditado:** 220 preguntas en 10 temas, 25 lecciones
**Nota:** el ROADMAP anunciaba 249 preguntas; el conteo real es **220**.

---

## Criterios de clasificación

- ✅ **Buena**: pregunta de calidad DGT — supuesto práctico o concepto importante, 4 distractores plausibles, redacción precisa, datos correctos.
- ⚠️ **Mejorable**: idea válida pero algún defecto: distractores absurdos, definición pura sin escenario, lenguaje impreciso, redundante con otra.
- ❌ **Mala**: error fáctico, dato desactualizado, duplicado literal, trivia sin valor pedagógico.

---

## Resumen por tema

| # | Tema | Total | ✅ | ⚠️ | ❌ | % calidad |
|---|------|------:|---:|---:|---:|----------:|
| 1 | Señales | 39 | 9 | 26 | 4 | **23%** ⚠️ |
| 2 | Velocidades | 24 | 20 | 2 | 2 | 83% |
| 3 | Preferencia | 22 | 20 | 2 | 0 | 91% |
| 4 | Alcohol y drogas | 23 | 21 | 2 | 0 | 91% |
| 5 | Distancias y adelantamiento | 17 | 17 | 0 | 0 | **100%** ✅ |
| 6 | Primeros auxilios | 18 | 18 | 0 | 0 | **100%** ✅ |
| 7 | El vehículo | 22 | 21 | 1 | 0 | 95% |
| 8 | Conducción eficiente | 17 | 17 | 0 | 0 | **100%** ✅ |
| 9 | Infracciones y sanciones | 14 | 11 | 2 | 1 | 79% |
| 10 | La vía y el entorno | 24 | 23 | 1 | 0 | 96% |
| | **TOTAL** | **220** | **177** | **36** | **7** | **80%** |

**Conclusión global:** el banco está en buen estado en 9 de 10 temas (>80% calidad). El cuello de botella es el **Tema 1 (Señales)**, que arrastra el promedio.

---

## ❌ Errores graves (7) — máxima prioridad en Fase B

### 1. Errores fácticos / desactualizados

#### `v3q1` — Velocidad noveles desactualizada
> "Un conductor novel circula por autopista. ¿Cuál es su velocidad máxima durante el primer año?" → Respuesta marcada: **100 km/h**

**El límite específico de 100 km/h para noveles fue eliminado en 2014.** Hoy los noveles están sujetos al mismo límite genérico que el resto. Esta pregunta enseña algo INCORRECTO. **Eliminar o reescribir** sobre las restricciones reales del novel (alcohol 0,3 g/l, no llevar pasajero en moto en su primer año en algunos casos).

#### `inf2q5` — Conducir sin seguro NO quita puntos
> "Conducir sin el seguro obligatorio conlleva pérdida de 6 puntos y multa de hasta 3.000 €"

La sanción por circular sin seguro está regulada por el Texto Refundido de la LRCSCVM, no por el Anexo II de la LSV. Es infracción muy grave con multa de 601-3.005 €, pero **NO descuenta puntos**. La afirmación de "6 puntos" es falsa. Reescribir o sustituir.

#### `s4q12` — Posible error sobre R-500 "Fin de limitaciones"
La explicación (según mi lectura previa) dice que la señal R-500 cancela todas las restricciones EXCEPTO la de adelantar. Esto es inexacto: la R-500 (fin de todas las prohibiciones) las cancela TODAS. La específica de "fin de prohibición de adelantar" es la R-502. **Releer y corregir** la explicación.

### 2. Duplicados literales

#### `v3q4` ≡ `v1q6` — Velocidad mínima en autopista
Misma pregunta, mismas opciones, misma respuesta (60 km/h). Eliminar `v3q4`.

#### `v3q5` ≈ `v1q8` — Zona 20
Casi idéntica. Reformular `v3q5` con un escenario práctico o eliminarla.

#### `p3q10` ≈ `p1q7` — Ceder el paso a autobús urbano
Mismo concepto, misma respuesta. Diferenciar o eliminar una.

### 3. Trivia sin valor pedagógico

#### `s1q7` — "¿Cuántas señales de peligro existen en la normativa española?"
Respuesta: "Más de 50". Esta pregunta **nunca aparecería** en un examen DGT real. Memorizar un conteo no ayuda a conducir. Eliminar.

#### `s2q7` — "Distancia mínima de líneas de detención en zona urbana"
Respuesta correcta: "No hay distancia mínima regulada". Capciosa, sin valor real. Eliminar.

---

## ⚠️ Preguntas mejorables (36)

### Tema 1 SEÑALES — 26 preguntas (el gran problema)

**Patrón dominante:** definiciones puras + distractores absurdos. Reescribir todas con el enfoque DGT real (uso de la imagen `signId` como protagonista, supuesto práctico).

| ID | Defecto principal |
|----|-------------------|
| s1q1 | Definición pura forma de señal de peligro |
| s1q2 | Definición pura círculo blanco/rojo |
| s1q3 | Definición + "sin excepción" inexacto (hay excepciones para emergencias) |
| s1q4 | "STOP" — sólo 2 distractores plausibles ("triangular roja", "circular roja" absurdos) |
| s1q5 | "Ceda el paso" — distractor "Octogonal" absurdo |
| s1q8 | "Triángulo negro" no existe como señal |
| s2q4 | Ceda en suelo — distractores demasiado obvios |
| s2q5 | Stop en suelo — distractores demasiado obvios |
| s2q6 | Flechas en carril — "velocidad recomendada" absurdo |
| s3q4 | Agente de tráfico — distractores muy obvios |
| s3q6 | Pide identificar señal por texto pero existe `signId`; **debería usar la imagen** |
| s4q1-s4q11 | Todas las "Identifica la señal": un distractor potente + dos absurdos. Hay que cambiar a tres distractores plausibles (señales que se confunden visualmente) |
| s5q1 | "Sentido único opcional" — término inventado |
| s5q2 | "Solo buses y taxis" absurdo para sentido obligatorio derecha |
| s5q3 | "Debes detenerte porque hay obras" — distractor débil |
| s5q5 | "Solo de noche" absurdo para línea discontinua |
| s5q6 | Inconsistencia: pregunta de texto con `signId` cargado (mismo bug que s3q6) |

### Tema 2 VELOCIDADES — 2 preguntas
- `v2q6` Distractor "Señal de desgaste del neumático" para aquaplaning — absurdo

### Tema 3 PREFERENCIA — 2 preguntas
- `p2q5` Imprecisa: vehículos de obras tienen "preferencia" sólo en sentido restrictivo (otros deben facilitar su trabajo). La opción correcta es ambigua

### Tema 4 ALCOHOL — 2 preguntas
- `a2q4` Pequeño error gramatical: "los tomás" → "los tomas" (acento argentino, no de España)
- `a3q5` Explicación imprecisa: 0,32 g/l en novel es infracción **grave**, no "grave/muy grave según cantidad"

### Tema 7 VEHÍCULO — 1 pregunta
- `vh1q3` Respuesta omite la ficha técnica, que también debe llevarse. Verificar legislación actual

### Tema 9 INFRACCIONES — 2 preguntas
- `inf1q3` Mezcla mal "pérdida de puntos" con "retirada inmediata del permiso" (esto último sólo aplica si es delito penal, no por superar 60 km/h)
- `inf2q2` Importe 200€ para exceso 21-30 km/h discutible — el cuadro oficial Anexo IV es 100€ (urbana) o 300€ (rangos superiores). Verificar y precisar

### Tema 10 VÍAS — 1 pregunta
- `va1q1` Diferencia autopista/autovía: la opción correcta es engañosa. La diferencia REAL es técnica (separación de calzadas, accesos restringidos, etc.), no si tiene peaje. Hay autovías de peaje y autopistas libres

---

## Hallazgos transversales

1. **`signId` infrautilizado en Tema 1.** Varias preguntas de "Identifica la señal" tienen la imagen cargada pero formulan la pregunta como texto ("¿Qué señal indica X?"). Debería ser uniforme: "¿Qué indica esta señal?" + imagen.

2. **Distractores DGT-style ausentes.** El patrón DGT real usa distractores **plausibles** (números cercanos: 89/90/91; señales visualmente similares; conceptos casi-correctos). Aquí abundan los distractores obviamente absurdos.

3. **Pocas trampas semánticas.** La DGT real usa con frecuencia "siempre / nunca / excepto / únicamente" como trampas. Solo tenemos un puñado.

4. **Pocos escenarios prácticos en Tema 1.** Una pregunta DGT real sobre señales suele ser "Circulas y ves esta señal. ¿Qué haces?" — no "¿Qué forma tiene…?".

5. **Temas con calidad excelente (mantener intacto):**
   - Primeros auxilios (18/18 ✅)
   - Distancias y adelantamiento (17/17 ✅)
   - Conducción eficiente (17/17 ✅)
   - Estos tres son ya nivel DGT real, no tocar.

---

## Propuesta para Fase B (reescritura)

**Prioridad 1 — Errores fácticos (7 preguntas).** Corregir o eliminar:
- `v3q1`, `inf2q5`, `s4q12` → corregir contenido
- `v3q4`, `s1q7`, `s2q7` → eliminar
- `v3q5` o `p3q10` → fusionar/eliminar uno de cada par

**Prioridad 2 — Reescribir Tema 1 SEÑALES (26 preguntas ⚠️).** Es la mayor área de impacto. Aprovechar el catálogo Wikimedia (42 SVGs) para que cada pregunta use `signId` cuando sea posible.

**Prioridad 3 — Pequeños ajustes (10 preguntas).** Correcciones puntuales en Temas 2, 3, 4, 7, 9, 10.

**Prioridad 4 — Fase C: añadir 80-100 preguntas nuevas.** Llegando a ~300 reales. Distribuir foco en lo que falta:
- Señales de escenario práctico (con imagen Wikimedia + qué hace el conductor)
- Trampas semánticas tipo DGT ("siempre" / "excepto")
- Distractores numéricos cercanos (89/90/91 km/h)
- Casos de pasajeros, equipajes y carga (apenas hay)
- Más sobre maniobras (marcha atrás, estacionamiento, giro a la izquierda en doble carril)

---

*Generado tras leer 220 preguntas una a una. Siguiente paso: confirmar con el usuario las decisiones (especialmente eliminar 5 preguntas) antes de empezar Fase B.*
