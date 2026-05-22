/**
 * Diagramas SVG de escenarios de tráfico para el Manual del Conductor.
 * Diseñados según el Reglamento General de Circulación (RD 1428/2003).
 */
import React from 'react';
import Svg, { Rect, Line, Path, Circle, Text as SvgText, G, Polygon, Defs, Marker } from 'react-native-svg';

const W = 280;
const H = 200;

const ASPHALT = '#4A4A4A';
const ROAD    = '#5A5A5A';
const WHITE   = '#FFFFFF';
const YELLOW  = '#FFD700';
const RED     = '#E63946';
const GREEN   = '#06D6A0';
const BLUE    = '#457B9D';
const CAR_R   = '#E63946';
const CAR_B   = '#457B9D';
const CAR_G   = '#2A9D8F';
const STRIPE  = '#FFFFFF';

// ─── DIAGRAMA 1: Intersección en cruz sin señalizar (regla de la derecha) ────
export function DiagramInterseccionDerecha() {
  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {/* Background */}
      <Rect width={W} height={H} fill="#E8E8E8" />
      {/* Roads */}
      <Rect x="110" y="0" width="60" height={H} fill={ROAD} />
      <Rect x="0" y="70" width={W} height="60" fill={ROAD} />
      {/* Center marking */}
      <Line x1="140" y1="0" x2="140" y2="70" stroke={YELLOW} strokeWidth="2" strokeDasharray="8,6" />
      <Line x1="140" y1="130" x2="140" y2={H} stroke={YELLOW} strokeWidth="2" strokeDasharray="8,6" />
      <Line x1="0" y1="100" x2="110" y2="100" stroke={YELLOW} strokeWidth="2" strokeDasharray="8,6" />
      <Line x1="170" y1="100" x2={W} y2="100" stroke={YELLOW} strokeWidth="2" strokeDasharray="8,6" />
      {/* Kerbs */}
      <Line x1="110" y1="0" x2="110" y2="70" stroke={WHITE} strokeWidth="1.5" />
      <Line x1="170" y1="0" x2="170" y2="70" stroke={WHITE} strokeWidth="1.5" />
      <Line x1="110" y1="130" x2="110" y2={H} stroke={WHITE} strokeWidth="1.5" />
      <Line x1="170" y1="130" x2="170" y2={H} stroke={WHITE} strokeWidth="1.5" />
      <Line x1="0" y1="70" x2="110" y2="70" stroke={WHITE} strokeWidth="1.5" />
      <Line x1="0" y1="130" x2="110" y2="130" stroke={WHITE} strokeWidth="1.5" />
      <Line x1="170" y1="70" x2={W} y2="70" stroke={WHITE} strokeWidth="1.5" />
      <Line x1="170" y1="130" x2={W} y2="130" stroke={WHITE} strokeWidth="1.5" />

      {/* Car A — viene de abajo (norte), quiere ir recto */}
      <G transform="translate(118, 140)">
        <Rect x="0" y="0" width="18" height="26" rx="3" fill={CAR_B} />
        <Rect x="3" y="3" width="12" height="8" rx="1" fill="#B0C4DE" opacity="0.7" />
      </G>
      {/* Car B — viene de la izquierda (este), quiere ir recto */}
      <G transform="translate(34, 78)">
        <Rect x="0" y="0" width="26" height="18" rx="3" fill={CAR_R} />
        <Rect x="3" y="3" width="8" height="12" rx="1" fill="#FFB3B3" opacity="0.7" />
      </G>

      {/* Arrows */}
      <Path d="M127,138 L127,110" stroke={CAR_B} strokeWidth="3" strokeLinecap="round" fill="none" />
      <Polygon points="123,112 127,104 131,112" fill={CAR_B} />
      <Path d="M62,87 L110,87" stroke={CAR_R} strokeWidth="3" strokeLinecap="round" fill="none" />
      <Polygon points="108,83 116,87 108,91" fill={CAR_R} />

      {/* Priority indicator */}
      <Circle cx="127" cy="87" r="14" fill={GREEN} opacity="0.9" />
      <SvgText x="127" y="92" fontSize="16" fill={WHITE} textAnchor="middle" fontWeight="bold">1</SvgText>
      <Circle cx="85" cy="110" r="14" fill={RED} opacity="0.9" />
      <SvgText x="85" y="115" fontSize="16" fill={WHITE} textAnchor="middle" fontWeight="bold">2</SvgText>

      {/* Label */}
      <Rect x="0" y="178" width={W} height="22" fill="#000000AA" />
      <SvgText x={W/2} y="193" fontSize="10" fill={WHITE} textAnchor="middle">El coche AZUL viene de la derecha → tiene prioridad</SvgText>
    </Svg>
  );
}

// ─── DIAGRAMA 2: Rotonda — prioridad interior ──────────────────
export function DiagramRotonda() {
  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Rect width={W} height={H} fill="#E8E8E8" />
      {/* Radial roads */}
      <Rect x="115" y="0" width="50" height="60" fill={ROAD} />
      <Rect x="115" y="140" width="50" height="60" fill={ROAD} />
      <Rect x="0" y="80" width="60" height="40" fill={ROAD} />
      <Rect x="220" y="80" width="60" height="40" fill={ROAD} />
      {/* Roundabout ring */}
      <Circle cx="140" cy="100" r="60" fill={ROAD} />
      <Circle cx="140" cy="100" r="36" fill="#C8D6C8" />
      {/* Center island */}
      <Circle cx="140" cy="100" r="30" fill="#6B8E6B" />
      <Circle cx="140" cy="100" r="20" fill="#5A7A5A" />

      {/* Car already inside roundabout */}
      <G transform="translate(105, 68) rotate(-40, 9, 13)">
        <Rect x="0" y="0" width="18" height="26" rx="3" fill={CAR_B} />
        <Rect x="3" y="3" width="12" height="7" rx="1" fill="#B0C4DE" opacity="0.8" />
      </G>
      {/* Car wanting to enter */}
      <G transform="translate(222, 83)">
        <Rect x="0" y="0" width="26" height="18" rx="3" fill={CAR_R} />
        <Rect x="3" y="3" width="8" height="12" rx="1" fill="#FFB3B3" opacity="0.7" />
      </G>

      {/* Curved arrow for inside car */}
      <Path d="M118,82 C118,68 128,60 140,60" stroke={CAR_B} strokeWidth="3" fill="none" strokeLinecap="round" />
      <Polygon points="136,56 144,60 138,66" fill={CAR_B} />

      {/* Stop line for entering car */}
      <Line x1="220" y1="81" x2="220" y2="119" stroke={WHITE} strokeWidth="3" strokeDasharray="4,3" />

      {/* Priority labels */}
      <Circle cx="140" cy="65" r="13" fill={GREEN} opacity="0.9" />
      <SvgText x="140" y="70" fontSize="14" fill={WHITE} textAnchor="middle" fontWeight="bold">1</SvgText>
      <Circle cx="213" cy="100" r="13" fill={RED} opacity="0.9" />
      <SvgText x="213" y="105" fontSize="14" fill={WHITE} textAnchor="middle" fontWeight="bold">2</SvgText>

      <Rect x="0" y="178" width={W} height="22" fill="#000000AA" />
      <SvgText x={W/2} y="193" fontSize="10" fill={WHITE} textAnchor="middle">El que ya circula dentro tiene prioridad</SvgText>
    </Svg>
  );
}

// ─── DIAGRAMA 3: Adelantamiento correcto ──────────────────────
export function DiagramAdelantamiento() {
  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Rect width={W} height={H} fill="#E8E8E8" />
      {/* Road */}
      <Rect x="0" y="50" width={W} height="100" fill={ROAD} />
      <Line x1="0" y1="100" x2={W} y2="100" stroke={YELLOW} strokeWidth="2" strokeDasharray="10,8" />
      <Line x1="0" y1="52" x2={W} y2="52" stroke={WHITE} strokeWidth="1.5" />
      <Line x1="0" y1="148" x2={W} y2="148" stroke={WHITE} strokeWidth="1.5" />
      {/* Kerb lines */}
      <Line x1="0" y1="50" x2={W} y2="50" stroke={WHITE} strokeWidth="2" />
      <Line x1="0" y1="150" x2={W} y2="150" stroke={WHITE} strokeWidth="2" />

      {/* Slower vehicle being overtaken */}
      <G transform="translate(120, 112)">
        <Rect x="0" y="0" width="36" height="24" rx="3" fill="#888" />
        <Rect x="4" y="3" width="10" height="8" rx="1" fill="#CCC" opacity="0.6" />
        <Rect x="22" y="3" width="10" height="8" rx="1" fill="#CCC" opacity="0.6" />
      </G>

      {/* Overtaking vehicle — trajectory */}
      {/* Phase 1: signal */}
      <G transform="translate(20, 112)">
        <Rect x="0" y="0" width="36" height="24" rx="3" fill={CAR_B} />
        <Rect x="4" y="3" width="10" height="8" rx="1" fill="#B0C4DE" opacity="0.8" />
        <Rect x="22" y="3" width="10" height="8" rx="1" fill="#B0C4DE" opacity="0.8" />
      </G>
      {/* Blinker indicator */}
      <Rect x="18" y="108" width="6" height="4" rx="1" fill={YELLOW} />

      {/* Phase 3: overtaking */}
      <G transform="translate(180, 62)">
        <Rect x="0" y="0" width="36" height="24" rx="3" fill={CAR_B} opacity="0.7" />
      </G>

      {/* Arrow showing overtaking path */}
      <Path d="M58,124 L100,124 Q110,124 115,100 L210,100 Q215,76 220,76" stroke={CAR_B} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="6,4" />
      <Polygon points="216,72 224,76 218,82" fill={CAR_B} />

      {/* 1.5m lateral distance indicator */}
      <Line x1="156" y1="104" x2="156" y2="138" stroke={GREEN} strokeWidth="1.5" strokeDasharray="3,2" />
      <Line x1="180" y1="104" x2="180" y2="138" stroke={GREEN} strokeWidth="1.5" strokeDasharray="3,2" />
      <Line x1="156" y1="121" x2="180" y2="121" stroke={GREEN} strokeWidth="2" />
      <SvgText x="168" y="146" fontSize="9" fill={GREEN} textAnchor="middle" fontWeight="bold">≥1,5m</SvgText>

      {/* Steps */}
      <SvgText x="38" y="108" fontSize="8" fill={WHITE} textAnchor="middle">① Señaliza</SvgText>
      <SvgText x="198" y="58" fontSize="8" fill={ROAD} textAnchor="middle">② Adelanta</SvgText>

      <Rect x="0" y="178" width={W} height="22" fill="#000000AA" />
      <SvgText x={W/2} y="193" fontSize="10" fill={WHITE} textAnchor="middle">Señaliza izq. → adelanta → deja 1,5m → señaliza dcha.</SvgText>
    </Svg>
  );
}

// ─── DIAGRAMA 4: Distancia de seguridad ──────────────────────
export function DiagramDistanciaSeguridad() {
  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Rect width={W} height={H} fill="#E8E8E8" />
      <Rect x="0" y="70" width={W} height="60" fill={ROAD} />
      <Line x1="0" y1="100" x2={W} y2="100" stroke={YELLOW} strokeWidth="2" strokeDasharray="10,8" />
      <Line x1="0" y1="72" x2={W} y2="72" stroke={WHITE} strokeWidth="1.5" />
      <Line x1="0" y1="128" x2={W} y2="128" stroke={WHITE} strokeWidth="1.5" />

      {/* Car ahead */}
      <G transform="translate(180, 80)">
        <Rect x="0" y="0" width="36" height="24" rx="3" fill="#888" />
        <Rect x="4" y="3" width="10" height="8" rx="1" fill="#CCC" opacity="0.6" />
        <Rect x="22" y="3" width="10" height="8" rx="1" fill="#CCC" opacity="0.6" />
        {/* Brake lights */}
        <Rect x="0" y="18" width="8" height="5" rx="1" fill={RED} />
        <Rect x="28" y="18" width="8" height="5" rx="1" fill={RED} />
      </G>

      {/* Following car */}
      <G transform="translate(56, 80)">
        <Rect x="0" y="0" width="36" height="24" rx="3" fill={CAR_B} />
        <Rect x="4" y="3" width="10" height="8" rx="1" fill="#B0C4DE" opacity="0.8" />
        <Rect x="22" y="3" width="10" height="8" rx="1" fill="#B0C4DE" opacity="0.8" />
      </G>

      {/* Distance bracket */}
      <Line x1="94" y1="55" x2="178" y2="55" stroke={RED} strokeWidth="2" />
      <Line x1="94" y1="50" x2="94" y2="60" stroke={RED} strokeWidth="2" />
      <Line x1="178" y1="50" x2="178" y2="60" stroke={RED} strokeWidth="2" />
      <SvgText x="136" y="48" fontSize="10" fill={RED} textAnchor="middle" fontWeight="bold">Distancia de seguridad</SvgText>

      {/* Speed and distance info */}
      <Rect x="8" y="148" width="120" height="38" rx="6" fill={CAR_B} opacity="0.9" />
      <SvgText x="68" y="163" fontSize="9" fill={WHITE} textAnchor="middle">A 90 km/h → 45 m mínimo</SvgText>
      <SvgText x="68" y="177" fontSize="9" fill={WHITE} textAnchor="middle">Con lluvia → 90 m mínimo</SvgText>

      <Rect x="150" y="148" width="122" height="38" rx="6" fill={ROAD} opacity="0.9" />
      <SvgText x="211" y="163" fontSize="9" fill={WHITE} textAnchor="middle">Regla: 2 segundos</SvgText>
      <SvgText x="211" y="177" fontSize="9" fill={WHITE} textAnchor="middle">conta cuando él pasa punto fijo</SvgText>
    </Svg>
  );
}

// ─── DIAGRAMA 5: Uso de luces ─────────────────────────────────
export function DiagramLuces() {
  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Rect width={W} height={H} fill="#1A1A2E" />
      {/* Road */}
      <Rect x="90" y="0" width="100" height={H} fill="#333" />
      <Line x1="140" y1="0" x2="140" y2={H} stroke={YELLOW} strokeWidth="2" strokeDasharray="12,10" />

      {/* Car with short lights (cruce) */}
      <G transform="translate(104, 110)">
        <Rect x="0" y="0" width="32" height="20" rx="3" fill="#666" />
        <Rect x="3" y="2" width="10" height="7" rx="1" fill="#888" opacity="0.8" />
        <Rect x="19" y="2" width="10" height="7" rx="1" fill="#888" opacity="0.8" />
        {/* Front lights - cruce (short beam) */}
        <Path d="M0,6 L-30,2 L-30,14 L0,10" fill={YELLOW} opacity="0.6" />
        <Path d="M0,14 L-30,10 L-30,18 L0,18" fill={YELLOW} opacity="0.3" />
      </G>

      {/* Car with long lights */}
      <G transform="translate(104, 30)">
        <Rect x="0" y="0" width="32" height="20" rx="3" fill={CAR_B} />
        <Rect x="3" y="2" width="10" height="7" rx="1" fill="#B0C4DE" opacity="0.8" />
        <Rect x="19" y="2" width="10" height="7" rx="1" fill="#B0C4DE" opacity="0.8" />
        {/* Long beam */}
        <Path d="M0,4 L-70,-8 L-70,28 L0,16" fill={YELLOW} opacity="0.5" />
      </G>

      {/* Labels */}
      <Rect x="2" y="36" width="85" height="16" rx="4" fill={BLUE} />
      <SvgText x="44" y="48" fontSize="9" fill={WHITE} textAnchor="middle">Largas (carretera libre)</SvgText>

      <Rect x="2" y="116" width="85" height="16" rx="4" fill="#666" />
      <SvgText x="44" y="128" fontSize="9" fill={WHITE} textAnchor="middle">Cruce (obligatorias ciudad)</SvgText>

      {/* Rule boxes */}
      <Rect x="2" y="155" width="138" height="40" rx="5" fill="#FFFFFF15" />
      <SvgText x="71" y="168" fontSize="8" fill={WHITE} textAnchor="middle">Largas: fuera de pob.</SvgText>
      <SvgText x="71" y="180" fontSize="8" fill={WHITE} textAnchor="middle">sin tráfico en contra</SvgText>
      <SvgText x="71" y="192" fontSize="8" fill={WHITE} textAnchor="middle">ni delante</SvgText>

      <Rect x="146" y="155" width="130" height="40" rx="5" fill="#FFFFFF15" />
      <SvgText x="211" y="168" fontSize="8" fill={WHITE} textAnchor="middle">Cruce: ciudad, lluvia,</SvgText>
      <SvgText x="211" y="180" fontSize="8" fill={WHITE} textAnchor="middle">niebla, túneles,</SvgText>
      <SvgText x="211" y="192" fontSize="8" fill={WHITE} textAnchor="middle">visibilidad &lt;200m</SvgText>
    </Svg>
  );
}

// ─── DIAGRAMA 6: Parada vs Estacionamiento ───────────────────
export function DiagramParadaEstacionamiento() {
  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Rect width={W} height={H} fill="#E8E8E8" />
      <Rect x="0" y="60" width={W} height="80" fill={ROAD} />
      <Line x1="0" y1="100" x2={W} y2="100" stroke={YELLOW} strokeWidth="2" strokeDasharray="10,8" />
      <Line x1="0" y1="62" x2={W} y2="62" stroke={WHITE} strokeWidth="1.5" />
      <Line x1="0" y1="138" x2={W} y2="138" stroke={WHITE} strokeWidth="1.5" />

      {/* Parada car (driver inside) */}
      <G transform="translate(20, 72)">
        <Rect x="0" y="0" width="80" height="52" rx="4" fill={GREEN} opacity="0.3" />
        <Rect x="5" y="5" width="70" height="42" rx="3" fill="#888" />
        <Rect x="10" y="8" width="20" height="14" rx="2" fill="#CCC" opacity="0.6" />
        <Rect x="40" y="8" width="20" height="14" rx="2" fill="#CCC" opacity="0.6" />
        {/* Driver */}
        <Circle cx="55" cy="26" r="7" fill="#FFCC88" />
        <SvgText x="55" y="30" fontSize="8" fill="#333" textAnchor="middle">:)</SvgText>
        <SvgText x="40" y="52" fontSize="9" fill={GREEN} textAnchor="middle" fontWeight="bold">PARADA</SvgText>
      </G>

      {/* Estacionamiento car (driver absent) */}
      <G transform="translate(170, 72)">
        <Rect x="0" y="0" width="80" height="52" rx="4" fill={RED} opacity="0.25" />
        <Rect x="5" y="5" width="70" height="42" rx="3" fill="#888" />
        <Rect x="10" y="8" width="20" height="14" rx="2" fill="#CCC" opacity="0.6" />
        <Rect x="40" y="8" width="20" height="14" rx="2" fill="#CCC" opacity="0.6" />
        <SvgText x="40" y="35" fontSize="18" textAnchor="middle">?</SvgText>
        <SvgText x="40" y="52" fontSize="9" fill={RED} textAnchor="middle" fontWeight="bold">ESTACIONAMIENTO</SvgText>
      </G>

      <Rect x="0" y="150" width={W/2} height="46" fill={GREEN} opacity="0.15" />
      <SvgText x={W/4} y="164" fontSize="9" fill="#1A5C1A" textAnchor="middle" fontWeight="bold">PARADA</SvgText>
      <SvgText x={W/4} y="177" fontSize="8" fill="#1A5C1A" textAnchor="middle">Conductor permanece</SvgText>
      <SvgText x={W/4} y="189" fontSize="8" fill="#1A5C1A" textAnchor="middle">Máx. 2 min en ciudad</SvgText>

      <Rect x={W/2} y="150" width={W/2} height="46" fill={RED} opacity="0.1" />
      <SvgText x={3*W/4} y="164" fontSize="9" fill="#8B0000" textAnchor="middle" fontWeight="bold">ESTACIONAMIENTO</SvgText>
      <SvgText x={3*W/4} y="177" fontSize="8" fill="#8B0000" textAnchor="middle">Conductor ausente</SvgText>
      <SvgText x={3*W/4} y="189" fontSize="8" fill="#8B0000" textAnchor="middle">Sin límite de tiempo</SvgText>
    </Svg>
  );
}

// ─── DIAGRAMA 7: Distancias de aparcamiento prohibido ────────
export function DiagramAparcamientoProhibido() {
  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Rect width={W} height={H} fill="#F0F0F0" />
      {/* Road vertical */}
      <Rect x="100" y="0" width="80" height={H} fill={ROAD} />
      <Line x1="140" y1="0" x2="140" y2={H} stroke={YELLOW} strokeWidth="1.5" strokeDasharray="8,6" />

      {/* Intersection crossroad (horizontal) */}
      <Rect x="0" y="70" width={W} height="60" fill={ROAD} />
      <Line x1="0" y1="100" x2={W} y2="100" stroke={YELLOW} strokeWidth="1.5" strokeDasharray="8,6" />

      {/* 5m distance from crossing */}
      <Line x1="100" y1="68" x2="60" y2="68" stroke={RED} strokeWidth="2" />
      <Line x1="100" y1="133" x2="60" y2="133" stroke={RED} strokeWidth="2" />
      <Line x1="65" y1="68" x2="65" y2="133" stroke={RED} strokeWidth="1.5" strokeDasharray="4,3" />
      <SvgText x="30" y="105" fontSize="9" fill={RED} textAnchor="middle" fontWeight="bold">5 m</SvgText>

      {/* 25m from roundabout/stop */}
      <Line x1="182" y1="68" x2="230" y2="68" stroke={RED} strokeWidth="2" />
      <SvgText x="240" y="65" fontSize="9" fill={RED} textAnchor="start">25m antes de</SvgText>
      <SvgText x="240" y="78" fontSize="9" fill={RED} textAnchor="start">paso nivel</SvgText>

      {/* Prohibited zone car */}
      <G transform="translate(108, 30)">
        <Rect x="0" y="0" width="26" height="18" rx="2" fill={RED} opacity="0.4" />
        <Line x1="0" y1="0" x2="26" y2="18" stroke={RED} strokeWidth="2" />
        <Line x1="26" y1="0" x2="0" y2="18" stroke={RED} strokeWidth="2" />
      </G>

      <Rect x="0" y="178" width={W} height="22" fill="#000000AA" />
      <SvgText x={W/2} y="193" fontSize="10" fill={WHITE} textAnchor="middle">Prohibido estacionar a menos de 5 m de un cruce</SvgText>
    </Svg>
  );
}

// ─── MAP ───────────────────────────────────────────────────────
export type ScenarioId =
  | 'interseccion_derecha'
  | 'rotonda'
  | 'adelantamiento'
  | 'distancia_seguridad'
  | 'luces'
  | 'parada_estacionamiento'
  | 'aparcamiento_prohibido';

export function RoadScenario({ id, width = W, height = H }: { id: ScenarioId; width?: number; height?: number }) {
  const scale = Math.min(width / W, height / H);
  const components: Record<ScenarioId, React.ReactElement> = {
    interseccion_derecha:     <DiagramInterseccionDerecha />,
    rotonda:                  <DiagramRotonda />,
    adelantamiento:           <DiagramAdelantamiento />,
    distancia_seguridad:      <DiagramDistanciaSeguridad />,
    luces:                    <DiagramLuces />,
    parada_estacionamiento:   <DiagramParadaEstacionamiento />,
    aparcamiento_prohibido:   <DiagramAparcamientoProhibido />,
  };
  return components[id] ?? <DiagramInterseccionDerecha />;
}
