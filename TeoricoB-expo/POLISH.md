# POLISH.md — Lista de retoques pendientes

> Cuando descubras un detalle pequeño usando la app, apúntalo aquí. Al
> llegar a la **Polish Week** (justo antes del lanzamiento público) los
> revisamos en bloque.
>
> Reglas:
> - Bug que te molesta al usar → arréglalo antes (NO lo apuntes, dilo
>   en chat para que lo hagamos al momento).
> - Texto / copy / icono raro → arréglalo al momento (5 min).
> - Mejora UX >30 min sin urgencia → apúntalo aquí.
> - Refactor cosmético / "para que quede más bonito" → aquí o nunca.

---

## UX / Copy

- [ ] (placeholder — añade lo que vayas viendo)

## Modos pedagógicos (en desarrollo activo)

- [ ] **Modo Examen REAL — formal estilo TodoTest** (en revisión 2026-06-05):
  Rediseñar completamente el modo Examen para que se parezca a un test
  oficial DGT real, no a "más de lo mismo":
  - Pantalla nueva tipo lista con **90 exámenes numerados fijos** (001,
    002…) que no cambian — siempre las mismas 30 preguntas por examen.
    Algoritmo determinístico de selección a partir del banco actual,
    con cobertura temática equilibrada.
  - Por cada examen, mostrar **stats acumuladas**: veces realizado,
    fallos, último resultado, mejor resultado.
  - Dentro del examen:
    - **Navegación libre adelante/atrás** entre las 30 preguntas
      (puedes saltarte, volver, cambiar respuesta).
    - **No revelar correcto/incorrecto durante el examen** — solo al
      finalizar.
    - **No permitir consultar el Manual** durante el examen.
    - Timer 30 min mantenido; el resultado se entrega al acabar.
  - Pantalla de resultados final con: aprobado/suspenso, % aciertos,
    revisión de respuestas (tus respuestas vs correctas + explicación).
  - Persistencia del histórico por examen (sync Supabase).

- [ ] **Revisión profesional de las 320 preguntas** (en revisión
  2026-06-05): el banco actual tiene un sesgo serio — en muchas la
  respuesta correcta es la opción **más larga y elaborada** y se acierta
  a ojo sin saber la materia. Hay que reescribir distractores para que
  todas las opciones tengan longitud y registro similar, y la elección
  exija conocer la normativa. Basarse en estilo DGT real / TodoTest sin
  copiar literal. Probablemente trabajo de varias sesiones por bloques.

## Visual / Diseño

- [ ] Rediseñar `assets/icon-source.svg`: actualmente lleva la letra "B".
  Cuando ampliemos a más permisos (A, AM, C, D) debe ser un símbolo
  más genérico.

## Performance

- [ ]

## Accesibilidad

- [ ]

## Legal / Cuentas

- [ ] Cambiar `LEGAL.CONTACT_EMAIL` de `contacto@teoric.app` (placeholder)
  al email real cuando se registre el dominio.
- [ ] Cambiar `Site URL` de Supabase (`https://teoric.app`) por el dominio
  real cuando exista.

## Infraestructura pre-lanzamiento

- [ ] **SMTP de producción**: configurar **Resend** (https://resend.com)
  con dominio `teoric.app` verificado vía DNS. Sustituye al SMTP built-in
  de Supabase. Templates de email ya están en
  `docs/SUPABASE_EMAIL_TEMPLATE.md`. Free tier: 3.000 emails/mes,
  suficiente para los primeros meses. Razones: mejor deliverability que
  Gmail/Brevo, sender branded (`noreply@teoric.app`), estándar de la
  industria. Hasta entonces, dejamos el SMTP built-in de Supabase con
  rate limit bajo (~3 emails/h) — solo molesta en desarrollo intenso.
- [ ] **Botón "Cambiar contraseña" en Perfil**: actualmente
  `updatePassword()` está en AuthContext pero solo se usa dentro del flow
  de reset. Útil tener un atajo desde Perfil para quien sepa su password
  actual.

## i18n (post-MVP)

- [ ] Extraer strings hardcoded a un sistema de traducción cuando se
  arranque `i18next`.

---

## Hecho (mover aquí cuando se complete)

- [x] _vacío_
