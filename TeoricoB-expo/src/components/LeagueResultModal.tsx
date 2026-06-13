/**
 * LeagueResultModal — resultado de cierre de la liga semanal.
 *
 * Aparece cuando la cohorte de la semana pasada se finalizó: muestra si
 * ascendiste / te mantuviste / descendiste, con confetti y recompensa de
 * gemas (solo al ascender). El cliente concede las gemas una vez.
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { SHADOWS } from '../theme';
import { getLeagueInfo } from '../store/useStore';
import { LeagueType } from '../types';
import ConfettiBurst from './ConfettiBurst';

const PROMOTE_GEMS = 30;

export default function LeagueResultModal({
  result, league, onClaim,
}: {
  result: 'promoted' | 'relegated' | 'stayed';
  league: LeagueType;
  onClaim: (gems: number) => void;
}) {
  const theme = useTheme();
  const li = getLeagueInfo(league);
  const scale = useRef(new Animated.Value(0.6)).current;
  const [burst, setBurst] = useState(0);

  const promoted = result === 'promoted';
  const relegated = result === 'relegated';
  const gems = promoted ? PROMOTE_GEMS : 0;

  const title = promoted ? '¡Has ascendido!' : relegated ? 'Has bajado de liga' : 'Te mantienes';
  const sub = promoted
    ? `Subes a la Liga ${league}. ¡Sigue así!`
    : relegated
      ? `Esta semana bajas a la Liga ${league}. ¡A remontar!`
      : `Sigues en la Liga ${league}. La semana que viene a por el ascenso.`;
  const gradient: [string, string] = promoted
    ? [li.color, li.color + 'CC']
    : relegated
      ? [theme.wrong, theme.wrong + 'CC']
      : [theme.textSecondary, theme.textTertiary];

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, friction: 6, tension: 90, useNativeDriver: true }).start();
    if (promoted) {
      setBurst(b => b + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    } else {
      Haptics.notificationAsync(
        relegated ? Haptics.NotificationFeedbackType.Warning : Haptics.NotificationFeedbackType.Success
      ).catch(() => undefined);
    }
  }, []);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => onClaim(gems)}>
      <View style={s.backdrop}>
        {promoted && <ConfettiBurst trigger={burst} count={200} />}
        <Animated.View style={[s.card, { backgroundColor: theme.card, transform: [{ scale }] }, SHADOWS.medium]}>
          <LinearGradient colors={gradient} style={s.hero} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
            <Text style={s.heroEmoji}>{li.emoji}</Text>
            <Ionicons
              name={promoted ? 'arrow-up-circle' : relegated ? 'arrow-down-circle' : 'shield-checkmark'}
              size={30} color="#fff" style={{ marginTop: -6 }}
            />
          </LinearGradient>

          <Text style={[s.title, { color: theme.textPrimary }]}>{title}</Text>
          <Text style={[s.sub, { color: theme.textSecondary }]}>{sub}</Text>

          {gems > 0 && (
            <View style={[s.gemRow, { backgroundColor: theme.bg2 }]}>
              <Ionicons name="diamond" size={20} color="#9C27B0" />
              <Text style={[s.gemTxt, { color: theme.textPrimary }]}>+{gems} gemas</Text>
            </View>
          )}

          <TouchableOpacity style={{ width: '100%', borderRadius: 14, overflow: 'hidden' }} onPress={() => onClaim(gems)} activeOpacity={0.85}>
            <LinearGradient colors={[theme.primary, theme.primary + 'CC']} style={s.cta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={s.ctaTxt}>{gems > 0 ? '¡Recoger!' : 'Entendido'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 340, borderRadius: 24, padding: 18, alignItems: 'center', gap: 12 },
  hero: { width: '100%', borderRadius: 18, paddingVertical: 22, alignItems: 'center', gap: 2 },
  heroEmoji: { fontSize: 50 },
  title: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  sub: { fontSize: 14, lineHeight: 20, textAlign: 'center', paddingHorizontal: 4 },
  gemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  gemTxt: { fontSize: 16, fontWeight: '800' },
  cta: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  ctaTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
