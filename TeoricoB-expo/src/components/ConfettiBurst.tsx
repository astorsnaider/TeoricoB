import React, { useEffect, useRef } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

interface Props {
  /** Cada vez que cambia (>0), dispara una nueva ráfaga. */
  trigger: number;
  /** Número de partículas. */
  count?: number;
  /** Origen del cañón (default centro arriba). */
  origin?: { x: number; y: number };
  /** Duración del fade (ms). */
  fadeOutDuration?: number;
  /** Colores de las partículas. */
  colors?: string[];
}

const DEFAULT_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA', '#F472B6', '#FBBF24', '#34D399'];

/**
 * Wrapper de react-native-confetti-cannon que se vuelve a montar cada
 * vez que cambia el `trigger`. Eso permite usarlo en modales que se
 * abren y cerrar varias veces sin estado pegajoso.
 *
 * En web cae a un View vacío (la librería no soporta web bien y no es
 * crítica para esa plataforma).
 */
export default function ConfettiBurst({
  trigger,
  count = 180,
  origin,
  fadeOutDuration = 2500,
  colors = DEFAULT_COLORS,
}: Props) {
  const ref = useRef<ConfettiCannon | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (trigger > 0) {
      // start() se encarga del primer disparo cuando autoStart está activo,
      // pero forzamos manualmente para rachas seguidas.
      ref.current?.start();
    }
  }, [trigger]);

  if (Platform.OS === 'web' || trigger <= 0) {
    return <View pointerEvents="none" style={StyleSheet.absoluteFill} />;
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <ConfettiCannon
        key={trigger}
        ref={r => { ref.current = r; }}
        count={count}
        origin={origin ?? { x: 0, y: 0 }}
        fadeOut
        autoStart
        explosionSpeed={400}
        fallSpeed={3000}
        colors={colors}
      />
    </View>
  );
}
