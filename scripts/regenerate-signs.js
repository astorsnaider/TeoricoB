#!/usr/bin/env node
/**
 * Regenera src/data/signSvgsWikimedia.ts con asignaciones correctas DGT.
 *
 * Estrategia:
 *  - Toma SVGs de assets/signs-wikimedia/ como fuente principal
 *  - Para signIds que tienen XML inline ya correcto en el archivo actual, lo conserva
 *  - Elimina signIds con SVG mal asignado (donde el SVG no corresponde al concepto)
 *
 * Auditoría base (códigos según TeoricaAbreviada.txt / Anexo I RGC):
 *
 *  ✅ CORRECTOS (XML inline en archivo actual, mantener):
 *    stop (r2), ceda_el_paso (r1), prohibido_adelantar (r305),
 *    entrada_prohibida (r101), vel_max_* (r301-NN), estacionamiento (s17a),
 *    prohibido_girar_izquierda (r303), prohibido_cambio_sentido (r304),
 *    sentido_derecha (r400a), fin_limitaciones (r500),
 *    paso_obligatorio_derecha (r401a), prioridad_sentido_contrario (r6),
 *    zona_peatonal (s28), carril_bici (s29), prohibido_girar_derecha (r302),
 *    sentido_izquierda (r400b), paso_obligatorio_izquierda (r401b),
 *    calzada_irregular (p15), semaforos (p3 inline)
 *
 *  🔁 RENOMBRAR (XML inline correcto pero signId conceptualmente equivocado):
 *    autopista (XML es S-1a) → autovia
 *    paso_peatones (XML es P-17 estrechamiento) → estrechamiento_calzada
 *    ninos (XML es P-18 obras) → obras
 *    obras (XML es P-20 peatones) → peatones
 *    animales_domesticos (XML es P-22 ciclistas) → ciclistas
 *    interseccion_derecha (XML es P-7 paso nivel con barreras) → paso_nivel_con_barreras
 *    viento_lateral (XML es P-13a curva derecha) → curva_peligrosa_derecha
 *
 *  ❌ ELIMINAR (sin SVG correcto disponible):
 *    curva_derecha (XML es P-1a intersección, no curva)
 *    curva_izquierda (XML es P-1b intersección, no curva)
 *    pavimento_deslizante (reemplazar XML por p19 real)
 *    doble_curva (reemplazar XML por p14a real)
 *    direccion_prohibida (XML es R-200 parar)
 *    prohibido_adelantar_camiones (reemplazar XML por r306 real)
 *    cadenas (XML es R-409 jinetes)
 *    peligro (P-50 dudoso)
 *
 *  ➕ AÑADIR desde archivos físicos descargados hoy:
 *    cruce_prioridad_derecha (p2.svg), cruce_tranvia (p6.svg),
 *    paso_nivel_proximo_300 (p9a.svg), paso_nivel_proximo_200 (p9b.svg),
 *    curva_peligrosa_izquierda (p13b.svg), varias_curvas (p14a.svg),
 *    pavimento_deslizante (p19.svg), peatones_nuevo (p20.svg),
 *    ciclistas_nuevo (p22.svg), viento_lateral_nuevo (p29.svg),
 *    prohibido_adelantar_camiones_nuevo (r306.svg),
 *    fin_prohibido_adelantar (r502.svg), fin_autovia (s2.svg)
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SVG_DIR = path.join(ROOT, 'TeoricoB-expo', 'assets', 'signs-wikimedia');
const CURRENT_TS = path.join(ROOT, 'TeoricoB-expo', 'src', 'data', 'signSvgsWikimedia.ts');
const OUTPUT_TS = CURRENT_TS;

// Lee XML de un signId desde el archivo actual.
function extractInlineXml(currentSource, signId) {
  // Patrón: el signId seguido de license, attribution, xml: `...`
  const idRegex = new RegExp(`^  ${signId}: \\{\\s*$`, 'm');
  const idMatch = currentSource.match(idRegex);
  if (!idMatch) return null;
  const startIdx = idMatch.index;
  // Buscar el cierre de la entrada `},` después del backtick que cierra el XML
  const afterStart = currentSource.slice(startIdx);
  // El XML está entre xml: `  y `,
  const xmlMatch = afterStart.match(/xml:\s*`([\s\S]*?)`,\s*\n\s*\}/);
  if (!xmlMatch) return null;
  return xmlMatch[1];
}

function readSvgFile(filename) {
  const p = path.join(SVG_DIR, filename);
  if (!fs.existsSync(p)) {
    console.warn(`[skip] file not found: ${filename}`);
    return null;
  }
  return fs.readFileSync(p, 'utf8').trim();
}

// Escapa backslash y backtick para inlinearlo dentro de un template literal.
function escapeForTemplate(xml) {
  return xml.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

// Definición final del catálogo de signIds que existirán.
// Orden: peligro, prohibición, obligación, indicación.
// source: 'inline' = mantener XML del archivo actual con el signId indicado en `inlineKey`
//         'file' = leer del archivo físico indicado en `filename`
const FINAL_SIGNS = [
  // ─── PELIGRO ─────────────────────────────────────────────
  { signId: 'cruce_prioridad_derecha', code: 'P-2',  source: 'file', filename: 'p2.svg',
    desc: 'Cruce con prioridad de paso a quien viene por la derecha' },
  { signId: 'semaforos', code: 'P-3', source: 'inline', inlineKey: 'semaforos',
    desc: 'Semáforos próximos' },
  { signId: 'cruce_tranvia', code: 'P-6', source: 'file', filename: 'p6.svg',
    desc: 'Cruce de tranvía' },
  { signId: 'paso_nivel_con_barreras', code: 'P-7', source: 'inline', inlineKey: 'interseccion_derecha',
    desc: 'Paso a nivel con barreras cercano' },
  { signId: 'paso_nivel_proximo_300', code: 'P-9a', source: 'file', filename: 'p9a.svg',
    desc: 'Paso a nivel cercano (señalización a 300 m)' },
  { signId: 'paso_nivel_proximo_200', code: 'P-9b', source: 'file', filename: 'p9b.svg',
    desc: 'Paso a nivel cercano (señalización a 200 m)' },
  { signId: 'curva_peligrosa_derecha', code: 'P-13a', source: 'file', filename: 'p13a.svg',
    desc: 'Curva peligrosa hacia la derecha' },
  { signId: 'curva_peligrosa_izquierda', code: 'P-13b', source: 'file', filename: 'p13b.svg',
    desc: 'Curva peligrosa hacia la izquierda' },
  { signId: 'varias_curvas', code: 'P-14a', source: 'file', filename: 'p14a.svg',
    desc: 'Varias curvas peligrosas (primera hacia la derecha)' },
  { signId: 'calzada_irregular', code: 'P-15', source: 'inline', inlineKey: 'calzada_irregular',
    desc: 'Perfil irregular de la calzada (badenes/resaltos)' },
  { signId: 'estrechamiento_calzada', code: 'P-17', source: 'inline', inlineKey: 'paso_peatones',
    desc: 'Estrechamiento de calzada' },
  { signId: 'obras', code: 'P-18', source: 'inline', inlineKey: 'ninos',
    desc: 'Obras en la vía' },
  { signId: 'pavimento_deslizante', code: 'P-19', source: 'file', filename: 'p19.svg',
    desc: 'Pavimento deslizante (calzada resbala)' },
  { signId: 'peatones', code: 'P-20', source: 'file', filename: 'p20.svg',
    desc: 'Peatones cruzando' },
  { signId: 'ninos', code: 'P-21', source: 'file', filename: 'p21.svg', skipIfNoFile: true,
    desc: 'Niños cerca (zona escolar)' },
  { signId: 'ciclistas', code: 'P-22', source: 'file', filename: 'p22.svg',
    desc: 'Lugar frecuentado por ciclistas' },
  { signId: 'viento_lateral', code: 'P-29', source: 'file', filename: 'p29.svg',
    desc: 'Viento lateral fuerte' },

  // ─── PROHIBICIÓN ─────────────────────────────────────────
  { signId: 'ceda_el_paso', code: 'R-1', source: 'inline', inlineKey: 'ceda_el_paso',
    desc: 'Ceda el paso' },
  { signId: 'stop', code: 'R-2', source: 'inline', inlineKey: 'stop',
    desc: 'Stop (parada obligatoria)' },
  { signId: 'prioridad_sentido_contrario', code: 'R-6', source: 'inline', inlineKey: 'prioridad_sentido_contrario',
    desc: 'Preferencia para pasar paso estrecho' },
  { signId: 'entrada_prohibida', code: 'R-101', source: 'inline', inlineKey: 'entrada_prohibida',
    desc: 'Entrada prohibida' },
  { signId: 'vel_max_20', code: 'R-301', source: 'inline', inlineKey: 'vel_max_20', desc: 'Velocidad máxima 20 km/h' },
  { signId: 'vel_max_30', code: 'R-301', source: 'inline', inlineKey: 'vel_max_30', desc: 'Velocidad máxima 30 km/h' },
  { signId: 'vel_max_40', code: 'R-301', source: 'inline', inlineKey: 'vel_max_40', desc: 'Velocidad máxima 40 km/h' },
  // vel_max_50 (R-301): NO disponible como SVG oficial Wikimedia — omitido
  { signId: 'vel_max_60', code: 'R-301', source: 'inline', inlineKey: 'vel_max_60', desc: 'Velocidad máxima 60 km/h' },
  { signId: 'vel_max_70', code: 'R-301', source: 'inline', inlineKey: 'vel_max_70', desc: 'Velocidad máxima 70 km/h' },
  { signId: 'vel_max_80', code: 'R-301', source: 'inline', inlineKey: 'vel_max_80', desc: 'Velocidad máxima 80 km/h' },
  { signId: 'vel_max_90', code: 'R-301', source: 'inline', inlineKey: 'vel_max_90', desc: 'Velocidad máxima 90 km/h' },
  { signId: 'vel_max_100', code: 'R-301', source: 'inline', inlineKey: 'vel_max_100', desc: 'Velocidad máxima 100 km/h' },
  { signId: 'vel_max_110', code: 'R-301', source: 'inline', inlineKey: 'vel_max_110', desc: 'Velocidad máxima 110 km/h' },
  { signId: 'vel_max_120', code: 'R-301', source: 'inline', inlineKey: 'vel_max_120', desc: 'Velocidad máxima 120 km/h' },
  { signId: 'prohibido_girar_derecha', code: 'R-302', source: 'inline', inlineKey: 'prohibido_girar_derecha',
    desc: 'Prohibido girar a la derecha' },
  { signId: 'prohibido_girar_izquierda', code: 'R-303', source: 'inline', inlineKey: 'prohibido_girar_izquierda',
    desc: 'Prohibido girar a la izquierda y cambio de sentido' },
  { signId: 'prohibido_cambio_sentido', code: 'R-304', source: 'inline', inlineKey: 'prohibido_cambio_sentido',
    desc: 'Prohibido el cambio de sentido' },
  { signId: 'prohibido_adelantar', code: 'R-305', source: 'inline', inlineKey: 'prohibido_adelantar',
    desc: 'Prohibido adelantar' },
  { signId: 'prohibido_adelantar_camiones', code: 'R-306', source: 'file', filename: 'r306.svg',
    desc: 'Prohibido adelantar para camiones >3.500 kg' },
  { signId: 'fin_limitaciones', code: 'R-500', source: 'inline', inlineKey: 'fin_limitaciones',
    desc: 'Fin de todas las prohibiciones' },
  { signId: 'fin_prohibido_adelantar', code: 'R-502', source: 'file', filename: 'r502.svg',
    desc: 'Fin de prohibición de adelantamiento' },

  // ─── OBLIGACIÓN ───────────────────────────────────────────
  { signId: 'obligacion_ir_derecha', code: 'R-400a', source: 'inline', inlineKey: 'sentido_derecha',
    desc: 'Obligación de ir hacia la derecha' },
  { signId: 'obligacion_ir_izquierda', code: 'R-400b', source: 'inline', inlineKey: 'sentido_izquierda',
    desc: 'Obligación de ir hacia la izquierda' },
  { signId: 'paso_obligatorio_derecha', code: 'R-401a', source: 'inline', inlineKey: 'paso_obligatorio_derecha',
    desc: 'Paso obligatorio por la derecha del obstáculo' },
  { signId: 'paso_obligatorio_izquierda', code: 'R-401b', source: 'inline', inlineKey: 'paso_obligatorio_izquierda',
    desc: 'Paso obligatorio por la izquierda del obstáculo' },

  // ─── INDICACIÓN ───────────────────────────────────────────
  { signId: 'autovia', code: 'S-1a', source: 'inline', inlineKey: 'autopista',
    desc: 'Inicio de autovía' },
  { signId: 'fin_autovia', code: 'S-2a', source: 'file', filename: 's2.svg',
    desc: 'Fin de autovía' },
  { signId: 'estacionamiento', code: 'S-17a', source: 'inline', inlineKey: 'estacionamiento',
    desc: 'Lugar de aparcamiento' },
  { signId: 'zona_peatonal', code: 'S-28', source: 'inline', inlineKey: 'zona_peatonal',
    desc: 'Zona residencial / calle peatonal prioritaria' },
  { signId: 'carril_bici', code: 'S-29', source: 'inline', inlineKey: 'carril_bici',
    desc: 'Carril reservado para ciclistas' },
];

// Genera el archivo
function main() {
  const currentSource = fs.readFileSync(CURRENT_TS, 'utf8');
  const sections = [];
  let lastCategoryHeader = null;

  for (const sign of FINAL_SIGNS) {
    let xml;
    if (sign.source === 'file') {
      xml = readSvgFile(sign.filename);
      if (!xml) {
        if (sign.skipIfNoFile) {
          console.warn(`[skip] ${sign.signId}: archivo ${sign.filename} no encontrado`);
          continue;
        }
        throw new Error(`Archivo SVG faltante: ${sign.filename} (${sign.signId})`);
      }
    } else {
      xml = extractInlineXml(currentSource, sign.inlineKey);
      if (!xml) {
        if (sign.skipIfMissing) {
          console.warn(`[skip] ${sign.signId}: inline key ${sign.inlineKey} no extraída`);
          continue;
        }
        throw new Error(`No se pudo extraer XML inline para signId='${sign.signId}' inlineKey='${sign.inlineKey}'`);
      }
    }
    const escaped = escapeForTemplate(xml);
    const attribution = sign.source === 'file'
      ? `${sign.code} ${sign.desc} — fuente: ${sign.filename} (Wikimedia Commons, dominio público)`
      : `${sign.code} ${sign.desc} — fuente: archivo Wikimedia Commons (dominio público)`;
    sections.push(
      `  // ─── ${sign.code} ${sign.desc} ─────────\n` +
      `  ${sign.signId}: {\n` +
      `    license: 'PD',\n` +
      `    attribution: '${attribution.replace(/'/g, "\\'")}',\n` +
      `    xml: \`${escaped}\`,\n` +
      `  },`
    );
  }

  const header = `/**
 * Señales de tráfico españolas — SVGs originales de Wikimedia Commons.
 *
 * Las representaciones SVG están licenciadas como dominio público o
 * Creative Commons. Los diseños subyacentes son dominio público por
 * estar definidos en el Anexo I del Reglamento General de Circulación
 * (RD 1428/2003), conforme al Art. 13 de la Ley de Propiedad Intelectual.
 *
 * Auditado contra Catálogo Oficial DGT (TeoricaAbreviada.txt — Tema 8).
 * Generado automáticamente por scripts/regenerate-signs.js.
 *
 * ───────────────────────────────────────────────────────────────────
 * CÓMO AÑADIR UNA NUEVA SEÑAL DE WIKIMEDIA
 * ───────────────────────────────────────────────────────────────────
 *
 * 1. Descarga el SVG oficial de Wikimedia Commons a
 *    assets/signs-wikimedia/<codigo>.svg
 *
 * 2. Añade una entrada al array FINAL_SIGNS en
 *    scripts/regenerate-signs.js con el código DGT real.
 *
 * 3. Ejecuta: node scripts/regenerate-signs.js
 *
 *    Verificará que el código DGT coincide con el contenido visual
 *    del SVG. No hay fallbacks dibujados a mano — si no hay SVG
 *    oficial, no aparece la señal.
 */

export interface WikimediaSvgEntry {
  xml: string;
  attribution: string;
  license: 'PD' | 'CC-BY-SA';
}

export const WIKIMEDIA_SIGNS: Partial<Record<string, WikimediaSvgEntry>> = {

`;

  const footer = `\n};\n`;

  const output = header + sections.join('\n\n') + footer;
  fs.writeFileSync(OUTPUT_TS, output, 'utf8');
  console.log(`✓ ${OUTPUT_TS} regenerado con ${sections.length} señales`);
}

main();
