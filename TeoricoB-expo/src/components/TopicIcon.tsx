import React from 'react';
import Svg, { Polygon, Circle, Rect, Path, Text as SvgText, G, Line } from 'react-native-svg';

interface Props { size?: number }

export function IconSenales({ size = 56 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 56 56">
      <Polygon points="28,4 52,48 4,48" fill="#fff" stroke="#E63946" strokeWidth="4" strokeLinejoin="round" />
      <SvgText x="28" y="42" fontSize="20" fontWeight="bold" fill="#E63946" textAnchor="middle">!</SvgText>
    </Svg>
  );
}

export function IconVelocidades({ size = 56 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 56 56">
      <Circle cx="28" cy="28" r="24" fill="#fff" stroke="#FF9800" strokeWidth="4" />
      <Circle cx="28" cy="28" r="18" fill="#FF9800" />
      <SvgText x="28" y="33" fontSize="14" fontWeight="bold" fill="#fff" textAnchor="middle">120</SvgText>
    </Svg>
  );
}

export function IconPreferencia({ size = 56 }: Props) {
  // STOP octagon
  const s = size;
  const pts = Array.from({ length: 8 }, (_, i) => {
    const a = (i * 45 - 22.5) * Math.PI / 180;
    return `${s / 2 + (s / 2 - 4) * Math.cos(a)},${s / 2 + (s / 2 - 4) * Math.sin(a)}`;
  }).join(' ');
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Polygon points={pts} fill="#E63946" />
      <SvgText x={s / 2} y={s / 2 + 6} fontSize="13" fontWeight="bold" fill="#fff" textAnchor="middle">STOP</SvgText>
    </Svg>
  );
}

export function IconAlcohol({ size = 56 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 56 56">
      <Circle cx="28" cy="28" r="24" fill="#fff" stroke="#9C27B0" strokeWidth="4" />
      {/* Beer glass shape */}
      <Path d="M20,16 L22,40 L34,40 L36,16 Z" fill="#9C27B0" opacity={0.3} />
      <Rect x="20" y="16" width="16" height="4" rx="2" fill="#9C27B0" />
      {/* X mark */}
      <Line x1="16" y1="16" x2="40" y2="40" stroke="#9C27B0" strokeWidth="4" strokeLinecap="round" />
      <Line x1="40" y1="16" x2="16" y2="40" stroke="#9C27B0" strokeWidth="4" strokeLinecap="round" />
    </Svg>
  );
}

export function IconDistancias({ size = 56 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 56 56">
      {/* Road */}
      <Rect x="4" y="30" width="48" height="8" rx="4" fill="#2196F3" opacity={0.2} />
      {/* Car 1 */}
      <Rect x="4" y="22" width="18" height="10" rx="3" fill="#2196F3" />
      <Circle cx="9" cy="33" r="3" fill="#1565C0" />
      <Circle cx="17" cy="33" r="3" fill="#1565C0" />
      {/* Arrow */}
      <Path d="M24,27 L32,27 M29,23 L33,27 L29,31" stroke="#2196F3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Car 2 */}
      <Rect x="34" y="22" width="18" height="10" rx="3" fill="#2196F3" opacity={0.5} />
      <Circle cx="39" cy="33" r="3" fill="#1565C0" opacity={0.5} />
      <Circle cx="47" cy="33" r="3" fill="#1565C0" opacity={0.5} />
    </Svg>
  );
}

export function IconAuxilios({ size = 56 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 56 56">
      <Circle cx="28" cy="28" r="24" fill="#F44336" />
      <Rect x="22" y="14" width="12" height="28" rx="3" fill="#fff" />
      <Rect x="14" y="22" width="28" height="12" rx="3" fill="#fff" />
    </Svg>
  );
}

export function IconVehiculo({ size = 56 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 56 56">
      {/* Car body */}
      <Rect x="6" y="24" width="44" height="16" rx="4" fill="#607D8B" />
      {/* Roof */}
      <Path d="M14,24 L18,12 L38,12 L42,24 Z" fill="#546E7A" />
      {/* Windows */}
      <Rect x="19" y="14" width="8" height="8" rx="2" fill="#B0BEC5" />
      <Rect x="29" y="14" width="8" height="8" rx="2" fill="#B0BEC5" />
      {/* Wheels */}
      <Circle cx="16" cy="40" r="6" fill="#37474F" />
      <Circle cx="16" cy="40" r="3" fill="#B0BEC5" />
      <Circle cx="40" cy="40" r="6" fill="#37474F" />
      <Circle cx="40" cy="40" r="3" fill="#B0BEC5" />
    </Svg>
  );
}

export function IconMedioambiente({ size = 56 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 56 56">
      {/* Tree */}
      <Path d="M28,8 C20,8 12,16 16,26 C18,30 22,32 22,32 L34,32 C34,32 38,30 40,26 C44,16 36,8 28,8 Z" fill="#4CAF50" />
      <Rect x="25" y="32" width="6" height="14" rx="2" fill="#795548" />
      {/* Leaf accent */}
      <Path d="M28,14 C24,18 22,24 26,28" stroke="#A5D6A7" strokeWidth="2" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function IconInfracciones({ size = 56 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 56 56">
      {/* Ticket/fine */}
      <Rect x="8" y="12" width="40" height="32" rx="6" fill="#FF5722" />
      <Rect x="14" y="18" width="20" height="3" rx="1.5" fill="#fff" opacity={0.9} />
      <Rect x="14" y="24" width="28" height="3" rx="1.5" fill="#fff" opacity={0.7} />
      <Rect x="14" y="30" width="16" height="3" rx="1.5" fill="#fff" opacity={0.7} />
      {/* Euro sign */}
      <Circle cx="40" cy="36" r="8" fill="#fff" />
      <SvgText x="40" y="40" fontSize="11" fontWeight="bold" fill="#FF5722" textAnchor="middle">€</SvgText>
    </Svg>
  );
}

export function IconVias({ size = 56 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 56 56">
      {/* Road perspective */}
      <Path d="M4,48 L20,8 L36,8 L52,48 Z" fill="#455A64" />
      {/* Lane markings */}
      <Rect x="26" y="10" width="4" height="8" rx="2" fill="#FFD166" />
      <Rect x="26" y="22" width="4" height="8" rx="2" fill="#FFD166" />
      <Rect x="26" y="34" width="4" height="8" rx="2" fill="#FFD166" />
      {/* Kerbs */}
      <Path d="M4,48 L20,8" stroke="#B0BEC5" strokeWidth="3" />
      <Path d="M52,48 L36,8" stroke="#B0BEC5" strokeWidth="3" />
    </Svg>
  );
}

const ICON_MAP: Record<string, React.FC<Props>> = {
  senales:       IconSenales,
  velocidades:   IconVelocidades,
  preferencia:   IconPreferencia,
  alcohol:       IconAlcohol,
  distancias:    IconDistancias,
  auxilios:      IconAuxilios,
  vehiculo:      IconVehiculo,
  medioambiente: IconMedioambiente,
  infracciones:  IconInfracciones,
  vias:          IconVias,
};

export function TopicIcon({ topicId, size = 56 }: { topicId: string; size?: number }) {
  const Icon = ICON_MAP[topicId] ?? IconVias;
  return <Icon size={size} />;
}
