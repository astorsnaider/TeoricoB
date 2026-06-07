/**
 * StatsScreen — análisis personal del estudio.
 *
 * Muestra:
 *  - Resumen global (precisión, exámenes superados, tiempo total)
 *  - Precisión por tema (con barra) y temas débiles
 *  - Historial de exámenes (últimos 10) con fecha, nota y tiempo
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../store/useStore';
import { useTheme } from '../hooks/useTheme';
import { SHADOWS } from '../theme';
import SwipeBack from '../components/SwipeBack';

// Mapeo de categoría de pregunta a tema visual (color e icono)
const CATEGORY_META: Record<string, { name: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  señales:       { name: 'Señales',           color: '#E63946', icon: 'warning-outline' },
  velocidades:   { name: 'Velocidades',       color: '#FF9800', icon: 'speedometer-outline' },
  preferencia:   { name: 'Preferencia',       color: '#4CAF50', icon: 'git-merge-outline' },
  alcohol:       { name: 'Alcohol y drogas',  color: '#9C27B0', icon: 'wine-outline' },
  distancias:    { name: 'Distancias',        color: '#2196F3', icon: 'resize-outline' },
  auxilios:      { name: 'Primeros auxilios', color: '#F44336', icon: 'medkit-outline' },
  vehiculo:      { name: 'El vehículo',       color: '#607D8B', icon: 'car-outline' },
  medioambiente: { name: 'Conducción eficiente', color: '#8BC34A', icon: 'leaf-outline' },
  infracciones:  { name: 'Infracciones',      color: '#FF5722', icon: 'alert-circle-outline' },
  vias:          { name: 'La vía',            color: '#455A64', icon: 'map-outline' },
};

interface Props { onBack: () => void; }

export default function StatsScreen({ onBack }: Props) {
  const user = useStore(s => s.user);
  const theme = useTheme();

  const overallAcc = user.totalAnswered > 0
    ? Math.round((user.totalCorrect / user.totalAnswered) * 100)
    : 0;

  const examHistory = user.examHistory ?? [];
  const passedExams = examHistory.filter(e => e.passed).length;
  const totalExams  = examHistory.length;
  const bestExam = examHistory.reduce<typeof examHistory[0] | null>((best, e) => {
    if (!best) return e;
    return e.correctCount > best.correctCount ? e : best;
  }, null);

  // Ordenar topicStats por accuracy para detectar temas débiles
  const topicStatsArr = Object.entries(user.topicStats ?? {})
    .filter(([_, s]) => s.total >= 3) // mínimo 3 respuestas para considerarlo
    .map(([cat, s]) => {
      const acc = s.total > 0 ? (s.correct / s.total) * 100 : 0;
      return { category: cat, ...s, accuracy: acc };
    })
    .sort((a, b) => b.accuracy - a.accuracy);

  const weakTopics = [...topicStatsArr]
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3)
    .filter(t => t.accuracy < 80);

  const totalStudyTimeSec = examHistory.reduce((sum, e) => sum + e.timeElapsed, 0);
  const totalStudyMin = Math.floor(totalStudyTimeSec / 60);

  return (
    <SwipeBack onBack={onBack}>
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Ionicons name="arrow-back" size={16} color={theme.primary} />
          <Text style={[s.backTxt, { color: theme.primary }]}>Perfil</Text>
        </TouchableOpacity>

        {/* Hero */}
        <LinearGradient colors={['#1A237E', '#283593']} style={s.hero}>
          <Ionicons name="stats-chart" size={36} color="#fff" />
          <Text style={s.heroTitle}>Tus estadísticas</Text>
          <Text style={s.heroSub}>Análisis de tu progreso y rendimiento</Text>
        </LinearGradient>

        {/* Resumen global */}
        <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>Resumen global</Text>
        <View style={s.statsGrid}>
          <StatCard theme={theme} icon="stats-chart" color={theme.correct} label="Acierto medio" value={`${overallAcc}%`} />
          <StatCard theme={theme} icon="help-circle" color={theme.blue} label="Respuestas" value={`${user.totalAnswered}`} />
          <StatCard theme={theme} icon="trophy" color={theme.yellow} label="Exámenes aprobados" value={`${passedExams}/${totalExams}`} />
          <StatCard theme={theme} icon="time" color={theme.orange} label="Tiempo total" value={`${totalStudyMin} min`} />
        </View>

        {/* Mejor examen */}
        {bestExam && (
          <View style={[s.bestExamCard, { backgroundColor: theme.card, borderColor: theme.correct + '40' }]}>
            <View style={[s.bestIcon, { backgroundColor: theme.correct + '20' }]}>
              <Ionicons name="ribbon" size={22} color={theme.correct} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.bestLabel, { color: theme.textSecondary }]}>Tu mejor examen</Text>
              <Text style={[s.bestValue, { color: theme.textPrimary }]}>
                {bestExam.correctCount}/{bestExam.totalQuestions} correctas
                <Text style={{ color: theme.textSecondary, fontSize: 14, fontWeight: '500' }}>
                  {' · '}{Math.floor(bestExam.timeElapsed / 60)}:{(bestExam.timeElapsed % 60).toString().padStart(2, '0')}
                </Text>
              </Text>
            </View>
          </View>
        )}

        {/* Temas débiles */}
        {weakTopics.length > 0 && (
          <>
            <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>Temas a reforzar</Text>
            <View style={[s.weakBox, { backgroundColor: theme.wrong + '10', borderColor: theme.wrong + '30' }]}>
              <View style={s.weakHeader}>
                <Ionicons name="alert-circle" size={18} color={theme.wrong} />
                <Text style={[s.weakTitle, { color: theme.wrong }]}>Aquí estás flojo</Text>
              </View>
              {weakTopics.map(t => {
                const meta = CATEGORY_META[t.category] ?? { name: t.category, color: theme.wrong, icon: 'help' as const };
                return (
                  <View key={t.category} style={s.weakItem}>
                    <Ionicons name={meta.icon} size={16} color={meta.color} />
                    <Text style={[s.weakName, { color: theme.textPrimary }]}>{meta.name}</Text>
                    <Text style={[s.weakAcc, { color: theme.wrong }]}>{Math.round(t.accuracy)}%</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Precisión por tema */}
        {topicStatsArr.length > 0 && (
          <>
            <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>Precisión por tema</Text>
            <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {topicStatsArr.map((t, i) => {
                const meta = CATEGORY_META[t.category] ?? { name: t.category, color: theme.textSecondary, icon: 'help' as const };
                return (
                  <View key={t.category} style={[s.topicRow, i < topicStatsArr.length - 1 && { borderBottomColor: theme.border, borderBottomWidth: 0.5 }]}>
                    <View style={[s.topicIconBox, { backgroundColor: meta.color + '20' }]}>
                      <Ionicons name={meta.icon} size={16} color={meta.color} />
                    </View>
                    <View style={{ flex: 1, gap: 4 }}>
                      <View style={s.topicHeader}>
                        <Text style={[s.topicName, { color: theme.textPrimary }]}>{meta.name}</Text>
                        <Text style={[s.topicCount, { color: theme.textSecondary }]}>{t.correct}/{t.total}</Text>
                      </View>
                      <View style={[s.barBg, { backgroundColor: theme.bg2 }]}>
                        <View style={[s.barFill, { width: `${t.accuracy}%`, backgroundColor: meta.color }]} />
                      </View>
                    </View>
                    <Text style={[s.topicAcc, { color: meta.color }]}>{Math.round(t.accuracy)}%</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Historial de exámenes */}
        {examHistory.length > 0 && (
          <>
            <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>Historial de exámenes ({examHistory.length})</Text>
            <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {examHistory.slice(0, 10).map((e, i) => {
                const d = new Date(e.date);
                const dateStr = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`;
                const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                const mm = Math.floor(e.timeElapsed / 60);
                const ss = (e.timeElapsed % 60).toString().padStart(2, '0');
                return (
                  <View key={i} style={[s.examRow, i < Math.min(9, examHistory.length - 1) && { borderBottomColor: theme.border, borderBottomWidth: 0.5 }]}>
                    <View style={[s.examIcon, { backgroundColor: (e.passed ? theme.correct : theme.wrong) + '20' }]}>
                      <Ionicons name={e.passed ? 'checkmark' : 'close'} size={16} color={e.passed ? theme.correct : theme.wrong} />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={[s.examDate, { color: theme.textPrimary }]}>{dateStr} <Text style={{ color: theme.textTertiary }}>· {timeStr}</Text></Text>
                      <Text style={[s.examMeta, { color: theme.textSecondary }]}>
                        {e.correctCount}/{e.totalQuestions} aciertos · {mm}:{ss}
                      </Text>
                    </View>
                    <View style={[s.examBadge, { backgroundColor: (e.passed ? theme.correct : theme.wrong) + '20' }]}>
                      <Text style={[s.examBadgeTxt, { color: e.passed ? theme.correct : theme.wrong }]}>
                        {e.passed ? 'APROBADO' : 'SUSPENSO'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Empty state */}
        {topicStatsArr.length === 0 && examHistory.length === 0 && (
          <View style={[s.emptyBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="hourglass-outline" size={42} color={theme.textTertiary} />
            <Text style={[s.emptyTitle, { color: theme.textPrimary }]}>Aún sin datos</Text>
            <Text style={[s.emptySub, { color: theme.textSecondary }]}>
              Responde algunas preguntas y haz un examen simulado para ver tus estadísticas detalladas aquí.
            </Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
    </SwipeBack>
  );
}

function StatCard({ theme, icon, color, label, value }: {
  theme: ReturnType<typeof useTheme>;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
  value: string;
}) {
  return (
    <View style={[sc.box, { backgroundColor: theme.card, borderColor: theme.border }, SHADOWS.small]}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[sc.value, { color: theme.textPrimary }]}>{value}</Text>
      <Text style={[sc.label, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

const sc = StyleSheet.create({
  box: { flex: 1, minWidth: '47%', borderRadius: 14, padding: 14, borderWidth: 1, alignItems: 'flex-start', gap: 6 },
  value: { fontSize: 22, fontWeight: '800' },
  label: { fontSize: 11, fontWeight: '600' },
});

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 12 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  backTxt: { fontSize: 15, fontWeight: '600' },
  hero: { borderRadius: 18, padding: 22, alignItems: 'center', gap: 6 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  heroSub: { fontSize: 13, color: '#ffffffCC' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 6 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bestExamCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14, borderWidth: 1.5 },
  bestIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  bestLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  bestValue: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  weakBox: { borderRadius: 14, padding: 14, borderWidth: 1, gap: 8 },
  weakHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  weakTitle: { fontSize: 13, fontWeight: '800' },
  weakItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  weakName: { flex: 1, fontSize: 13 },
  weakAcc: { fontSize: 13, fontWeight: '800' },
  card: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  topicRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  topicIconBox: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  topicHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  topicName: { fontSize: 13, fontWeight: '600' },
  topicCount: { fontSize: 11 },
  barBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
  topicAcc: { fontSize: 14, fontWeight: '800', minWidth: 42, textAlign: 'right' },
  examRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  examIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  examDate: { fontSize: 13, fontWeight: '700' },
  examMeta: { fontSize: 11 },
  examBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  examBadgeTxt: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  emptyBox: { borderRadius: 14, padding: 32, alignItems: 'center', gap: 8, borderWidth: 1 },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptySub: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
});
