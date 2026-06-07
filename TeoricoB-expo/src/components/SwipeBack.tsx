import React, { useRef } from 'react';
import { StyleSheet, ViewStyle, StyleProp, Platform, Animated, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface Props {
  onBack: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  edgeWidth?: number;
  threshold?: number;
}

/**
 * Wrapper de pantalla con gesto swipe-back desde el borde izquierdo,
 * estilo iOS. El contenido se arrastra siguiendo al dedo; si al soltar
 * se supera `threshold`, anima la salida hacia la derecha y llama a
 * `onBack`. Si no, vuelve a su posición original.
 */
export default function SwipeBack({
  onBack,
  children,
  style,
  edgeWidth = 28,
  threshold = 90,
}: Props) {
  if (Platform.OS === 'web') {
    return <Animated.View style={[styles.fill, style]}>{children}</Animated.View>;
  }

  const screenW = Dimensions.get('window').width;
  const translateX = useRef(new Animated.Value(0)).current;
  const startX = useRef(0);

  const animateBack = () => {
    Animated.timing(translateX, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const animateOut = () => {
    Animated.timing(translateX, {
      toValue: screenW,
      duration: 220,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        onBack();
        // Reset para la próxima entrada
        translateX.setValue(0);
      }
    });
  };

  const pan = Gesture.Pan()
    .activeOffsetX(8)
    .failOffsetY([-18, 18])
    .runOnJS(true)
    .onBegin(e => {
      startX.current = e.absoluteX;
    })
    .onUpdate(e => {
      if (startX.current > edgeWidth) return;
      const dx = Math.max(0, e.translationX);
      translateX.setValue(dx);
    })
    .onEnd(e => {
      if (startX.current > edgeWidth) {
        animateBack();
        return;
      }
      if (e.translationX > threshold && e.velocityX >= 0) {
        animateOut();
      } else {
        animateBack();
      }
    })
    .onFinalize(() => {
      // Por si el gesto se cancela (multitouch, foreground change…)
      // y no llegó al onEnd, asegurar reset visual.
    });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[styles.fill, style, { transform: [{ translateX }] }]}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
