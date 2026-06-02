import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore, getLeagueInfo } from '../store/useStore';
import { useTheme } from '../hooks/useTheme';
import { SHADOWS } from '../theme';
import { AvatarView } from '../components/AvatarView';
import { TopicIcon } from '../components/TopicIcon';
import QuizModal from '../components/QuizModal';
import { useSoundEffect } from '../audio/useSoundEffect';

export default function HomeScreen() {
  const user = useStore(s => s.user);
  const topics = useStore(s => s.topics);
  const dailyChallenge = useStore(s => s.dailyChallenge);
  const completeDailyChallenge = useStore(s => s.completeDailyChallenge);
  const getExamQuestions = useStore(s => s.getExamQuestions);
  const progressForTopic = useStore(s => s.progressForTopic);
  const addXP = useStore(s => s.addXP);
  const theme = useTheme();
  const playSound = useSoundEffect();

  const [dailyOpen, setDailyOpen] = useState(false);
  const [examOpen, setExamOpen] = useState(false);
  const [examQs, setExamQs] = useState<any[]>([]);

  const league = getLeagueInfo(user.league);
  const level = Math.floor(user.xp / 100) + 1;
  const xpPct = (user.xp % 100) / 100;

  const streakMsg =
    user.streak === 0 ? 'Empieza tu racha hoy' :
    user.streak < 3   ? `${user.streak} día${user.streak > 1 ? 's' : ''} seguido` :
    user.streak < 7   ? `Racha de ${user.streak} días` :
                        `Racha increíble: ${user.streak} días`;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* Header */}
        <View style={s.header}>
          <AvatarView color={user.avatarEmoji} name={user.name} size={46} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[s.greeting, { color: theme.textPrimary }]}>Hola, {user.name}</Text>
            <View style={s.streakRow}>
              <Ionicons name="flame" size={14} color={theme.orange} />
              <Text style={[s.streakTxt, { color: theme.textSecondary }]}>{streakMsg}</Text>
            </View>
          </View>
          <View style={[s.leaguePill, { backgroundColor: league.color + '18' }]}>
            <Text style={[s.leagueTxt, { color: league.color }]}>{league.emoji} {user.league}</Text>
          </View>
        </View>

        {/* XP + Level */}
        <View style={[s.card, { backgroundColor: theme.card }]}>
          <View style={s.xpRow}>
            <View style={s.xpLeft}>
              <Ionicons name="star" size={16} color={theme.yellow} />
              <Text style={[s.xpLbl, { color: theme.textSecondary }]}>Nivel {level}</Text>
            </View>
            <Text style={[s.xpVal, { color: theme.textPrimary }]}>{user.xp} XP total</Text>
          </View>
          <View style={[s.xpBarBg, { backgroundColor: theme.bg2 }]}>
            <LinearGradient
              colors={[theme.yellow, theme.orange]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[s.xpBarFill, { width: `${xpPct * 100}%` }]}
            />
          </View>
          <Text style={[s.xpSub, { color: theme.textSecondary }]}>{100 - (user.xp % 100)} XP para nivel {level + 1}</Text>
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          {[
            { icon: 'heart' as const, label: 'Vidas', value: `${user.hearts}/${user.maxHearts}`, color: theme.wrong },
            { icon: 'trophy' as const, label: 'Liga', value: user.league, color: league.color },
            { icon: 'stats-chart' as const, label: 'Acierto', value: user.totalAnswered > 0 ? `${Math.round(user.totalCorrect / user.totalAnswered * 100)}%` : '—', color: theme.correct },
          ].map(({ icon, label, value, color }) => (
            <View key={label} style={[s.statCard, { backgroundColor: theme.card }]}>
              <Ionicons name={icon} size={18} color={color} />
              <Text style={[s.statVal, { color: theme.textPrimary }]}>{value}</Text>
              <Text style={[s.statLbl, { color: theme.textSecondary }]}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Daily challenge */}
        {dailyChallenge && (
          <TouchableOpacity
            style={[s.card, s.dailyCard, { backgroundColor: theme.card }, dailyChallenge.isCompleted && { opacity: 0.7 }]}
            onPress={() => { if (!dailyChallenge.isCompleted) { playSound('tap'); setDailyOpen(true); } }}
            activeOpacity={0.85}
          >
            <View style={[s.dailyIcon, { backgroundColor: dailyChallenge.isCompleted ? theme.correct + '25' : theme.yellow + '25' }]}>
              <Ionicons
                name={dailyChallenge.isCompleted ? 'checkmark-circle' : 'flash'}
                size={28}
                color={dailyChallenge.isCompleted ? theme.correct : theme.yellow}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.dailyTitle, { color: theme.textPrimary }]}>Reto Diario</Text>
              <Text style={[s.dailySub, { color: theme.textSecondary }]}>
                {dailyChallenge.isCompleted
                  ? `Completado · +${dailyChallenge.xpReward} XP`
                  : `${dailyChallenge.questions.length} preguntas · +${dailyChallenge.xpReward} XP`}
              </Text>
            </View>
            {!dailyChallenge.isCompleted && (
              <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
            )}
          </TouchableOpacity>
        )}

        {/* Recent topics */}
        <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>Seguir estudiando</Text>
        <View style={s.topicsGrid}>
          {topics.slice(0, 4).map(topic => {
            const prog = progressForTopic(topic.id);
            return (
              <View key={topic.id} style={[s.topicCard, { backgroundColor: theme.card }, SHADOWS.small]}>
                <TopicIcon topicId={topic.id} size={40} />
                <Text style={[s.topicName, { color: theme.textPrimary }]} numberOfLines={2}>{topic.name}</Text>
                <View style={[s.miniBarBg, { backgroundColor: theme.bg2 }]}>
                  <View style={[s.miniBarFill, { width: `${prog * 100}%`, backgroundColor: topic.colorHex }]} />
                </View>
                <Text style={[s.topicPct, { color: theme.textSecondary }]}>{Math.round(prog * 100)}%</Text>
              </View>
            );
          })}
        </View>

        {/* Exam button */}
        <TouchableOpacity
          style={[s.card, s.examCard, { backgroundColor: theme.card }]}
          onPress={() => { playSound('tap'); setExamQs(getExamQuestions()); setExamOpen(true); }}
          activeOpacity={0.85}
        >
          <View style={[s.examIcon, { backgroundColor: theme.primary + '18' }]}>
            <Ionicons name="clipboard-outline" size={28} color={theme.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.examTitle, { color: theme.textPrimary }]}>Examen Simulado</Text>
            <Text style={[s.examSub, { color: theme.textSecondary }]}>30 preguntas · Criterios DGT reales</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>

      {dailyChallenge && (
        <QuizModal
          visible={dailyOpen}
          questions={dailyChallenge.questions}
          title="Reto Diario"
          onClose={() => setDailyOpen(false)}
          onComplete={() => { completeDailyChallenge(); setDailyOpen(false); }}
        />
      )}
      <QuizModal
        visible={examOpen}
        questions={examQs}
        title="Examen Simulado"
        isExam
        onClose={() => setExamOpen(false)}
        onComplete={(xp) => { addXP(xp); setExamOpen(false); }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  greeting: { fontSize: 18, fontWeight: '700' },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  streakTxt: { fontSize: 12 },
  leaguePill: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  leagueTxt: { fontSize: 12, fontWeight: '700' },
  card: { borderRadius: 16, padding: 16, ...SHADOWS.small },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  xpLeft: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  xpLbl: { fontSize: 13, fontWeight: '600' },
  xpVal: { fontSize: 13, fontWeight: '700' },
  xpBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  xpBarFill: { height: 8, borderRadius: 4 },
  xpSub: { fontSize: 11, marginTop: 5 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', gap: 4, ...SHADOWS.small },
  statVal: { fontSize: 14, fontWeight: '800' },
  statLbl: { fontSize: 10 },
  dailyCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  dailyIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dailyTitle: { fontSize: 15, fontWeight: '700' },
  dailySub: { fontSize: 12, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  topicsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  topicCard: { width: '47%', borderRadius: 14, padding: 14, gap: 6 },
  topicName: { fontSize: 12, fontWeight: '700', lineHeight: 17 },
  miniBarBg: { height: 5, borderRadius: 3, overflow: 'hidden' },
  miniBarFill: { height: 5, borderRadius: 3 },
  topicPct: { fontSize: 11 },
  examCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  examIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  examTitle: { fontSize: 15, fontWeight: '700' },
  examSub: { fontSize: 12, marginTop: 2 },
});
