import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Modal,
} from 'react-native';
import { useStore, getLeagueInfo } from '../store/useStore';
import { COLORS, SHADOWS } from '../theme';
import QuizModal from '../components/QuizModal';

export default function HomeScreen() {
  const user = useStore(s => s.user);
  const topics = useStore(s => s.topics);
  const dailyChallenge = useStore(s => s.dailyChallenge);
  const completeDailyChallenge = useStore(s => s.completeDailyChallenge);
  const getExamQuestions = useStore(s => s.getExamQuestions);
  const progressForTopic = useStore(s => s.progressForTopic);
  const addXP = useStore(s => s.addXP);

  const [dailyQuizOpen, setDailyQuizOpen] = useState(false);
  const [examOpen, setExamOpen] = useState(false);
  const [examQuestions, setExamQuestions] = useState<any[]>([]);

  const league = getLeagueInfo(user.league);

  const motivational = () => {
    if (user.streak === 0) return 'Empieza tu racha hoy 🔥';
    if (user.streak < 3) return `¡Llevas ${user.streak} día${user.streak > 1 ? 's' : ''} seguido!`;
    if (user.streak < 7) return `¡Racha de ${user.streak} días! 🔥`;
    return `¡Increíble racha de ${user.streak} días! 🏆`;
  };

  const recentTopics = topics.slice(0, 4);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>¡Hola, {user.name}! {user.avatarEmoji}</Text>
            <Text style={s.subGreeting}>{motivational()}</Text>
          </View>
          <View style={s.streakBadge}>
            <Text style={s.fireEmoji}>🔥</Text>
            <Text style={s.streakNum}>{user.streak}</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          <StatCard icon="⭐" label="XP Total" value={`${user.xp}`} />
          <StatCard icon="❤️" label="Vidas" value={`${user.hearts}/${user.maxHearts}`} />
          <StatCard icon={league.emoji} label="Liga" value={user.league} color={league.color} />
        </View>

        {/* XP progress */}
        <View style={[s.card, { padding: 16 }]}>
          <View style={s.xpRow}>
            <Text style={s.xpLabel}>Nivel {Math.floor(user.xp / 100) + 1}</Text>
            <Text style={s.xpLabel}>{user.xp % 100}/100 XP</Text>
          </View>
          <View style={s.xpBarBg}>
            <View style={[s.xpBarFill, { width: `${user.xp % 100}%` }]} />
          </View>
        </View>

        {/* Daily challenge */}
        {dailyChallenge && (
          <TouchableOpacity
            style={[s.card, s.dailyCard, dailyChallenge.isCompleted && s.dailyDone]}
            onPress={() => { if (!dailyChallenge.isCompleted) setDailyQuizOpen(true); }}
            activeOpacity={0.85}
          >
            <View style={[s.dailyIcon, { backgroundColor: dailyChallenge.isCompleted ? COLORS.correct : COLORS.yellow }]}>
              <Text style={{ fontSize: 26 }}>{dailyChallenge.isCompleted ? '✅' : '⚡'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.dailyTitle}>Reto Diario</Text>
              <Text style={s.dailySub}>
                {dailyChallenge.isCompleted
                  ? `¡Completado! +${dailyChallenge.xpReward} XP`
                  : `${dailyChallenge.questions.length} preguntas · +${dailyChallenge.xpReward} XP`}
              </Text>
            </View>
            {!dailyChallenge.isCompleted && <Text style={s.chevron}>›</Text>}
          </TouchableOpacity>
        )}

        {/* Recent topics */}
        <Text style={s.sectionTitle}>Seguir estudiando</Text>
        <View style={s.topicsGrid}>
          {recentTopics.map(topic => {
            const prog = progressForTopic(topic.id);
            return (
              <View key={topic.id} style={[s.topicMini, SHADOWS.small]}>
                <View style={s.topicMiniTop}>
                  <Text style={{ fontSize: 24 }}>{topic.emoji}</Text>
                  {prog >= 1 && <Text>✅</Text>}
                </View>
                <Text style={s.topicMiniName} numberOfLines={2}>{topic.name}</Text>
                <View style={s.miniBarBg}>
                  <View style={[s.miniBarFill, { width: `${prog * 100}%`, backgroundColor: topic.colorHex }]} />
                </View>
                <Text style={s.topicMiniPct}>{Math.round(prog * 100)}%</Text>
              </View>
            );
          })}
        </View>

        {/* Examen simulado */}
        <TouchableOpacity
          style={[s.card, s.examCard]}
          onPress={() => { setExamQuestions(getExamQuestions()); setExamOpen(true); }}
          activeOpacity={0.85}
        >
          <View style={s.examIcon}><Text style={{ fontSize: 26 }}>📋</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.examTitle}>Examen Simulado</Text>
            <Text style={s.examSub}>30 preguntas · Estilo DGT real</Text>
          </View>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Daily Quiz Modal */}
      {dailyChallenge && (
        <QuizModal
          visible={dailyQuizOpen}
          questions={dailyChallenge.questions}
          title="Reto Diario"
          onClose={() => setDailyQuizOpen(false)}
          onComplete={(xp, _perfect) => { completeDailyChallenge(); setDailyQuizOpen(false); }}
        />
      )}

      {/* Exam Modal */}
      <QuizModal
        visible={examOpen}
        questions={examQuestions}
        title="Examen Simulado"
        isExam
        onClose={() => setExamOpen(false)}
        onComplete={(xp, _perfect) => { addXP(xp); setExamOpen(false); }}
      />
    </SafeAreaView>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color?: string }) {
  return (
    <View style={[sc.card, SHADOWS.small]}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <Text style={[sc.value, color ? { color } : {}]}>{value}</Text>
      <Text style={sc.label}>{label}</Text>
    </View>
  );
}

const sc = StyleSheet.create({
  card: { flex: 1, backgroundColor: COLORS.card, borderRadius: 14, padding: 12, alignItems: 'center', gap: 4 },
  value: { fontSize: 15, fontWeight: '700', color: COLORS.dark },
  label: { fontSize: 11, color: COLORS.secondary },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, gap: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  greeting: { fontSize: 20, fontWeight: '800', color: COLORS.dark },
  subGreeting: { fontSize: 13, color: COLORS.secondary, marginTop: 2 },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.orange + '20', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
  },
  fireEmoji: { fontSize: 18 },
  streakNum: { fontSize: 18, fontWeight: '800', color: COLORS.orange },
  statsRow: { flexDirection: 'row', gap: 10 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, ...SHADOWS.small },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  xpLabel: { fontSize: 13, fontWeight: '600', color: COLORS.secondary },
  xpBarBg: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  xpBarFill: { height: 8, backgroundColor: COLORS.yellow, borderRadius: 4 },
  dailyCard: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  dailyDone: { opacity: 0.7 },
  dailyIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  dailyTitle: { fontSize: 15, fontWeight: '700', color: COLORS.dark },
  dailySub: { fontSize: 13, color: COLORS.secondary, marginTop: 2 },
  chevron: { fontSize: 22, color: COLORS.secondary },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.dark, marginTop: 4 },
  topicsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  topicMini: {
    width: '47%', backgroundColor: COLORS.card, borderRadius: 14, padding: 14, gap: 6,
  },
  topicMiniTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topicMiniName: { fontSize: 13, fontWeight: '700', color: COLORS.dark, lineHeight: 18 },
  miniBarBg: { height: 5, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  miniBarFill: { height: 5, borderRadius: 3 },
  topicMiniPct: { fontSize: 11, color: COLORS.secondary },
  examCard: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  examIcon: {
    width: 52, height: 52, borderRadius: 12, backgroundColor: COLORS.primary + '15',
    alignItems: 'center', justifyContent: 'center',
  },
  examTitle: { fontSize: 15, fontWeight: '700', color: COLORS.dark },
  examSub: { fontSize: 13, color: COLORS.secondary, marginTop: 2 },
});
