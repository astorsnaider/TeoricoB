/**
 * Biblioteca de señales de tráfico españolas en SVG.
 * Diseños basados en el Reglamento General de Circulación (RD 1428/2003)
 * y la Convención de Viena sobre señales viales (ratificada por España).
 * Los diseños son de dominio público al estar definidos por ley.
 *
 * IMPORTANTE: Cada función de señal retorna un componente Svg COMPLETO (standalone).
 * No envuelvas TrafficSign dentro de otro Svg — úsalo directamente como View.
 */
import React from 'react';
import Svg, {
  Polygon, Circle, Rect, Path, Text as SvgText,
  G, Line, Ellipse,
} from 'react-native-svg';

interface SProps { size?: number }

// ─── COLORES OFICIALES ─────────────────────────────────────────
const RED    = '#E63946';
const WHITE  = '#FFFFFF';
const BLACK  = '#1A1A1A';
const BLUE   = '#003DA5';
const YELLOW = '#FFCC00';
const GREEN  = '#006633';
const ORANGE = '#FF6600';

// ─── SEÑALES DE PELIGRO ─────────────────────────────────────────

export function SignPeligroGenerico({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Polygon points="50,8 94,86 6,86" fill={WHITE} stroke={RED} strokeWidth="7" strokeLinejoin="round" />
      <SvgText x="50" y="76" fontSize="44" fontWeight="bold" fill={BLACK} textAnchor="middle">!</SvgText>
    </Svg>
  );
}

export function SignCurvaDerecha({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Polygon points="50,8 94,86 6,86" fill={WHITE} stroke={RED} strokeWidth="7" strokeLinejoin="round" />
      <Path d="M 42,72 C 42,55 58,55 58,43 C 58,34 50,28 50,28" stroke={BLACK} strokeWidth="6" fill="none" strokeLinecap="round" />
      <Path d="M 44,46 C 55,46 58,55 58,72" stroke={BLACK} strokeWidth="6" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function SignCurvaIzquierda({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Polygon points="50,8 94,86 6,86" fill={WHITE} stroke={RED} strokeWidth="7" strokeLinejoin="round" />
      <Path d="M 58,72 C 58,55 42,55 42,43 C 42,34 50,28 50,28" stroke={BLACK} strokeWidth="6" fill="none" strokeLinecap="round" />
      <Path d="M 56,46 C 45,46 42,55 42,72" stroke={BLACK} strokeWidth="6" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function SignDobleCurva({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Polygon points="50,8 94,86 6,86" fill={WHITE} stroke={RED} strokeWidth="7" strokeLinejoin="round" />
      <Path d="M 44,72 C 44,62 56,58 56,50 C 56,42 44,38 44,28" stroke={BLACK} strokeWidth="5.5" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function SignBaden({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Polygon points="50,8 94,86 6,86" fill={WHITE} stroke={RED} strokeWidth="7" strokeLinejoin="round" />
      <Path d="M 28,65 Q 50,35 72,65" stroke={BLACK} strokeWidth="6" fill="none" strokeLinecap="round" />
      <Line x1="28" y1="68" x2="72" y2="68" stroke={BLACK} strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
}

export function SignCalzadaIrregular({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Polygon points="50,8 94,86 6,86" fill={WHITE} stroke={RED} strokeWidth="7" strokeLinejoin="round" />
      <Path d="M 28,68 L 36,55 L 44,65 L 52,45 L 60,58 L 68,68" stroke={BLACK} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function SignPavimentoDeslizante({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Polygon points="50,8 94,86 6,86" fill={WHITE} stroke={RED} strokeWidth="7" strokeLinejoin="round" />
      <Rect x="38" y="50" width="22" height="14" rx="2" fill={BLACK} />
      <Rect x="40" y="43" width="18" height="9" rx="2" fill={BLACK} />
      <Circle cx="42" cy="65" r="3" fill={BLACK} />
      <Circle cx="56" cy="65" r="3" fill={BLACK} />
      <Path d="M 32,66 C 30,60 34,56 32,50" stroke={BLACK} strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="3,2" />
      <Path d="M 28,70 C 26,64 30,60 28,54" stroke={BLACK} strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="3,2" />
    </Svg>
  );
}

export function SignEstrechamiento({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Polygon points="50,8 94,86 6,86" fill={WHITE} stroke={RED} strokeWidth="7" strokeLinejoin="round" />
      <Path d="M 34,72 L 38,42 L 62,42 L 66,72" stroke={BLACK} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M 34,72 L 50,56 L 66,72" stroke={BLACK} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function SignPasoPeatones({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Polygon points="50,8 94,86 6,86" fill={WHITE} stroke={RED} strokeWidth="7" strokeLinejoin="round" />
      <Circle cx="50" cy="34" r="5" fill={BLACK} />
      <Line x1="50" y1="39" x2="50" y2="56" stroke={BLACK} strokeWidth="5" strokeLinecap="round" />
      <Line x1="50" y1="45" x2="43" y2="52" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
      <Line x1="50" y1="45" x2="57" y2="52" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
      <Line x1="50" y1="56" x2="44" y2="67" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
      <Line x1="50" y1="56" x2="56" y2="67" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
      <Line x1="36" y1="71" x2="64" y2="71" stroke={BLACK} strokeWidth="3" />
    </Svg>
  );
}

export function SignNinos({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Polygon points="50,8 94,86 6,86" fill={WHITE} stroke={RED} strokeWidth="7" strokeLinejoin="round" />
      <Circle cx="43" cy="33" r="4" fill={BLACK} />
      <Line x1="43" y1="37" x2="43" y2="52" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
      <Line x1="43" y1="52" x2="38" y2="63" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
      <Line x1="43" y1="52" x2="48" y2="63" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
      <Circle cx="57" cy="33" r="4" fill={BLACK} />
      <Line x1="57" y1="37" x2="57" y2="52" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
      <Line x1="57" y1="52" x2="52" y2="63" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
      <Line x1="57" y1="52" x2="62" y2="63" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
      <Line x1="43" y1="42" x2="57" y2="42" stroke={BLACK} strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
}

export function SignCiclistas({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Polygon points="50,8 94,86 6,86" fill={WHITE} stroke={RED} strokeWidth="7" strokeLinejoin="round" />
      <Circle cx="50" cy="31" r="4" fill={BLACK} />
      <Circle cx="37" cy="62" r="9" fill="none" stroke={BLACK} strokeWidth="4" />
      <Circle cx="63" cy="62" r="9" fill="none" stroke={BLACK} strokeWidth="4" />
      <Path d="M 46,35 L 40,52 L 50,52 L 56,38 L 50,38" stroke={BLACK} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="40" y1="52" x2="63" y2="52" stroke={BLACK} strokeWidth="3.5" strokeLinecap="round" />
    </Svg>
  );
}

export function SignAnimalesDomesticos({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Polygon points="50,8 94,86 6,86" fill={WHITE} stroke={RED} strokeWidth="7" strokeLinejoin="round" />
      <Path d="M 38,68 L 38,52 L 42,44 L 50,40 L 58,44 L 62,52 L 62,68" stroke={BLACK} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="45" cy="43" r="5" fill={BLACK} />
      <Circle cx="55" cy="41" r="5" fill={BLACK} />
      <Line x1="38" y1="58" x2="32" y2="68" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
      <Line x1="44" y1="60" x2="44" y2="70" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
      <Line x1="56" y1="60" x2="56" y2="70" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
      <Line x1="62" y1="58" x2="68" y2="68" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
    </Svg>
  );
}

export function SignObras({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Polygon points="50,8 94,86 6,86" fill={WHITE} stroke={RED} strokeWidth="7" strokeLinejoin="round" />
      <Circle cx="50" cy="32" r="5" fill={BLACK} />
      <Rect x="43" y="37" width="14" height="16" rx="2" fill={ORANGE} />
      <Line x1="57" y1="40" x2="65" y2="68" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
      <Ellipse cx="65" cy="71" rx="5" ry="3" fill={BLACK} />
      <Line x1="47" y1="53" x2="44" y2="67" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
      <Line x1="53" y1="53" x2="56" y2="67" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
    </Svg>
  );
}

export function SignPasoNivelSinBarreras({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Polygon points="50,8 94,86 6,86" fill={WHITE} stroke={RED} strokeWidth="7" strokeLinejoin="round" />
      <Rect x="35" y="42" width="30" height="22" rx="3" fill={BLACK} />
      <Rect x="38" y="37" width="24" height="8" rx="2" fill={BLACK} />
      <Circle cx="42" cy="66" r="4" fill={BLACK} />
      <Circle cx="58" cy="66" r="4" fill={BLACK} />
      <Circle cx="42" cy="48" r="3" fill={YELLOW} />
      <Circle cx="58" cy="48" r="3" fill={YELLOW} />
      <Line x1="32" y1="70" x2="68" y2="70" stroke={BLACK} strokeWidth="3" />
    </Svg>
  );
}

export function SignPasoNivelConBarreras({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Polygon points="50,8 94,86 6,86" fill={WHITE} stroke={RED} strokeWidth="7" strokeLinejoin="round" />
      <Rect x="36" y="28" width="10" height="46" rx="3" fill={RED} transform="rotate(30,50,51)" />
      <Rect x="36" y="28" width="10" height="46" rx="3" fill={RED} transform="rotate(-30,50,51)" />
      <Line x1="28" y1="70" x2="72" y2="70" stroke={BLACK} strokeWidth="4" />
      <Line x1="28" y1="70" x2="28" y2="62" stroke={BLACK} strokeWidth="4" />
      <Line x1="72" y1="70" x2="72" y2="62" stroke={BLACK} strokeWidth="4" />
    </Svg>
  );
}

export function SignVientoLateral({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Polygon points="50,8 94,86 6,86" fill={WHITE} stroke={RED} strokeWidth="7" strokeLinejoin="round" />
      <Rect x="42" y="52" width="20" height="14" rx="2" fill={BLACK} />
      <Rect x="45" y="46" width="14" height="9" rx="2" fill={BLACK} />
      <Circle cx="46" cy="67" r="3" fill={BLACK} />
      <Circle cx="58" cy="67" r="3" fill={BLACK} />
      <Path d="M28,42 L40,42" stroke={BLACK} strokeWidth="3" strokeLinecap="round" />
      <Path d="M36,42 L34,38 M36,42 L34,46" stroke={BLACK} strokeWidth="3" strokeLinecap="round" />
      <Path d="M28,50 L40,50" stroke={BLACK} strokeWidth="3" strokeLinecap="round" />
      <Path d="M36,50 L34,46 M36,50 L34,54" stroke={BLACK} strokeWidth="3" strokeLinecap="round" />
      <Path d="M28,58 L38,58" stroke={BLACK} strokeWidth="3" strokeLinecap="round" />
      <Path d="M34,58 L32,54 M34,58 L32,62" stroke={BLACK} strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
}

export function SignInterseccionDerecha({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Polygon points="50,8 94,86 6,86" fill={WHITE} stroke={RED} strokeWidth="7" strokeLinejoin="round" />
      <Rect x="44" y="28" width="12" height="46" fill={BLACK} />
      <Rect x="56" y="44" width="16" height="12" fill={BLACK} />
      <Path d="M50,30 L44,38 L50,38 L50,30" fill={WHITE} />
      <Path d="M50,72 L44,64 L56,64 L50,72" fill={WHITE} />
      <Path d="M70,50 L62,44 L62,56 L70,50" fill={WHITE} />
    </Svg>
  );
}

export function SignSemaforos({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Polygon points="50,8 94,86 6,86" fill={WHITE} stroke={RED} strokeWidth="7" strokeLinejoin="round" />
      <Rect x="40" y="30" width="20" height="42" rx="4" fill={BLACK} />
      <Circle cx="50" cy="40" r="5" fill={RED} />
      <Circle cx="50" cy="51" r="5" fill={YELLOW} />
      <Circle cx="50" cy="62" r="5" fill={GREEN} />
    </Svg>
  );
}

export function SignDesprendimientos({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Polygon points="50,8 94,86 6,86" fill={WHITE} stroke={RED} strokeWidth="7" strokeLinejoin="round" />
      <Path d="M 36,42 L 60,28 L 65,70" stroke={BLACK} strokeWidth="4" fill="none" />
      <Path d="M 36,42 L 65,70 L 36,70 Z" fill="#888" opacity="0.5" />
      <Circle cx="50" cy="60" r="5" fill={BLACK} />
      <Circle cx="60" cy="52" r="4" fill={BLACK} />
      <Circle cx="44" cy="54" r="3" fill={BLACK} />
    </Svg>
  );
}

// ─── SEÑALES DE REGLAMENTACIÓN (PROHIBICIÓN / RESTRICCIÓN) ─────

export function SignStop({ size = 100 }: SProps) {
  const pts = Array.from({ length: 8 }, (_, i) => {
    const a = (i * 45 - 22.5) * Math.PI / 180;
    return `${50 + 44 * Math.cos(a)},${50 + 44 * Math.sin(a)}`;
  }).join(' ');
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Polygon points={pts} fill={RED} />
      <SvgText x="50" y="58" fontSize="18" fontWeight="bold" fill={WHITE} textAnchor="middle" letterSpacing="-1">STOP</SvgText>
    </Svg>
  );
}

export function SignCedaElPaso({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Polygon points="6,14 94,14 50,90" fill={WHITE} stroke={RED} strokeWidth="7" strokeLinejoin="round" />
      <SvgText x="50" y="42" fontSize="9" fontWeight="bold" fill={RED} textAnchor="middle">CEDA EL</SvgText>
      <SvgText x="50" y="52" fontSize="9" fontWeight="bold" fill={RED} textAnchor="middle">PASO</SvgText>
    </Svg>
  );
}

export function SignVelocidadMaxima({ size = 100, limit }: SProps & { limit: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="46" fill={WHITE} />
      <Circle cx="50" cy="50" r="46" fill="none" stroke={RED} strokeWidth="7" />
      <SvgText x="50" y={limit >= 100 ? "60" : "62"} fontSize={limit >= 100 ? "28" : "32"} fontWeight="bold" fill={BLACK} textAnchor="middle">{limit}</SvgText>
    </Svg>
  );
}

export function SignProhibidoAdelantar({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="46" fill={WHITE} />
      <Circle cx="50" cy="50" r="46" fill="none" stroke={RED} strokeWidth="7" />
      <Rect x="22" y="38" width="22" height="14" rx="2" fill={BLACK} />
      <Rect x="25" y="32" width="16" height="8" rx="2" fill={BLACK} />
      <Rect x="56" y="38" width="22" height="14" rx="2" fill={RED} />
      <Rect x="59" y="32" width="16" height="8" rx="2" fill={RED} />
      <Line x1="72" y1="26" x2="28" y2="74" stroke={RED} strokeWidth="7" strokeLinecap="round" />
    </Svg>
  );
}

export function SignProhibidoAdelantarCamiones({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="46" fill={WHITE} />
      <Circle cx="50" cy="50" r="46" fill="none" stroke={RED} strokeWidth="7" />
      <Rect x="18" y="40" width="26" height="16" rx="2" fill={BLACK} />
      <Rect x="22" y="32" width="10" height="10" rx="1" fill={BLACK} />
      <Rect x="56" y="40" width="26" height="16" rx="2" fill="#E63946" opacity="0.7" />
      <Rect x="60" y="32" width="10" height="10" rx="1" fill="#E63946" opacity="0.7" />
      <Line x1="72" y1="26" x2="28" y2="74" stroke={RED} strokeWidth="7" strokeLinecap="round" />
    </Svg>
  );
}

export function SignDireccionProhibida({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="46" fill={WHITE} />
      <Circle cx="50" cy="50" r="46" fill="none" stroke={RED} strokeWidth="7" />
      <Rect x="22" y="42" width="56" height="16" rx="4" fill={WHITE} />
    </Svg>
  );
}

export function SignEntradaProhibida({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="46" fill={RED} />
      <Rect x="22" y="43" width="56" height="14" rx="3" fill={WHITE} />
    </Svg>
  );
}

export function SignProhibidoGirarDerecha({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="46" fill={WHITE} />
      <Circle cx="50" cy="50" r="46" fill="none" stroke={RED} strokeWidth="7" />
      <Path d="M 35,60 L 35,38 C 35,30 65,30 65,45" stroke={BLACK} strokeWidth="6" fill="none" strokeLinecap="round" />
      <Path d="M 58,38 L 65,45 L 58,52" stroke={BLACK} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="72" y1="26" x2="28" y2="74" stroke={RED} strokeWidth="7" strokeLinecap="round" />
    </Svg>
  );
}

export function SignProhibidoGirarIzquierda({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="46" fill={WHITE} />
      <Circle cx="50" cy="50" r="46" fill="none" stroke={RED} strokeWidth="7" />
      <Path d="M 65,60 L 65,38 C 65,30 35,30 35,45" stroke={BLACK} strokeWidth="6" fill="none" strokeLinecap="round" />
      <Path d="M 42,38 L 35,45 L 42,52" stroke={BLACK} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="72" y1="26" x2="28" y2="74" stroke={RED} strokeWidth="7" strokeLinecap="round" />
    </Svg>
  );
}

export function SignProhibidoCambioSentido({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="46" fill={WHITE} />
      <Circle cx="50" cy="50" r="46" fill="none" stroke={RED} strokeWidth="7" />
      <Path d="M 30,60 L 30,42 C 30,30 70,30 70,45 L 70,60" stroke={BLACK} strokeWidth="5.5" fill="none" strokeLinecap="round" />
      <Path d="M 62,37 L 70,45 L 62,53" stroke={BLACK} strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="72" y1="26" x2="28" y2="74" stroke={RED} strokeWidth="7" strokeLinecap="round" />
    </Svg>
  );
}

export function SignFinLimitaciones({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="46" fill={WHITE} />
      <Circle cx="50" cy="50" r="46" fill="none" stroke="#888" strokeWidth="5" strokeDasharray="6,4" />
      <Line x1="30" y1="26" x2="70" y2="74" stroke={BLACK} strokeWidth="5" strokeLinecap="round" />
      <Line x1="44" y1="24" x2="76" y2="64" stroke={BLACK} strokeWidth="5" strokeLinecap="round" />
      <Line x1="24" y1="42" x2="56" y2="76" stroke={BLACK} strokeWidth="5" strokeLinecap="round" />
    </Svg>
  );
}

export function SignFinProhibidoAdelantar({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="46" fill={WHITE} />
      <Circle cx="50" cy="50" r="46" fill="none" stroke="#888" strokeWidth="5" strokeDasharray="6,4" />
      <Rect x="22" y="38" width="22" height="14" rx="2" fill="#888" />
      <Rect x="56" y="38" width="22" height="14" rx="2" fill="#888" opacity="0.5" />
      <Line x1="30" y1="26" x2="70" y2="74" stroke={BLACK} strokeWidth="5" strokeLinecap="round" />
      <Line x1="44" y1="24" x2="76" y2="64" stroke={BLACK} strokeWidth="5" strokeLinecap="round" />
    </Svg>
  );
}

export function SignPrioridadSentidoContrario({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Polygon points="50,8 94,86 6,86" fill={WHITE} stroke={RED} strokeWidth="7" strokeLinejoin="round" />
      <Path d="M 50,30 L 50,55" stroke={RED} strokeWidth="10" strokeLinecap="round" />
      <Polygon points="40,46 50,30 60,46" fill={RED} />
      <Path d="M 50,75 L 50,58" stroke={BLACK} strokeWidth="6" strokeLinecap="round" />
      <Polygon points="43,62 50,75 57,62" fill={BLACK} />
    </Svg>
  );
}

// ─── SEÑALES DE OBLIGACIÓN ──────────────────────────────────────

export function SignSentidoObligatorio({ size = 100, direction = 'right' }: SProps & { direction?: 'right' | 'left' | 'straight' | 'right-straight' }) {
  const arrowPath = {
    right: 'M 25,50 L 65,50 M 58,40 L 68,50 L 58,60',
    left: 'M 75,50 L 35,50 M 42,40 L 32,50 L 42,60',
    straight: 'M 50,72 L 50,30 M 40,40 L 50,28 L 60,40',
    'right-straight': 'M 35,60 L 35,42 M 35,42 L 60,42 M 52,34 L 62,42 L 52,50',
  }[direction];
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="46" fill={BLUE} />
      <Path d={arrowPath} stroke={WHITE} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function SignPasoObligatorioIzquierda({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="46" fill={BLUE} />
      <Path d="M 50,25 L 50,55 L 30,55" stroke={WHITE} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Polygon points="22,55 36,48 36,62" fill={WHITE} />
    </Svg>
  );
}

export function SignPasoObligatorioDerecha({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="46" fill={BLUE} />
      <Path d="M 50,25 L 50,55 L 70,55" stroke={WHITE} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Polygon points="78,55 64,48 64,62" fill={WHITE} />
    </Svg>
  );
}

export function SignVelocidadMinima({ size = 100, min = 60 }: SProps & { min?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="46" fill={BLUE} />
      <SvgText x="50" y="62" fontSize="32" fontWeight="bold" fill={WHITE} textAnchor="middle">{min}</SvgText>
    </Svg>
  );
}

export function SignCadenas({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="46" fill={BLUE} />
      <Circle cx="50" cy="50" r="20" fill="none" stroke={WHITE} strokeWidth="8" />
      <Circle cx="50" cy="50" r="10" fill="none" stroke={WHITE} strokeWidth="4" />
      <Line x1="30" y1="50" x2="70" y2="50" stroke={WHITE} strokeWidth="4" />
      <Line x1="50" y1="30" x2="50" y2="70" stroke={WHITE} strokeWidth="4" />
    </Svg>
  );
}

// ─── SEÑALES DE INDICACIÓN ──────────────────────────────────────

export function SignAutopista({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x="4" y="22" width="92" height="56" rx="5" fill={BLUE} />
      <Rect x="10" y="30" width="80" height="40" rx="3" fill={WHITE} />
      <Rect x="47" y="30" width="6" height="40" rx="1" fill={BLUE} />
      <Path d="M 14,62 C 14,48 26,44 26,44" stroke={BLUE} strokeWidth="5" fill="none" strokeLinecap="round" />
      <Path d="M 76,44 C 76,58 88,62 88,62" stroke={BLUE} strokeWidth="5" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function SignAutovia({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x="4" y="22" width="92" height="56" rx="5" fill={GREEN} />
      <Rect x="10" y="30" width="80" height="40" rx="3" fill={WHITE} />
      <Rect x="47" y="30" width="6" height="40" rx="1" fill={GREEN} />
      <Path d="M 14,62 C 14,48 26,44 26,44" stroke={GREEN} strokeWidth="5" fill="none" strokeLinecap="round" />
      <Path d="M 76,44 C 76,58 88,62 88,62" stroke={GREEN} strokeWidth="5" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function SignZonaPeatonal({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x="4" y="16" width="92" height="68" rx="5" fill={BLUE} />
      <Rect x="10" y="22" width="80" height="56" rx="3" fill="none" stroke={WHITE} strokeWidth="2.5" />
      <Circle cx="50" cy="35" r="6" fill={WHITE} />
      <Line x1="50" y1="41" x2="50" y2="58" stroke={WHITE} strokeWidth="5" strokeLinecap="round" />
      <Line x1="50" y1="48" x2="42" y2="55" stroke={WHITE} strokeWidth="4" strokeLinecap="round" />
      <Line x1="50" y1="48" x2="58" y2="55" stroke={WHITE} strokeWidth="4" strokeLinecap="round" />
      <Line x1="50" y1="58" x2="44" y2="68" stroke={WHITE} strokeWidth="4" strokeLinecap="round" />
      <Line x1="50" y1="58" x2="56" y2="68" stroke={WHITE} strokeWidth="4" strokeLinecap="round" />
    </Svg>
  );
}

export function SignEstacionamiento({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x="4" y="16" width="92" height="68" rx="5" fill={BLUE} />
      <SvgText x="50" y="72" fontSize="56" fontWeight="bold" fill={WHITE} textAnchor="middle">P</SvgText>
    </Svg>
  );
}

export function SignCarrilBici({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x="4" y="16" width="92" height="68" rx="5" fill={BLUE} />
      <Circle cx="50" cy="31" r="4" fill={WHITE} />
      <Circle cx="37" cy="62" r="9" fill="none" stroke={WHITE} strokeWidth="4" />
      <Circle cx="63" cy="62" r="9" fill="none" stroke={WHITE} strokeWidth="4" />
      <Path d="M 46,35 L 40,52 L 50,52 L 56,38 L 50,38" stroke={WHITE} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="40" y1="52" x2="63" y2="52" stroke={WHITE} strokeWidth="3.5" strokeLinecap="round" />
    </Svg>
  );
}

// ─── SEMÁFOROS ──────────────────────────────────────────────────

export function SignSemaforoRojo({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x="32" y="10" width="36" height="80" rx="6" fill={BLACK} />
      <Circle cx="50" cy="28" r="12" fill={RED} />
      <Circle cx="50" cy="50" r="12" fill="#333" />
      <Circle cx="50" cy="72" r="12" fill="#333" />
    </Svg>
  );
}

export function SignSemaforoAmbar({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x="32" y="10" width="36" height="80" rx="6" fill={BLACK} />
      <Circle cx="50" cy="28" r="12" fill="#333" />
      <Circle cx="50" cy="50" r="12" fill={YELLOW} />
      <Circle cx="50" cy="72" r="12" fill="#333" />
    </Svg>
  );
}

export function SignSemaforoVerde({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x="32" y="10" width="36" height="80" rx="6" fill={BLACK} />
      <Circle cx="50" cy="28" r="12" fill="#333" />
      <Circle cx="50" cy="50" r="12" fill="#333" />
      <Circle cx="50" cy="72" r="12" fill={GREEN} />
    </Svg>
  );
}

// ─── MARCAS VIALES ──────────────────────────────────────────────

export function MarkLineaContinua({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect width="100" height="100" fill="#555" />
      <Rect x="44" y="0" width="12" height="100" fill={WHITE} />
    </Svg>
  );
}

export function MarkLineaDiscontinua({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect width="100" height="100" fill="#555" />
      <Rect x="44" y="5" width="12" height="22" rx="2" fill={WHITE} />
      <Rect x="44" y="39" width="12" height="22" rx="2" fill={WHITE} />
      <Rect x="44" y="73" width="12" height="22" rx="2" fill={WHITE} />
    </Svg>
  );
}

export function MarkCedaElPasoSuelo({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect width="100" height="100" fill="#555" />
      <Polygon points="50,20 82,70 18,70" fill="none" stroke={WHITE} strokeWidth="5" strokeLinejoin="round" />
      <Line x1="10" y1="80" x2="90" y2="80" stroke={WHITE} strokeWidth="6" strokeLinecap="round" strokeDasharray="8,6" />
    </Svg>
  );
}

export function MarkStopSuelo({ size = 100 }: SProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect width="100" height="100" fill="#555" />
      <Rect x="10" y="42" width="80" height="16" rx="2" fill={WHITE} />
      <SvgText x="50" y="58" fontSize="14" fontWeight="bold" fill="#555" textAnchor="middle">STOP</SvgText>
    </Svg>
  );
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────

export type SignId =
  // Peligro
  | 'peligro' | 'curva_derecha' | 'curva_izquierda' | 'doble_curva' | 'baden'
  | 'calzada_irregular' | 'pavimento_deslizante' | 'estrechamiento'
  | 'paso_peatones' | 'ninos' | 'ciclistas' | 'animales_domesticos' | 'obras'
  | 'paso_nivel_sin' | 'paso_nivel_con' | 'viento_lateral' | 'interseccion_derecha'
  | 'semaforos' | 'desprendimientos'
  // Prohibición
  | 'stop' | 'ceda_el_paso' | 'prioridad_sentido_contrario'
  | 'vel_max_20' | 'vel_max_30' | 'vel_max_40' | 'vel_max_50'
  | 'vel_max_60' | 'vel_max_70' | 'vel_max_80' | 'vel_max_90'
  | 'vel_max_100' | 'vel_max_110' | 'vel_max_120'
  | 'prohibido_adelantar' | 'prohibido_adelantar_camiones'
  | 'direccion_prohibida' | 'entrada_prohibida'
  | 'prohibido_girar_derecha' | 'prohibido_girar_izquierda'
  | 'prohibido_cambio_sentido' | 'fin_limitaciones' | 'fin_prohibido_adelantar'
  // Obligación
  | 'sentido_recto' | 'sentido_derecha' | 'sentido_izquierda'
  | 'paso_obligatorio_izquierda' | 'paso_obligatorio_derecha'
  | 'vel_min_60' | 'cadenas'
  // Indicación
  | 'autopista' | 'autovia' | 'zona_peatonal' | 'estacionamiento'
  | 'carril_bici'
  // Semáforos
  | 'semaforo_rojo' | 'semaforo_ambar' | 'semaforo_verde'
  // Marcas
  | 'linea_continua' | 'linea_discontinua' | 'ceda_suelo' | 'stop_suelo';

/**
 * Renderiza una señal de tráfico por su ID.
 * Retorna un componente Svg standalone — úsalo directamente, sin envolverlo en otro Svg.
 */
export function TrafficSign({ signId, size = 100 }: { signId: string; size?: number }) {
  const s = size;
  const map: Record<string, React.ReactElement> = {
    // Peligro
    peligro:                   <SignPeligroGenerico size={s} />,
    curva_derecha:             <SignCurvaDerecha size={s} />,
    curva_izquierda:           <SignCurvaIzquierda size={s} />,
    doble_curva:               <SignDobleCurva size={s} />,
    baden:                     <SignBaden size={s} />,
    calzada_irregular:         <SignCalzadaIrregular size={s} />,
    pavimento_deslizante:      <SignPavimentoDeslizante size={s} />,
    estrechamiento:            <SignEstrechamiento size={s} />,
    paso_peatones:             <SignPasoPeatones size={s} />,
    ninos:                     <SignNinos size={s} />,
    ciclistas:                 <SignCiclistas size={s} />,
    animales_domesticos:       <SignAnimalesDomesticos size={s} />,
    obras:                     <SignObras size={s} />,
    paso_nivel_sin:            <SignPasoNivelSinBarreras size={s} />,
    paso_nivel_con:            <SignPasoNivelConBarreras size={s} />,
    viento_lateral:            <SignVientoLateral size={s} />,
    interseccion_derecha:      <SignInterseccionDerecha size={s} />,
    semaforos:                 <SignSemaforos size={s} />,
    desprendimientos:          <SignDesprendimientos size={s} />,
    // Prohibición
    stop:                      <SignStop size={s} />,
    ceda_el_paso:              <SignCedaElPaso size={s} />,
    prioridad_sentido_contrario: <SignPrioridadSentidoContrario size={s} />,
    vel_max_20:                <SignVelocidadMaxima size={s} limit={20} />,
    vel_max_30:                <SignVelocidadMaxima size={s} limit={30} />,
    vel_max_40:                <SignVelocidadMaxima size={s} limit={40} />,
    vel_max_50:                <SignVelocidadMaxima size={s} limit={50} />,
    vel_max_60:                <SignVelocidadMaxima size={s} limit={60} />,
    vel_max_70:                <SignVelocidadMaxima size={s} limit={70} />,
    vel_max_80:                <SignVelocidadMaxima size={s} limit={80} />,
    vel_max_90:                <SignVelocidadMaxima size={s} limit={90} />,
    vel_max_100:               <SignVelocidadMaxima size={s} limit={100} />,
    vel_max_110:               <SignVelocidadMaxima size={s} limit={110} />,
    vel_max_120:               <SignVelocidadMaxima size={s} limit={120} />,
    prohibido_adelantar:       <SignProhibidoAdelantar size={s} />,
    prohibido_adelantar_camiones: <SignProhibidoAdelantarCamiones size={s} />,
    direccion_prohibida:       <SignDireccionProhibida size={s} />,
    entrada_prohibida:         <SignEntradaProhibida size={s} />,
    prohibido_girar_derecha:   <SignProhibidoGirarDerecha size={s} />,
    prohibido_girar_izquierda: <SignProhibidoGirarIzquierda size={s} />,
    prohibido_cambio_sentido:  <SignProhibidoCambioSentido size={s} />,
    fin_limitaciones:          <SignFinLimitaciones size={s} />,
    fin_prohibido_adelantar:   <SignFinProhibidoAdelantar size={s} />,
    // Obligación
    sentido_recto:             <SignSentidoObligatorio size={s} direction="straight" />,
    sentido_derecha:           <SignSentidoObligatorio size={s} direction="right" />,
    sentido_izquierda:         <SignSentidoObligatorio size={s} direction="left" />,
    paso_obligatorio_izquierda:<SignPasoObligatorioDerecha size={s} />,
    paso_obligatorio_derecha:  <SignPasoObligatorioIzquierda size={s} />,
    vel_min_60:                <SignVelocidadMinima size={s} min={60} />,
    cadenas:                   <SignCadenas size={s} />,
    // Indicación
    autopista:                 <SignAutopista size={s} />,
    autovia:                   <SignAutovia size={s} />,
    zona_peatonal:             <SignZonaPeatonal size={s} />,
    estacionamiento:           <SignEstacionamiento size={s} />,
    carril_bici:               <SignCarrilBici size={s} />,
    // Semáforos
    semaforo_rojo:             <SignSemaforoRojo size={s} />,
    semaforo_ambar:            <SignSemaforoAmbar size={s} />,
    semaforo_verde:            <SignSemaforoVerde size={s} />,
    // Marcas
    linea_continua:            <MarkLineaContinua size={s} />,
    linea_discontinua:         <MarkLineaDiscontinua size={s} />,
    ceda_suelo:                <MarkCedaElPasoSuelo size={s} />,
    stop_suelo:                <MarkStopSuelo size={s} />,
  };
  return map[signId] ?? <SignPeligroGenerico size={s} />;
}
