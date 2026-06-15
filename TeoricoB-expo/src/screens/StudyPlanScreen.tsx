/**
 * StudyPlanScreen — plan de estudio personalizado.
 *
 * El usuario fija la fecha de su examen DGT y la app calcula:
 *  - Cuenta atrás (días restantes).
 *  - "Preparación" = % de lecciones hechas sin fallos.
 *  - "Plan de hoy": las lecciones más prioritarias a estudiar hoy,
 *    repartidas según los días que quedan (temas más flojos primero).
 *
 * Se monta como SubPage desde HomeScreen.
 */
import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../store/useStore';
import { useTheme } from '../hooks/useTheme';
import { SHADOWS } from '../theme';
import { Topic, Lesson } from '../types';
import { TopicIcon } from '../components/TopicIcon';
import QuizModal from '../components/QuizModal';
import { useSoundEffect } from '../audio/useSoundEffect';

interface Props { onBack: () => void; }

const MS_DAY = 86400000;
const PRESETS = [7, 14, 30, 45, 60, 90];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function todayMidnight(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}
function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function formatEs(iso: string): string {
  const [y, m, dd] = iso.split('-').map(Number);
  return `${dd} ${MONTHS[m - 1]} ${y}`;
}
function daysLeftFrom(iso: string): number {
  const [y, m, dd] = iso.split('-').map(Number);
  const target = new Date(y, m - 1, dd);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - todayMidnight().getTime()) / MS_DAY);
}

export default function StudyPlanScreen({ onBack }: Props) {
  const theme = useTheme();
  const playSound = useSoundEffect();
  const topics = useStore(s => s.topics);
  const lessonStats = useStore(s => s.user.lessonStats);
  const topicStats = useStore(s => s.user.topicStats);
  const examDate = useStore(s => s.user.examDate);
  const setExamDate = useStore(s => s.setExamDate);
  const completeLesson = useStore(s => s.completeLesson);

  const [activeLesson, setActiveLesson] = useState<{ topic: Topic; lesson: Lesson } | null>(null);
  const [setupDays, setSetupDays] = useState(30);

  // ── Cálculo del plan ───────────────────────────────────────────────
  const plan = useMemo(() => {
    const all: { topic: Topic; lesson: Lesson }[] = topics.flatMap(t =>
      t.lessons.map(l => ({ topic: t, lesson: l }))
    );
    const statusOf = (l: Lesson): 'todo' | 'weak' | 'done' => {
      const st = lessonStats?.[l.id];
      if (!st) return 'todo';
      return st.bestWrong === 0 ? 'done' : 'weak';
    };
    const total = all.length;
    const perfect = all.filter(x => statusOf(x.lesson) === 'done').length;
    const readiness = total ? perfect / total : 0;

    // Prioridad: temas con menor precisión primero (sin datos = sin estudiar
    // = máxima prioridad). Dentro, lecciones no hechas antes que las falladas.
    const accOf = (t: Topic): number => {
      const st = topicStats?.[t.id];
      return st && st.total > 0 ? st.correct / st.total : -1;
    };
    const pending = all
      .filter(x => statusOf(x.lesson) !== 'done')
      .sort((a, b) => {
        const da = accOf(a.topic), db = accOf(b.topic);
        if (da !== db) return da - db;
        const order = (x: typeof a) => (statusOf(x.lesson) === 'todo' ? 0 : 1);
        return order(a) - order(b);
      });

    const days = examDate ? daysLeftFrom(examDate) : 0;
    const perDay = Math.max(1, Math.min(5, Math.ceil(pending.length / Math.max(1, days))));
    const today = pending.slice(0, perDay);

    return { total, perfect, readiness, pending, today, days };
  }, [topics, lessonStats, topicStats, examDate]);

  // ── Setup (sin fecha) ──────────────────────────────────────────────
  if (!examDate) {
    const target = addDays(todayMidnight(), setupDays);
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
        <Header onBack={onBack} theme={theme} />
        <ScrollView contentContainerStyle={s.content}>
          <LinearGradient colors={[theme.primary, theme.primary + 'CC']} style={s.setupHero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="calendar" size={48} color="#fff" />
            <Text style={s.setupHeroTitle}>¿Cuándo es tu examen?</Text>
            <Text style={s.setupHeroSub}>Te organizo un plan diario para llegar a punto.</Text>
          </LinearGradient>

          <Text style={[s.label, { color: theme.textSecondary }]}>Elige cuándo</Text>
          <View style={s.chipsRow}>
            {PRESETS.map(d => (
              <TouchableOpacity
                key={d}
                style={[s.chip, { borderColor: theme.border, backgroundColor: setupDays === d ? theme.primary : theme.card }]}
                onPress={() => setSetupDays(d)}
              >
                <Text style={[s.chipTxt, { color: setupDays === d ? '#fff' : theme.textPrimary }]}>
                  {d < 30 ? `${d / 7} sem` : d === 30 ? '1 mes' : d === 45 ? '6 sem' : d === 60 ? '2 meses' : '3 meses'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[s.stepperCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TouchableOpacity style={[s.stepBtn, { backgroundColor: theme.bg2 }]} onPress={() => setSetupDays(d => Math.max(1, d - 1))}>
              <Ionicons name="remove" size={18} color={theme.textPrimary} />
            </TouchableOpacity>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={[s.stepDays, { color: theme.textPrimary }]}>{setupDays} día{setupDays === 1 ? '' : 's'}</Text>
              <Text style={[s.stepDate, { color: theme.textSecondary }]}>{formatEs(toIso(target))}</Text>
            </View>
            <TouchableOpacity style={[s.stepBtn, { backgroundColor: theme.bg2 }]} onPress={() => setSetupDays(d => Math.min(365, d + 1))}>
              <Ionicons name="add" size={18} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={{ borderRadius: 16, overflow: 'hidden' }} onPress={() => { playSound('tap'); setExamDate(toIso(target)); }} activeOpacity={0.85}>
            <LinearGradient colors={[theme.primary, theme.primary + 'CC']} style={s.cta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={s.ctaTxt}>Crear mi plan</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Plan activo ────────────────────────────────────────────────────
  const { readiness, perfect, total, pending, today, days } = plan;
  const isExamDay = days === 0;
  const isPast = days < 0;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <Header onBack={onBack} theme={theme} onClear={() => setExamDate(null)} />
      <ScrollView contentContainerStyle={s.content}>

        {/* Cuenta atrás */}
        <LinearGradient colors={[theme.primary, theme.primary + 'CC']} style={s.countHero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          {isPast ? (
            <Text style={s.countBig}>¡Suerte!</Text>
          ) : isExamDay ? (
            <Text style={s.countBig}>¡Hoy!</Text>
          ) : (
            <>
              <Text style={s.countBig}>{days}</Text>
              <Text style={s.countLbl}>día{days === 1 ? '' : 's'} para tu examen</Text>
            </>
          )}
          <Text style={s.countDate}>{formatEs(examDate)}</Text>
        </LinearGradient>

        {/* Preparación */}
        <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={s.readyRow}>
            <Text style={[s.readyLabel, { color: theme.textPrimary }]}>Preparación</Text>
            <Text style={[s.readyPct, { color: theme.correct }]}>{Math.round(readiness * 100)}%</Text>
          </View>
          <View style={[s.progBg, { backgroundColor: theme.bg2 }]}>
            <View style={[s.progFill, { width: `${readiness * 100}%`, backgroundColor: theme.correct }]} />
          </View>
          <Text style={[s.readySub, { color: theme.textSecondary }]}>
            {perfect}/{total} lecciones dominadas (sin fallos)
          </Text>
        </View>

        {/* Plan de hoy */}
        <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>Tu plan de hoy</Text>
        {pending.length === 0 ? (
          <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border, alignItems: 'center', gap: 8 }]}>
            <Ionicons name="checkmark-done-circle" size={34} color={theme.correct} />
            <Text style={[s.doneTitle, { color: theme.textPrimary }]}>¡Todo dominado!</Text>
            <Text style={[s.doneSub, { color: theme.textSecondary }]}>
              Has hecho todas las lecciones sin fallos. Repasa o haz un examen simulado para mantenerte fino.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {today.map(({ topic, lesson }) => {
              const st = lessonStats?.[lesson.id];
              const weak = !!st && st.bestWrong > 0;
              return (
                <TouchableOpacity
                  key={lesson.id}
                  style={[s.lessonCard, { backgroundColor: theme.card, borderColor: theme.border }, SHADOWS.small]}
                  onPress={() => { playSound('tap'); setActiveLesson({ topic, lesson }); }}
                  activeOpacity={0.85}
                >
                  <View style={[s.lessonIcon, { backgroundColor: topic.colorHex + '18' }]}>
                    <TopicIcon topicId={topic.id} size={30} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.lessonTitle, { color: theme.textPrimary }]} numberOfLines={1}>{lesson.title}</Text>
                    <Text style={[s.lessonSub, { color: theme.textSecondary }]} numberOfLines={1}>
                      {topic.name}{weak ? ` · ${st!.bestWrong} fallo${st!.bestWrong === 1 ? '' : 's'}` : ''}
                    </Text>
                  </View>
                  {weak
                    ? <Ionicons name="refresh" size={16} color={theme.orange} />
                    : <Ionicons name="play" size={16} color={topic.colorHex} />}
                </TouchableOpacity>
              );
            })}
            <Text style={[s.planHint, { color: theme.textTertiary }]}>
              {pending.length} lecciones por dominar · te quedan {Math.max(1, days)} día{days === 1 ? '' : 's'}
            </Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {activeLesson && (
        <QuizModal
          visible
          questions={activeLesson.lesson.questions}
          title={activeLesson.lesson.title}
          onClose={() => setActiveLesson(null)}
          onComplete={(_xp, _perfect, bestCombo, wrongCount) => {
            completeLesson(activeLesson.lesson.id, activeLesson.topic.id, activeLesson.lesson.questions.length, wrongCount ?? 0, bestCombo);
            setActiveLesson(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}

function Header({ onBack, theme, onClear }: { onBack: () => void; theme: ReturnType<typeof useTheme>; onClear?: () => void }) {
  return (
    <View style={[s.header, { borderBottomColor: theme.border }]}>
      <TouchableOpacity onPress={onBack} hitSlop={12} style={s.headerBtn}>
        <Ionicons name="chevron-back" size={24} color={theme.textPrimary} />
      </TouchableOpacity>
      <Text style={[s.headerTitle, { color: theme.textPrimary }]}>Plan de estudio</Text>
      {onClear ? (
        <TouchableOpacity onPress={onClear} hitSlop={12} style={s.headerBtn}>
          <Ionicons name="pencil" size={18} color={theme.textSecondary} />
        </TouchableOpacity>
      ) : <View style={s.headerBtn} />}
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 8, paddingVertical: 10, borderBottomWidth: 0.5,
  },
  headerBtn: { width: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  content: { padding: 16, gap: 14 },

  setupHero: { borderRadius: 22, padding: 24, alignItems: 'center', gap: 8, ...SHADOWS.medium },
  setupHeroTitle: { color: '#fff', fontSize: 22, fontWeight: '900', textAlign: 'center' },
  setupHeroSub: { color: 'rgba(255,255,255,0.92)', fontSize: 13, textAlign: 'center' },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9 },
  chipTxt: { fontSize: 13, fontWeight: '700' },
  stepperCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, borderWidth: 1, padding: 14 },
  stepBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  stepDays: { fontSize: 20, fontWeight: '900' },
  stepDate: { fontSize: 13, marginTop: 2 },
  cta: { padding: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaTxt: { color: '#fff', fontSize: 17, fontWeight: '800' },

  countHero: { borderRadius: 22, padding: 22, alignItems: 'center', gap: 2, ...SHADOWS.medium },
  countBig: { color: '#fff', fontSize: 52, fontWeight: '900', lineHeight: 58 },
  countLbl: { color: 'rgba(255,255,255,0.95)', fontSize: 14, fontWeight: '600' },
  countDate: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 6 },

  card: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 8 },
  readyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  readyLabel: { fontSize: 15, fontWeight: '700' },
  readyPct: { fontSize: 18, fontWeight: '900' },
  progBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progFill: { height: 8, borderRadius: 4 },
  readySub: { fontSize: 12 },

  sectionTitle: { fontSize: 16, fontWeight: '700' },
  doneTitle: { fontSize: 16, fontWeight: '800' },
  doneSub: { fontSize: 12, textAlign: 'center', lineHeight: 17 },
  lessonCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, borderWidth: 1, padding: 12 },
  lessonIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  lessonTitle: { fontSize: 14, fontWeight: '700' },
  lessonSub: { fontSize: 12, marginTop: 2 },
  planHint: { fontSize: 11, textAlign: 'center', marginTop: 2 },
});
