#!/usr/bin/env node
/**
 * Aplica las correcciones de signIds en src/data/questions.ts:
 *   - Renombra signIds donde el concepto cambió (autopista→autovia, etc.)
 *   - Elimina el campo signId de preguntas que apuntan a un signId
 *     que ya no existe (sin SVG oficial verificado).
 *
 * El CONTENIDO de las preguntas (texto, opciones, explicación) no se toca:
 * la pregunta sigue siendo válida pedagógicamente; solo deja de mostrar
 * imagen si no hay una oficial verificada.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const FILE = path.resolve(__dirname, '..', 'TeoricoB-expo', 'src', 'data', 'questions.ts');

const RENAMES = {
  'paso_peatones':     'peatones',
  'autopista':         'autovia',
  'sentido_derecha':   'obligacion_ir_derecha',
  'sentido_izquierda': 'obligacion_ir_izquierda',
  'doble_curva':       'varias_curvas',
  // 'curva_derecha':     'curva_peligrosa_derecha',  // No usado en questions.ts
  // 'curva_izquierda':   'curva_peligrosa_izquierda',
};

// signIds sin SVG oficial verificado: se quita el campo entero
const REMOVE_SIGNIDS = [
  'direccion_prohibida',
  'ninos',
  'paso_nivel_sin',
  'paso_nivel_con',
  'sentido_recto',
  'linea_continua',
  'linea_discontinua',
  'ceda_suelo',
  'stop_suelo',
  'cadenas',
  'peligro_generico',
  'peligro',
  'vel_min_60',
  'vel_max_50',
  'interseccion_derecha',
  'semaforo_rojo',
  'semaforo_ambar',
  'semaforo_verde',
  'animales_domesticos',
];

let src = fs.readFileSync(FILE, 'utf8');
let renamesApplied = 0;
let removesApplied = 0;

// 1) Aplicar renombrados
for (const [oldId, newId] of Object.entries(RENAMES)) {
  const before = src;
  src = src.split(`signId: '${oldId}'`).join(`signId: '${newId}'`);
  if (src !== before) {
    const count = (before.match(new RegExp(`signId: '${oldId}'`, 'g')) || []).length;
    renamesApplied += count;
    console.log(`  renamed signId: '${oldId}' → '${newId}' (${count}x)`);
  }
}

// 2) Eliminar campos signId que ya no tienen SVG
for (const id of REMOVE_SIGNIDS) {
  const before = src;
  // Patrones a quitar: `, signId: 'X'` (final de objeto) o ` signId: 'X',`
  // Más seguro: eliminamos la pieza completa.
  src = src.replace(new RegExp(`,\\s*signId: '${id}'`, 'g'), '');
  src = src.replace(new RegExp(`signId: '${id}',\\s*`, 'g'), '');
  if (src !== before) {
    const count = (before.match(new RegExp(`signId: '${id}'`, 'g')) || []).length;
    removesApplied += count;
    console.log(`  removed signId: '${id}' (${count}x)`);
  }
}

fs.writeFileSync(FILE, src, 'utf8');
console.log(`\n✓ ${renamesApplied} renombrados, ${removesApplied} eliminados`);
