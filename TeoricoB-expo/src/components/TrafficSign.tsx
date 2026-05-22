/**
 * Biblioteca de señales de tráfico españolas en SVG.
 * Diseños basados en el Reglamento General de Circulación (RD 1428/2003)
 * y la Convención de Viena sobre señales viales (ratificada por España).
 * Los diseños son de dominio público al estar definidos por ley.
 */
import React from 'react';
import Svg, {
  Polygon, Circle, Rect, Path, Text as SvgText,
  G, Line, Defs, ClipPath, Ellipse,
} from 'react-native-svg';

const S = 100; // viewBox size
const CX = 50; const CY = 50; // center

// ─── COLORES OFICIALES ─────────────────────────────────────────
const RED    = '#E63946';
const WHITE  = '#FFFFFF';
const BLACK  = '#1A1A1A';
const BLUE   = '#003DA5';
const YELLOW = '#FFCC00';
const GREEN  = '#006633';
const ORANGE = '#FF6600';

// ─── PRIMITIVAS COMUNES ────────────────────────────────────────

/** Señal triangular de peligro (vértice arriba) */
function TriangleDanger({ children }: { children?: React.ReactNode }) {
  return (
    <G>
      {/* Sombra */}
      <Polygon points="50,6 96,88 4,88" fill="#00000020" transform="translate(1,2)" />
      {/* Fondo blanco */}
      <Polygon points="50,8 94,86 6,86" fill={WHITE} />
      {/* Borde rojo */}
      <Polygon points="50,8 94,86 6,86" fill="none" stroke={RED} strokeWidth="7" strokeLinejoin="round" />
      {children}
    </G>
  );
}

/** Señal circular de prohibición (fondo blanco, borde rojo) */
function CircleProhibition({ children }: { children?: React.ReactNode }) {
  return (
    <G>
      <Circle cx={CX} cy={CY} r={46} fill="#00000020" transform="translate(1,2)" />
      <Circle cx={CX} cy={CY} r={46} fill={WHITE} />
      <Circle cx={CX} cy={CY} r={46} fill="none" stroke={RED} strokeWidth="7" />
      {children}
    </G>
  );
}

/** Señal circular de obligación (fondo azul) */
function CircleObligation({ children }: { children?: React.ReactNode }) {
  return (
    <G>
      <Circle cx={CX} cy={CY} r={46} fill="#00000020" transform="translate(1,2)" />
      <Circle cx={CX} cy={CY} r={46} fill={BLUE} />
      {children}
    </G>
  );
}

/** Señal rectangular de información (fondo azul) */
function RectInfo({ w = 96, h = 70, color = BLUE, children }: { w?: number; h?: number; color?: string; children?: React.ReactNode }) {
  return (
    <G>
      <Rect x={(S - w) / 2} y={(S - h) / 2} width={w} height={h} rx="5" fill={color} />
      <Rect x={(S - w) / 2} y={(S - h) / 2} width={w} height={h} rx="5" fill="none" stroke={WHITE} strokeWidth="2.5" />
      {children}
    </G>
  );
}

// ─── SEÑALES DE PELIGRO ────────────────────────────────────────

export function SignCurvaDerecha() {
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <TriangleDanger>
        <Path d="M 42,68 C 42,55 58,55 58,43 C 58,35 50,30 50,30" stroke={BLACK} strokeWidth="6" fill="none" strokeLinecap="round" />
        <Path d="M 44,46 C 55,46 58,55 58,68" stroke={BLACK} strokeWidth="6" fill="none" strokeLinecap="round" />
      </TriangleDanger>
    </Svg>
  );
}

export function SignCurvaIzquierda() {
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <TriangleDanger>
        <Path d="M 58,68 C 58,55 42,55 42,43 C 42,35 50,30 50,30" stroke={BLACK} strokeWidth="6" fill="none" strokeLinecap="round" />
        <Path d="M 56,46 C 45,46 42,55 42,68" stroke={BLACK} strokeWidth="6" fill="none" strokeLinecap="round" />
      </TriangleDanger>
    </Svg>
  );
}

export function SignPasoPeatones() {
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <TriangleDanger>
        {/* Figura humana */}
        <Circle cx="50" cy="34" r="5" fill={BLACK} />
        <Line x1="50" y1="39" x2="50" y2="57" stroke={BLACK} strokeWidth="5" strokeLinecap="round" />
        <Line x1="50" y1="45" x2="43" y2="53" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
        <Line x1="50" y1="45" x2="57" y2="53" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
        <Line x1="50" y1="57" x2="44" y2="68" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
        <Line x1="50" y1="57" x2="56" y2="68" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
        {/* Línea del paso */}
        <Line x1="36" y1="72" x2="64" y2="72" stroke={BLACK} strokeWidth="3" />
      </TriangleDanger>
    </Svg>
  );
}

export function SignNinos() {
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <TriangleDanger>
        {/* Dos figuras menores */}
        <Circle cx="43" cy="34" r="4" fill={BLACK} />
        <Line x1="43" y1="38" x2="43" y2="54" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
        <Line x1="43" y1="54" x2="38" y2="65" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
        <Line x1="43" y1="54" x2="48" y2="65" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
        <Circle cx="57" cy="34" r="4" fill={BLACK} />
        <Line x1="57" y1="38" x2="57" y2="54" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
        <Line x1="57" y1="54" x2="52" y2="65" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
        <Line x1="57" y1="54" x2="62" y2="65" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
        <Line x1="43" y1="43" x2="57" y2="43" stroke={BLACK} strokeWidth="3" strokeLinecap="round" />
      </TriangleDanger>
    </Svg>
  );
}

export function SignInterseccionDerecha() {
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <TriangleDanger>
        {/* Carretera principal vertical */}
        <Rect x="44" y="28" width="12" height="46" fill={BLACK} />
        {/* Ramal a la derecha */}
        <Rect x="56" y="44" width="16" height="12" fill={BLACK} />
        {/* Flechas */}
        <Path d="M50,30 L44,38 L50,38 L50,30" fill={WHITE} />
        <Path d="M50,72 L44,64 L56,64 L50,72" fill={WHITE} />
        <Path d="M70,50 L62,44 L62,56 L70,50" fill={WHITE} />
      </TriangleDanger>
    </Svg>
  );
}

export function SignObras() {
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <TriangleDanger>
        {/* Obrero */}
        <Circle cx="50" cy="33" r="5" fill={BLACK} />
        {/* Cuerpo */}
        <Rect x="43" y="38" width="14" height="16" rx="2" fill={ORANGE} />
        {/* Pala */}
        <Line x1="57" y1="40" x2="65" y2="68" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
        <Ellipse cx="65" cy="71" rx="5" ry="3" fill={BLACK} />
        {/* Piernas */}
        <Line x1="47" y1="54" x2="44" y2="68" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
        <Line x1="53" y1="54" x2="56" y2="68" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
      </TriangleDanger>
    </Svg>
  );
}

export function SignPasoNivelSinBarreras() {
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <TriangleDanger>
        {/* Locomotora de frente */}
        <Rect x="35" y="42" width="30" height="22" rx="3" fill={BLACK} />
        <Rect x="38" y="38" width="24" height="8" rx="2" fill={BLACK} />
        <Circle cx="42" cy="66" r="4" fill={BLACK} />
        <Circle cx="58" cy="66" r="4" fill={BLACK} />
        {/* Faros */}
        <Circle cx="42" cy="48" r="3" fill={YELLOW} />
        <Circle cx="58" cy="48" r="3" fill={YELLOW} />
        {/* Vías */}
        <Line x1="32" y1="70" x2="68" y2="70" stroke={BLACK} strokeWidth="3" />
      </TriangleDanger>
    </Svg>
  );
}

export function SignPasoNivelConBarreras() {
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <TriangleDanger>
        {/* Cruz de San Andrés */}
        <Rect x="36" y="28" width="10" height="46" rx="3" fill={RED} transform="rotate(30,50,51)" />
        <Rect x="36" y="28" width="10" height="46" rx="3" fill={RED} transform="rotate(-30,50,51)" />
        {/* Barreras */}
        <Line x1="28" y1="70" x2="72" y2="70" stroke={BLACK} strokeWidth="4" />
        <Line x1="28" y1="70" x2="28" y2="62" stroke={BLACK} strokeWidth="4" />
        <Line x1="72" y1="70" x2="72" y2="62" stroke={BLACK} strokeWidth="4" />
      </TriangleDanger>
    </Svg>
  );
}

export function SignVientoLateral() {
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <TriangleDanger>
        {/* Coche */}
        <Rect x="42" y="52" width="20" height="14" rx="2" fill={BLACK} />
        <Rect x="45" y="46" width="14" height="9" rx="2" fill={BLACK} />
        <Circle cx="46" cy="67" r="3" fill={BLACK} />
        <Circle cx="58" cy="67" r="3" fill={BLACK} />
        {/* Flechas de viento */}
        <Path d="M28,42 L40,42" stroke={BLACK} strokeWidth="3" strokeLinecap="round" />
        <Path d="M36,42 L34,38 M36,42 L34,46" stroke={BLACK} strokeWidth="3" strokeLinecap="round" />
        <Path d="M28,50 L40,50" stroke={BLACK} strokeWidth="3" strokeLinecap="round" />
        <Path d="M36,50 L34,46 M36,50 L34,54" stroke={BLACK} strokeWidth="3" strokeLinecap="round" />
        <Path d="M28,58 L38,58" stroke={BLACK} strokeWidth="3" strokeLinecap="round" />
        <Path d="M34,58 L32,54 M34,58 L32,62" stroke={BLACK} strokeWidth="3" strokeLinecap="round" />
      </TriangleDanger>
    </Svg>
  );
}

export function SignPeligroGenerico() {
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <TriangleDanger>
        <SvgText x="50" y="72" fontSize="42" fontWeight="bold" fill={BLACK} textAnchor="middle">!</SvgText>
      </TriangleDanger>
    </Svg>
  );
}

export function SignPavimentoDeslizante() {
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <TriangleDanger>
        {/* Coche con líneas de derrape */}
        <Rect x="40" y="50" width="22" height="14" rx="2" fill={BLACK} />
        <Rect x="43" y="44" width="16" height="9" rx="2" fill={BLACK} />
        <Circle cx="44" cy="66" r="3" fill={BLACK} />
        <Circle cx="58" cy="66" r="3" fill={BLACK} />
        {/* Líneas de derrape */}
        <Path d="M36,64 C34,60 38,56 36,52" stroke={BLACK} strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="3,2" />
        <Path d="M32,68 C30,64 34,60 32,56" stroke={BLACK} strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="3,2" />
      </TriangleDanger>
    </Svg>
  );
}

// ─── SEÑALES DE REGLAMENTACIÓN (PROHIBICIÓN) ──────────────────

export function SignStop() {
  // Octogonal, fondo rojo, STOP blanco
  const r = 44;
  const pts = Array.from({ length: 8 }, (_, i) => {
    const a = ((i * 45) - 22.5) * Math.PI / 180;
    return `${CX + r * Math.cos(a)},${CY + r * Math.sin(a)}`;
  }).join(' ');
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <Polygon points={pts} fill="#00000020" transform="translate(1,2)" />
      <Polygon points={pts} fill={RED} />
      <Polygon points={pts} fill="none" stroke="#CC0000" strokeWidth="3" />
      <SvgText x={CX} y={CY + 8} fontSize="18" fontWeight="bold" fill={WHITE} textAnchor="middle" letterSpacing="-1">STOP</SvgText>
    </Svg>
  );
}

export function SignCedaElPaso() {
  // Triángulo invertido, blanco, borde rojo
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <Polygon points="6,14 94,14 50,90" fill="#00000020" transform="translate(1,2)" />
      <Polygon points="6,14 94,14 50,90" fill={WHITE} />
      <Polygon points="6,14 94,14 50,90" fill="none" stroke={RED} strokeWidth="7" strokeLinejoin="round" />
      <SvgText x={CX} y="42" fontSize="9" fontWeight="bold" fill={RED} textAnchor="middle">CEDA EL</SvgText>
      <SvgText x={CX} y="52" fontSize="9" fontWeight="bold" fill={RED} textAnchor="middle">PASO</SvgText>
    </Svg>
  );
}

export function SignVelocidadMaxima({ limit }: { limit: number }) {
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <CircleProhibition>
        <SvgText x={CX} y={CY + (limit >= 100 ? 10 : 12)} fontSize={limit >= 100 ? 28 : 32} fontWeight="bold" fill={BLACK} textAnchor="middle">{limit}</SvgText>
      </CircleProhibition>
    </Svg>
  );
}

export function SignProhibidoAdelantar() {
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <CircleProhibition>
        {/* Dos coches */}
        <Rect x="22" y="38" width="22" height="14" rx="2" fill={BLACK} />
        <Rect x="25" y="32" width="16" height="8" rx="2" fill={BLACK} />
        <Rect x="56" y="38" width="22" height="14" rx="2" fill={RED} />
        <Rect x="59" y="32" width="16" height="8" rx="2" fill={RED} />
        {/* Barra diagonal roja */}
        <Line x1="72" y1="26" x2="28" y2="74" stroke={RED} strokeWidth="7" strokeLinecap="round" />
      </CircleProhibition>
    </Svg>
  );
}

export function SignDireccionProhibida() {
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <CircleProhibition>
        <Rect x="22" y="42" width="56" height="16" rx="4" fill={RED} />
        <Rect x="22" y="42" width="56" height="16" rx="4" fill={WHITE} />
      </CircleProhibition>
    </Svg>
  );
}

export function SignEntradaProhibida() {
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <Circle cx={CX} cy={CY} r={46} fill={RED} />
      <Rect x="22" y="43" width="56" height="14" rx="3" fill={WHITE} />
    </Svg>
  );
}

export function SignProhibidoGirarDerecha() {
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <CircleProhibition>
        <Path d="M 35,60 L 35,38 C 35,30 65,30 65,45" stroke={BLACK} strokeWidth="6" fill="none" strokeLinecap="round" />
        <Path d="M 58,38 L 65,45 L 58,52" stroke={BLACK} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Line x1="72" y1="26" x2="28" y2="74" stroke={RED} strokeWidth="7" strokeLinecap="round" />
      </CircleProhibition>
    </Svg>
  );
}

export function SignFinLimitaciones() {
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <Circle cx={CX} cy={CY} r={46} fill={WHITE} />
      <Circle cx={CX} cy={CY} r={46} fill="none" stroke="#888888" strokeWidth="5" strokeDasharray="6,4" />
      {/* Líneas diagonales negras */}
      <Line x1="30" y1="26" x2="70" y2="74" stroke={BLACK} strokeWidth="5" strokeLinecap="round" />
      <Line x1="44" y1="24" x2="76" y2="64" stroke={BLACK} strokeWidth="5" strokeLinecap="round" />
      <Line x1="24" y1="42" x2="56" y2="76" stroke={BLACK} strokeWidth="5" strokeLinecap="round" />
    </Svg>
  );
}

// ─── SEÑALES DE OBLIGACIÓN ─────────────────────────────────────

export function SignSentidoObligatorio({ direction = 'right' }: { direction?: 'right' | 'left' | 'straight' | 'right-straight' }) {
  const arrowPath = {
    right: 'M 25,50 L 65,50 M 58,40 L 68,50 L 58,60',
    left: 'M 75,50 L 35,50 M 42,40 L 32,50 L 42,60',
    straight: 'M 50,72 L 50,30 M 40,40 L 50,28 L 60,40',
    'right-straight': 'M 35,60 L 35,42 M 35,42 L 60,42 M 52,34 L 62,42 L 52,50',
  }[direction];
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <CircleObligation>
        <Path d={arrowPath} stroke={WHITE} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </CircleObligation>
    </Svg>
  );
}

export function SignVelocidadMinima({ min }: { min: number }) {
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <CircleObligation>
        <SvgText x={CX} y={CY + 12} fontSize="32" fontWeight="bold" fill={WHITE} textAnchor="middle">{min}</SvgText>
      </CircleObligation>
    </Svg>
  );
}

export function SignCadenas() {
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <CircleObligation>
        {/* Neumático con cadena */}
        <Circle cx={CX} cy={CY} r={20} fill="none" stroke={WHITE} strokeWidth="8" />
        <Circle cx={CX} cy={CY} r={10} fill="none" stroke={WHITE} strokeWidth="4" />
        <Line x1="30" y1="50" x2="70" y2="50" stroke={WHITE} strokeWidth="4" />
        <Line x1="50" y1="30" x2="50" y2="70" stroke={WHITE} strokeWidth="4" />
      </CircleObligation>
    </Svg>
  );
}

// ─── SEÑALES DE INDICACIÓN ─────────────────────────────────────

export function SignAutopista() {
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <RectInfo>
        {/* Carretera con separador */}
        <Rect x="20" y="38" width="60" height="24" rx="3" fill={WHITE} />
        <Rect x="47" y="38" width="6" height="24" rx="1" fill={BLUE} />
        {/* Curva izquierda */}
        <Path d="M 24,56 C 24,44 34,42 34,42" stroke={BLUE} strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* Curva derecha */}
        <Path d="M 66,44 C 66,56 76,58 76,58" stroke={BLUE} strokeWidth="5" fill="none" strokeLinecap="round" />
      </RectInfo>
    </Svg>
  );
}

export function SignAutovia() {
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <RectInfo color="#006633">
        <Rect x="20" y="38" width="60" height="24" rx="3" fill={WHITE} />
        <Rect x="47" y="38" width="6" height="24" rx="1" fill={GREEN} />
        <Path d="M 24,56 C 24,44 34,42 34,42" stroke={GREEN} strokeWidth="5" fill="none" strokeLinecap="round" />
        <Path d="M 66,44 C 66,56 76,58 76,58" stroke={GREEN} strokeWidth="5" fill="none" strokeLinecap="round" />
      </RectInfo>
    </Svg>
  );
}

export function SignZonaPeatonal() {
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <RectInfo>
        {/* Figura peatonal */}
        <Circle cx={CX} cy="35" r="6" fill={WHITE} />
        <Line x1={CX} y1="41" x2={CX} y2="58" stroke={WHITE} strokeWidth="5" strokeLinecap="round" />
        <Line x1={CX} y1="48" x2="42" y2="55" stroke={WHITE} strokeWidth="4" strokeLinecap="round" />
        <Line x1={CX} y1="48" x2="58" y2="55" stroke={WHITE} strokeWidth="4" strokeLinecap="round" />
        <Line x1={CX} y1="58" x2="44" y2="68" stroke={WHITE} strokeWidth="4" strokeLinecap="round" />
        <Line x1={CX} y1="58" x2="56" y2="68" stroke={WHITE} strokeWidth="4" strokeLinecap="round" />
      </RectInfo>
    </Svg>
  );
}

export function SignEstacionamiento() {
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <RectInfo>
        <SvgText x={CX} y={CY + 12} fontSize="44" fontWeight="bold" fill={WHITE} textAnchor="middle">P</SvgText>
      </RectInfo>
    </Svg>
  );
}

export function SignPrioridadSentidoContrario() {
  // Flecha roja (yo) vs flecha blanca (ellos)
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <TriangleDanger>
        {/* Flecha roja grande (vehículo con prioridad viene de frente) */}
        <Path d="M 50,30 L 50,55" stroke={RED} strokeWidth="10" strokeLinecap="round" />
        <Path d="M 40,46 L 50,30 L 60,46" stroke={RED} strokeWidth="6" fill={RED} strokeLinejoin="round" />
        {/* Flecha blanca pequeña (yo debo ceder) */}
        <Path d="M 50,75 L 50,58" stroke={BLACK} strokeWidth="6" strokeLinecap="round" />
        <Path d="M 43,62 L 50,75 L 57,62" stroke={BLACK} strokeWidth="4" fill={BLACK} strokeLinejoin="round" />
      </TriangleDanger>
    </Svg>
  );
}

// ─── SEMÁFOROS ─────────────────────────────────────────────────

export function SignSemaforoRojo() {
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <Rect x="32" y="10" width="36" height="80" rx="6" fill={BLACK} />
      <Circle cx={CX} cy="28" r="12" fill={RED} />
      <Circle cx={CX} cy="50" r="12" fill="#333" />
      <Circle cx={CX} cy="72" r="12" fill="#333" />
    </Svg>
  );
}

export function SignSemaforoAmbar() {
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <Rect x="32" y="10" width="36" height="80" rx="6" fill={BLACK} />
      <Circle cx={CX} cy="28" r="12" fill="#333" />
      <Circle cx={CX} cy="50" r="12" fill={YELLOW} />
      <Circle cx={CX} cy="72" r="12" fill="#333" />
    </Svg>
  );
}

export function SignSemaforoVerde() {
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <Rect x="32" y="10" width="36" height="80" rx="6" fill={BLACK} />
      <Circle cx={CX} cy="28" r="12" fill="#333" />
      <Circle cx={CX} cy="50" r="12" fill="#333" />
      <Circle cx={CX} cy="72" r="12" fill={GREEN} />
    </Svg>
  );
}

// ─── MARCAS VIALES ─────────────────────────────────────────────

export function MarkLineaContinua() {
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <Rect x="0" y="0" width={S} height={S} fill="#555" />
      <Rect x="44" y="0" width="12" height={S} fill={WHITE} />
    </Svg>
  );
}

export function MarkLineaDiscontinua() {
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <Rect x="0" y="0" width={S} height={S} fill="#555" />
      <Rect x="44" y="5" width="12" height="22" rx="2" fill={WHITE} />
      <Rect x="44" y="39" width="12" height="22" rx="2" fill={WHITE} />
      <Rect x="44" y="73" width="12" height="22" rx="2" fill={WHITE} />
    </Svg>
  );
}

export function MarkCedaElPasoSuelo() {
  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <Rect x="0" y="0" width={S} height={S} fill="#555" />
      <Polygon points="50,20 82,70 18,70" fill="none" stroke={WHITE} strokeWidth="5" strokeLinejoin="round" />
      <Line x1="10" y1="80" x2="90" y2="80" stroke={WHITE} strokeWidth="6" strokeLinecap="round" strokeDasharray="8,6" />
    </Svg>
  );
}

// ─── MAPA DE SEÑALES ────────────────────────────────────────────
// Relaciona un ID de señal con su componente SVG

export type SignId =
  | 'stop' | 'ceda_el_paso' | 'peligro' | 'curva_derecha' | 'curva_izquierda'
  | 'paso_peatones' | 'ninos' | 'obras' | 'paso_nivel_sin' | 'paso_nivel_con'
  | 'viento_lateral' | 'pavimento_deslizante' | 'interseccion_derecha'
  | 'vel_max_20' | 'vel_max_30' | 'vel_max_40' | 'vel_max_50' | 'vel_max_60'
  | 'vel_max_70' | 'vel_max_80' | 'vel_max_90' | 'vel_max_100' | 'vel_max_120'
  | 'prohibido_adelantar' | 'direccion_prohibida' | 'entrada_prohibida'
  | 'prohibido_girar_derecha' | 'fin_limitaciones'
  | 'sentido_recto' | 'sentido_derecha' | 'sentido_izquierda' | 'cadenas'
  | 'vel_min_60'
  | 'autopista' | 'autovia' | 'zona_peatonal' | 'estacionamiento'
  | 'prioridad_sentido_contrario'
  | 'semaforo_rojo' | 'semaforo_ambar' | 'semaforo_verde'
  | 'linea_continua' | 'linea_discontinua' | 'ceda_suelo';

export function TrafficSign({ signId, size = 100 }: { signId: SignId; size?: number }) {
  const scale = size / 100;
  const component: Record<SignId, React.ReactElement> = {
    stop:                     <SignStop />,
    ceda_el_paso:             <SignCedaElPaso />,
    peligro:                  <SignPeligroGenerico />,
    curva_derecha:            <SignCurvaDerecha />,
    curva_izquierda:          <SignCurvaIzquierda />,
    paso_peatones:            <SignPasoPeatones />,
    ninos:                    <SignNinos />,
    obras:                    <SignObras />,
    paso_nivel_sin:           <SignPasoNivelSinBarreras />,
    paso_nivel_con:           <SignPasoNivelConBarreras />,
    viento_lateral:           <SignVientoLateral />,
    pavimento_deslizante:     <SignPavimentoDeslizante />,
    interseccion_derecha:     <SignInterseccionDerecha />,
    vel_max_20:               <SignVelocidadMaxima limit={20} />,
    vel_max_30:               <SignVelocidadMaxima limit={30} />,
    vel_max_40:               <SignVelocidadMaxima limit={40} />,
    vel_max_50:               <SignVelocidadMaxima limit={50} />,
    vel_max_60:               <SignVelocidadMaxima limit={60} />,
    vel_max_70:               <SignVelocidadMaxima limit={70} />,
    vel_max_80:               <SignVelocidadMaxima limit={80} />,
    vel_max_90:               <SignVelocidadMaxima limit={90} />,
    vel_max_100:              <SignVelocidadMaxima limit={100} />,
    vel_max_120:              <SignVelocidadMaxima limit={120} />,
    prohibido_adelantar:      <SignProhibidoAdelantar />,
    direccion_prohibida:      <SignDireccionProhibida />,
    entrada_prohibida:        <SignEntradaProhibida />,
    prohibido_girar_derecha:  <SignProhibidoGirarDerecha />,
    fin_limitaciones:         <SignFinLimitaciones />,
    sentido_recto:            <SignSentidoObligatorio direction="straight" />,
    sentido_derecha:          <SignSentidoObligatorio direction="right" />,
    sentido_izquierda:        <SignSentidoObligatorio direction="left" />,
    cadenas:                  <SignCadenas />,
    vel_min_60:               <SignVelocidadMinima min={60} />,
    autopista:                <SignAutopista />,
    autovia:                  <SignAutovia />,
    zona_peatonal:            <SignZonaPeatonal />,
    estacionamiento:          <SignEstacionamiento />,
    prioridad_sentido_contrario: <SignPrioridadSentidoContrario />,
    semaforo_rojo:            <SignSemaforoRojo />,
    semaforo_ambar:           <SignSemaforoAmbar />,
    semaforo_verde:           <SignSemaforoVerde />,
    linea_continua:           <MarkLineaContinua />,
    linea_discontinua:        <MarkLineaDiscontinua />,
    ceda_suelo:               <MarkCedaElPasoSuelo />,
  };
  return (
    <G transform={`scale(${scale})`}>
      {component[signId] ?? <SignPeligroGenerico />}
    </G>
  );
}
