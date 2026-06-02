/**
 * Renderizador de señales de tráfico oficiales DGT.
 *
 * Solo muestra señales con SVG verificado proveniente de Wikimedia Commons
 * (catálogo oficial Anexo I del RGC, RD 1428/2003).
 *
 * NO existen señales dibujadas a mano. Si un signId no tiene SVG oficial,
 * se muestra un placeholder visible indicando que la imagen no está
 * disponible — preferible a mostrar una representación inexacta que
 * pueda inducir a error.
 *
 * Para añadir nuevas señales: ver scripts/regenerate-signs.js
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { WIKIMEDIA_SIGNS } from '../data/signSvgsWikimedia';

export type SignId = string;

// Normaliza un SVG para que se escale correctamente dentro de cualquier
// contenedor. Muchos SVGs de Wikimedia tienen width/height intrínsecos
// pero carecen de viewBox — al quitar width/height sin viewBox, el SVG
// queda sin sistema de coordenadas y los paths se ven cortados.
//
// Estrategia:
//   1. Si tiene width+height pero no viewBox → añadir viewBox="0 0 W H"
//   2. Quitar width/height intrínsecos (que pasen a controlarlos width/height
//      del elemento React)
//   3. Garantizar preserveAspectRatio="xMidYMid meet" para centrado +
//      contención (letterbox)
function normalizeSvg(xml: string): string {
  // Caso A: tiene viewBox con offset positivo (X>0, Y>0) Y el primer <g> hijo
  // del <svg> aplica translate(-X, -Y) — patrón de exportadores PowerPoint/
  // PowerPoint Online. En este caso el viewport ve la región (X,Y)→(X+W,Y+H)
  // pero los paths quedan en (0,0)→(W,H) tras el translate, por lo que se ven
  // vacíos. Solución: cambiar viewBox a (0,0,W,H).
  //
  // Caso B: viewBox con offset negativo (paths centrados en origin) — DEJAR
  // TAL CUAL. Pasa con R-301 (vel_max_*) cuyo viewBox es ~"-360 -360 770 770".
  //
  // Caso C: sin viewBox pero con width/height intrínsecos — añadir viewBox.
  return xml.replace(
    /<svg\b([^>]*)>(\s*<g\s+[^>]*transform="translate\(([\-\d.]+)[\s,]+([\-\d.]+)\)")?/,
    (_match, svgAttrsRaw: string, firstGroup, gx, gy) => {
      let attrs = svgAttrsRaw;
      const viewBoxMatch = attrs.match(/\bviewBox\s*=\s*"([\d.\-\s]+)"/i);
      const widthMatch = attrs.match(/\bwidth\s*=\s*"([\d.]+)(?:px)?"/i);
      const heightMatch = attrs.match(/\bheight\s*=\s*"([\d.]+)(?:px)?"/i);

      if (viewBoxMatch) {
        const parts = viewBoxMatch[1].trim().split(/[\s,]+/).map(Number);
        if (parts.length === 4) {
          const [x, y, w, h] = parts;
          // Solo normalizar si offset positivo Y existe translate inverso
          // que matchea (tolerancia de 1px para floats).
          const hasMatchingTranslate =
            firstGroup &&
            Math.abs(Number(gx) + x) < 1 &&
            Math.abs(Number(gy) + y) < 1;
          if (x > 0 && y > 0 && hasMatchingTranslate) {
            attrs = attrs.replace(
              /\bviewBox\s*=\s*"[^"]*"/i,
              `viewBox="0 0 ${w} ${h}"`
            );
          }
        }
      } else if (widthMatch && heightMatch) {
        attrs = ` viewBox="0 0 ${widthMatch[1]} ${heightMatch[1]}"` + attrs;
      }

      // Quitar width/height intrínsecos para que SVG se ajuste al contenedor
      attrs = attrs
        .replace(/\s+width\s*=\s*"[^"]*"/i, '')
        .replace(/\s+height\s*=\s*"[^"]*"/i, '');

      if (!/preserveAspectRatio=/i.test(attrs)) {
        attrs += ' preserveAspectRatio="xMidYMid meet"';
      }

      // Reconstruir conservando el primer <g> si lo había
      return firstGroup ? `<svg${attrs}>${firstGroup}` : `<svg${attrs}>`;
    }
  );
}

// Cuando varios SVGs con el mismo `id=` (típicamente "clip0", "XMLID_3_")
// se inyectan en el DOM, los `url(#id)` colisionan: todos resuelven al
// primer SVG y los demás se ven vacíos o mal. Prefijamos cada id (y sus
// referencias) con el signId para hacerlos únicos.
function uniquifyIds(xml: string, signId: string): string {
  const prefix = `${signId}_`;
  // Recolectar todos los ids declarados
  const ids = new Set<string>();
  const idRegex = /\bid\s*=\s*"([^"]+)"/g;
  let m;
  while ((m = idRegex.exec(xml))) ids.add(m[1]);
  if (ids.size === 0) return xml;

  let out = xml;
  for (const id of ids) {
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(`\\bid\\s*=\\s*"${escaped}"`, 'g'), `id="${prefix}${id}"`);
    out = out.replace(new RegExp(`url\\(#${escaped}\\)`, 'g'), `url(#${prefix}${id})`);
    out = out.replace(new RegExp(`xlink:href\\s*=\\s*"#${escaped}"`, 'g'), `xlink:href="#${prefix}${id}"`);
    out = out.replace(new RegExp(`href\\s*=\\s*"#${escaped}"`, 'g'), `href="#${prefix}${id}"`);
  }
  return out;
}

export function TrafficSign({ signId, size = 100 }: { signId: string; size?: number }) {
  const entry = WIKIMEDIA_SIGNS[signId];
  if (entry) {
    const cleaned = uniquifyIds(normalizeSvg(entry.xml), signId);
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <SvgXml xml={cleaned} width="100%" height="100%" />
      </View>
    );
  }
  return <SignPlaceholder size={size} />;
}

function SignPlaceholder({ size }: { size: number }) {
  return (
    <View
      style={[
        styles.placeholder,
        { width: size, height: size, borderRadius: size * 0.08 },
      ]}
      accessibilityLabel="Imagen oficial de la señal no disponible"
    >
      <Text style={[styles.placeholderText, { fontSize: Math.max(10, size * 0.11) }]}>
        Sin{'\n'}imagen{'\n'}oficial
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#EAEAEA',
    borderWidth: 1,
    borderColor: '#B0B0B0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
  },
});
