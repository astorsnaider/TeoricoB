import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Platform, View, Modal } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface Props {
  onBack: () => void;
  children: React.ReactNode;
  edgeWidth?: number;
  threshold?: number;
}

/**
 * Contenedor de subpágina estilo iOS: entra deslizándose desde la derecha
 * sobre toda la pantalla (incluida la tab bar) y se cierra con swipe desde
 * el borde izquierdo. La pantalla anterior queda visible detrás durante el
 * arrastre.
 *
 * Para que cubra la tab bar y demás elementos de chrome del root,
 * se monta dentro de un Modal transparente fullscreen.
 */
export default function SubPage({ onBack, children, edgeWidth = 28, threshold = 90 }: Props) {
  const screenW = Dimensions.get('window').width;
  const translateX = useRef(new Animated.Value(screenW)).current;
  const startX = useRef(0);
  // Mantenemos el modal montado hasta terminar la animación de salida.
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: 0,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, []);

  const animateBackHome = () => {
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
        setVisible(false);
        onBack();
      }
    });
  };

  const pan = Platform.OS === 'web' ? null : Gesture.Pan()
    .activeOffsetX(8)
    .failOffsetY([-18, 18])
    .runOnJS(true)
    .onBegin(e => {
      startX.current = e.absoluteX;
    })
    .onUpdate(e => {
      if (startX.current > edgeWidth) return;
      translateX.setValue(Math.max(0, e.translationX));
    })
    .onEnd(e => {
      if (startX.current > edgeWidth) {
        animateBackHome();
        return;
      }
      if (e.translationX > threshold && e.velocityX >= 0) {
        animateOut();
      } else {
        animateBackHome();
      }
    });

  const content = (
    <Animated.View style={[styles.fill, { transform: [{ translateX }] }]}>
      {children}
    </Animated.View>
  );

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      presentationStyle="overFullScreen"
      onRequestClose={animateOut}
      statusBarTranslucent
    >
      {pan ? (
        <GestureDetector gesture={pan}>
          <View style={styles.fill}>{content}</View>
        </GestureDetector>
      ) : (
        <View style={styles.fill}>{content}</View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
