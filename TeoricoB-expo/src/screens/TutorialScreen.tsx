import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../store/useStore';
import { useTheme } from '../hooks/useTheme';
import { SHADOWS } from '../theme';

type TutorialStep = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
  bullets: string[];
  colorKey: 'primary' | 'blue' | 'correct' | 'orange';
};

const STEPS: TutorialStep[] = [
  {
    icon: 'school-outline',
    title: 'Estudia por lecciones',
    text: 'Cada tema está dividido en bloques cortos para avanzar sin mezclar conceptos.',
    bullets: [
      'Empieza por una lección y completa sus preguntas.',
      'Ganas XP, mantienes la racha y ves tu progreso por tema.',
      'Las vidas solo se gastan en práctica (no en examen) y se regeneran solas cada 30 min.',
    ],
    colorKey: 'primary',
  },
  {
    icon: 'help-buoy-outline',
    title: 'Aprende de cada fallo',
    text: 'Cuando fallas, la app muestra la respuesta correcta y una explicación breve.',
    bullets: [
      'Las preguntas citan la referencia legal cuando corresponde.',
      'En muchas preguntas puedes abrir el capítulo del manual relacionado.',
      'El repaso de fallos queda disponible al terminar un quiz.',
    ],
    colorKey: 'blue',
  },
  {
    icon: 'timer-outline',
    title: 'Haz exámenes simulados',
    text: 'El modo examen replica el formato básico del teórico B para entrenar con presión realista.',
    bullets: [
      '30 preguntas seleccionadas del banco completo.',
      '30 minutos de tiempo máximo.',
      'Apruebas con 3 fallos o menos.',
    ],
    colorKey: 'correct',
  },
  {
    icon: 'trophy-outline',
    title: 'Compite y gana logros',
    text: 'Tu constancia se convierte en progreso visible y recompensas.',
    bullets: [
      'Gana XP en cada lección y sube de nivel.',
      'Compite cada semana en tu liga (Bronce, Plata, Oro).',
      'Completa el reto diario para mantener viva tu racha.',
    ],
    colorKey: 'orange',
  },
  {
    icon: 'document-text-outline',
    title: 'Usa el manual como apoyo',
    text: 'El manual está pensado para resolver dudas antes de volver a practicar.',
    bullets: [
      'Entra desde la pestaña Manual cuando quieras repasar teoría.',
      'Consulta señales, velocidades, prioridad, alcohol y el resto de temas.',
      'Perfil guarda estadísticas, historial de exámenes y ajustes.',
    ],
    colorKey: 'blue',
  },
];

export default function TutorialScreen() {
  const [step, setStep] = useState(0);
  const completeTutorial = useStore(s => s.completeTutorial);
  const theme = useTheme();
  const current = STEPS[step];
  const color = theme[current.colorKey];
  const isLast = step === STEPS.length - 1;

  const goNext = () => {
    if (isLast) {
      completeTutorial();
      return;
    }
    setStep(s => s + 1);
  };

  const goBack = () => setStep(s => Math.max(0, s - 1));

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <View style={s.container}>
        <View style={s.topRow}>
          {step > 0 ? (
            <TouchableOpacity
              onPress={goBack}
              hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
              style={s.backBtn}
            >
              <Ionicons name="chevron-back" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          ) : (
            <View style={s.backBtn} />
          )}
          <View style={s.dots}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  s.dot,
                  { backgroundColor: i === step ? color : theme.border },
                  i === step && s.dotActive,
                ]}
              />
            ))}
          </View>
          <TouchableOpacity onPress={completeTutorial} hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}>
            <Text style={[s.skip, { color: theme.textSecondary }]}>Omitir</Text>
          </TouchableOpacity>
        </View>

        <LinearGradient colors={[color + '22', color + '04']} style={s.hero}>
          <View style={[s.iconCircle, { backgroundColor: color + '18' }]}>
            <Ionicons name={current.icon} size={54} color={color} />
          </View>
          <Text style={[s.title, { color: theme.textPrimary }]}>{current.title}</Text>
          <Text style={[s.text, { color: theme.textSecondary }]}>{current.text}</Text>
        </LinearGradient>

        <View style={s.bulletList}>
          {current.bullets.map((bullet, i) => (
            <View key={i} style={[s.bulletCard, { backgroundColor: theme.card, borderColor: theme.border }, SHADOWS.small]}>
              <View style={[s.bulletIcon, { backgroundColor: color + '16' }]}>
                <Ionicons name="checkmark" size={16} color={color} />
              </View>
              <Text style={[s.bulletText, { color: theme.textPrimary }]}>{bullet}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={{ borderRadius: 16, overflow: 'hidden' }} onPress={goNext} activeOpacity={0.85}>
          <LinearGradient
            colors={[theme.primary, theme.primary + 'CC']}
            style={s.cta}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={s.ctaText}>{isLast ? 'Entrar a la app' : 'Siguiente'}</Text>
            <Ionicons name={isLast ? 'checkmark' : 'arrow-forward'} size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 20, gap: 16 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 28, alignItems: 'flex-start' },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 24 },
  skip: { fontSize: 14, fontWeight: '700' },
  hero: { borderRadius: 20, padding: 24, alignItems: 'center', gap: 12 },
  iconCircle: { width: 100, height: 100, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center' },
  text: { fontSize: 14, lineHeight: 21, textAlign: 'center' },
  bulletList: { flex: 1, gap: 10, justifyContent: 'center' },
  bulletCard: { flexDirection: 'row', gap: 12, alignItems: 'center', borderRadius: 14, padding: 14, borderWidth: 1 },
  bulletIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  bulletText: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  cta: { padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
