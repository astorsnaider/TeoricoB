import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../store/useStore';
import { useTheme } from '../hooks/useTheme';
import { SHADOWS } from '../theme';
import { LEGAL } from '../legal/config';

export default function DisclaimerScreen() {
  const acceptDisclaimer = useStore(s => s.acceptDisclaimer);
  const theme = useTheme();
  const [accepted, setAccepted] = useState(false);

  const points = [
    {
      icon: 'book-outline' as const,
      color: theme.blue,
      title: 'Qué es',
      text: 'Material de estudio elaborado a partir de fuentes oficiales públicas (BOE y publicaciones abiertas de la DGT).',
    },
    {
      icon: 'close-circle-outline' as const,
      color: theme.wrong,
      title: 'Qué NO es',
      text: 'No es la app oficial DGT. No sustituye a una autoescuela autorizada. No reemplaza las clases prácticas obligatorias.',
    },
    {
      icon: 'shield-checkmark-outline' as const,
      color: theme.correct,
      title: 'Nuestro compromiso',
      text: 'Contenido contrastado con la normativa vigente. Cada pregunta cita el artículo legal correspondiente.',
    },
    {
      icon: 'school-outline' as const,
      color: theme.orange,
      title: 'Tu responsabilidad',
      text: 'Inscribirte en una autoescuela autorizada y consultar fuentes oficiales antes del examen.',
    },
  ];

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        <LinearGradient colors={[theme.primary + '20', theme.primary + '02']} style={s.hero}>
          <View style={[s.heroIcon, { backgroundColor: theme.primary + '20' }]}>
            <Ionicons name="information-circle" size={44} color={theme.primary} />
          </View>
          <Text style={[s.heroTitle, { color: theme.textPrimary }]}>Antes de empezar</Text>
          <Text style={[s.heroSub, { color: theme.textSecondary }]}>
            Lee con atención cómo funciona {LEGAL.APP_NAME} y qué esperar de ella
          </Text>
        </LinearGradient>

        {points.map((p, i) => (
          <View key={i} style={[s.pointCard, { backgroundColor: theme.card, borderColor: theme.border }, SHADOWS.small]}>
            <View style={[s.pointIcon, { backgroundColor: p.color + '18' }]}>
              <Ionicons name={p.icon} size={22} color={p.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.pointTitle, { color: theme.textPrimary }]}>{p.title}</Text>
              <Text style={[s.pointText, { color: theme.textSecondary }]}>{p.text}</Text>
            </View>
          </View>
        ))}

        <View style={[s.warnBox, { backgroundColor: theme.yellow + '20', borderLeftColor: theme.yellow }]}>
          <Ionicons name="warning-outline" size={18} color={theme.orange} />
          <Text style={[s.warnText, { color: theme.textPrimary }]}>
            Esta aplicación no está vinculada ni autorizada por la DGT. Es una herramienta independiente de estudio complementario.
          </Text>
        </View>

        <TouchableOpacity
          style={[s.checkboxRow, { backgroundColor: theme.card, borderColor: accepted ? theme.correct : theme.border }]}
          onPress={() => setAccepted(!accepted)}
          activeOpacity={0.7}
        >
          <View style={[s.checkbox, { borderColor: accepted ? theme.correct : theme.border, backgroundColor: accepted ? theme.correct : 'transparent' }]}>
            {accepted && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
          <Text style={[s.checkboxLabel, { color: theme.textPrimary }]}>
            He leído y entiendo que esta app es material de estudio complementario, no oficial DGT
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ borderRadius: 16, overflow: 'hidden', opacity: accepted ? 1 : 0.4 }}
          onPress={acceptDisclaimer}
          disabled={!accepted}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[theme.primary, theme.primary + 'CC']}
            style={s.cta}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={s.ctaTxt}>Entendido, continuar</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        <Text style={[s.footer, { color: theme.textTertiary }]}>
          Podrás consultar el Aviso Legal, Términos y Política de Privacidad en cualquier momento desde Perfil
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 20, gap: 12 },
  hero: { borderRadius: 20, padding: 24, alignItems: 'center', gap: 10 },
  heroIcon: { width: 84, height: 84, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
  heroSub: { fontSize: 14, textAlign: 'center', lineHeight: 21 },
  pointCard: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', borderRadius: 14, padding: 14, borderWidth: 1 },
  pointIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  pointTitle: { fontSize: 14, fontWeight: '800', marginBottom: 3 },
  pointText: { fontSize: 13, lineHeight: 19 },
  warnBox: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', borderRadius: 12, padding: 12, borderLeftWidth: 3, marginTop: 4 },
  warnText: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: '500' },
  checkboxRow: { flexDirection: 'row', gap: 12, alignItems: 'center', borderRadius: 14, padding: 14, borderWidth: 1.5, marginTop: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  checkboxLabel: { flex: 1, fontSize: 13, lineHeight: 19, fontWeight: '500' },
  cta: { padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  ctaTxt: { color: '#fff', fontSize: 17, fontWeight: '800' },
  footer: { fontSize: 11, textAlign: 'center', marginTop: 8 },
});
