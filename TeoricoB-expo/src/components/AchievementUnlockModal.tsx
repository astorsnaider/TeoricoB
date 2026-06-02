/**
 * Modal animado que aparece al desbloquear un logro.
 *
 * Se controla con el flag `newAchievement` del store. Cuando se setea,
 * el modal hace fade+scale in, muestra el emoji grande + recompensas y
 * cierra al tap del botón "¡Genial!" o tras 5s automáticamente.
 *
 * Confeti hecho con un puñado de <Animated.View> que caen desde el top
 * con offsets aleatorios — suficiente para sensación de celebración sin
 * dependencias extra (Lottie etc.).
 */
import React, { useEffect, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Easing, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { Achievement } from '../types';
import { useTheme } from '../hooks/useTheme';
import { SHADOWS } from '../theme';

const AUTO_CLOSE_MS = 5000;
const SCREEN_W = Dimensions.get('window').width;
const CONFETTI_COUNT = 14;
const CONFETTI_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA', '#F472B6', '#FBBF24'];

export function AchievementUnlockModal({
  achievement,
  onClose,
}: {
  achievement: Achievement | null;
  onClose: () => void;
}) {
  const visible = !!achievement;
  const theme = useTheme();
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Confeti generado solo cuando hay achievement nuevo (estable entre renders)
  const confetti = useMemo(() => {
    if (!visible) return [];
    return Array.from({ length: CONFETTI_COUNT }).map((_, i) => ({
      x: Math.random() * SCREEN_W,
      delay: Math.random() * 400,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      rotate: Math.random() * 360,
      anim: new Animated.Value(0),
    }));
    // achievement.id triggers regeneración entre logros
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [achievement?.id]);

  useEffect(() => {
    if (!visible) {
      scale.setValue(0.6);
      opacity.setValue(0);
      return;
    }
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 90, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
    // Confeti
    Animated.stagger(
      40,
      confetti.map(c =>
        Animated.timing(c.anim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.linear,
          delay: c.delay,
          useNativeDriver: true,
        })
      )
    ).start();
    // Auto-cerrar
    closeTimerRef.current = setTimeout(onClose, AUTO_CLOSE_MS);
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [visible, achievement?.id, confetti, onClose, scale, opacity]);

  if (!achievement) return null;

  const rewardGems = achievement.rewardGems ?? 0;
  const rewardXP = achievement.rewardXP ?? 0;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={s.backdrop}>
        {/* Confeti detrás del card */}
        {confetti.map((c, i) => (
          <Animated.View
            key={i}
            style={[
              s.confetti,
              {
                left: c.x,
                backgroundColor: c.color,
                transform: [
                  { translateY: c.anim.interpolate({ inputRange: [0, 1], outputRange: [-30, 700] }) },
                  { rotate: `${c.rotate}deg` },
                ],
                opacity: c.anim.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 1, 1, 0] }),
              },
            ]}
          />
        ))}
        <Animated.View
          style={[
            s.card,
            { backgroundColor: theme.card, transform: [{ scale }], opacity },
            SHADOWS.medium,
          ]}
        >
          <LinearGradient
            colors={[theme.primary + '22', theme.primary + '04']}
            style={s.hero}
            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          >
            <View style={[s.iconCircle, { backgroundColor: theme.primary + '18' }]}>
              <Text style={s.emoji}>{achievement.emoji}</Text>
            </View>
            <Text style={[s.label, { color: theme.primary }]}>¡Logro desbloqueado!</Text>
            <Text style={[s.name, { color: theme.textPrimary }]}>{achievement.name}</Text>
            <Text style={[s.desc, { color: theme.textSecondary }]}>{achievement.description}</Text>
          </LinearGradient>

          {(rewardGems > 0 || rewardXP > 0) && (
            <View style={[s.rewardRow, { borderTopColor: theme.border }]}>
              {rewardGems > 0 && (
                <View style={s.rewardItem}>
                  <Ionicons name="diamond" size={20} color="#9C27B0" />
                  <Text style={[s.rewardTxt, { color: theme.textPrimary }]}>+{rewardGems}</Text>
                </View>
              )}
              {rewardXP > 0 && (
                <View style={s.rewardItem}>
                  <Ionicons name="flash" size={20} color={theme.yellow} />
                  <Text style={[s.rewardTxt, { color: theme.textPrimary }]}>+{rewardXP} XP</Text>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity style={{ borderRadius: 14, overflow: 'hidden' }} onPress={onClose} activeOpacity={0.85}>
            <LinearGradient
              colors={[theme.primary, theme.primary + 'CC']}
              style={s.cta}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Text style={s.ctaTxt}>¡Genial!</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 14,
    borderRadius: 2,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    padding: 16,
    gap: 14,
  },
  hero: {
    alignItems: 'center',
    padding: 22,
    borderRadius: 18,
    gap: 8,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emoji: { fontSize: 46, lineHeight: 56 },
  label: { fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  name: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  desc: { fontSize: 13, lineHeight: 19, textAlign: 'center', paddingHorizontal: 4 },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 0.5,
  },
  rewardItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rewardTxt: { fontSize: 17, fontWeight: '800' },
  cta: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
