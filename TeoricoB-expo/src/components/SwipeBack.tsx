import React, { useRef } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface Props {
  onBack: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  edgeWidth?: number;
  threshold?: number;
}

/**
 * Envuelve una pantalla con una zona detectora de gesto desde el borde
 * izquierdo (estilo swipe-back de iOS). Cuando el usuario arrastra desde
 * los primeros `edgeWidth` px hacia la derecha al menos `threshold` px,
 * se dispara `onBack`.
 *
 * En web cae a un wrapper sin gesto.
 */
export default function SwipeBack({
  onBack,
  children,
  style,
  edgeWidth = 24,
  threshold = 80,
}: Props) {
  if (Platform.OS === 'web') {
    return <View style={[styles.fill, style]}>{children}</View>;
  }

  // Refs locales para guardar el punto de inicio sin recrear el gesto en cada render.
  const startX = useRef(0);

  const pan = Gesture.Pan()
    .activeOffsetX(10)
    .failOffsetY([-15, 15])
    .runOnJS(true)
    .onBegin(e => {
      startX.current = e.absoluteX;
    })
    .onEnd(e => {
      if (
        startX.current <= edgeWidth &&
        e.translationX > threshold &&
        e.velocityX > 0
      ) {
        onBack();
      }
    });

  return (
    <GestureDetector gesture={pan}>
      <View style={[styles.fill, style]}>{children}</View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
