import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTabResetEffect } from '../components/PagerControl';
import { Lesson, Topic } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore, getLeagueInfo } from '../store/useStore';
import { useTheme } from '../hooks/useTheme';
import { SHADOWS } from '../theme';
import { AvatarView } from '../components/AvatarView';
import { TopicIcon } from '../components/TopicIcon';
import QuizModal from '../components/QuizModal';
import { useSoundEffect } from '../audio/useSoundEffect';
import { Modal } from 'react-native';
import ExamListScreen from './ExamListScreen';

export default function HomeScreen() {
  const user = useStore(s => s.user);
  const topics = useStore(s => s.topics);
  const dailyChallenge = useStore(s => s.dailyChallenge);
  const dailyQuests = useStore(s => s.dailyQuests);
  const generateDailyQuests = useStore(s => s.generateDailyQuests);
  const claimQuestReward = useStore(s => s.claimQuestReward);
  const completeDailyChallenge = useStore(s => s.completeDailyChallenge);
  const getExamQuestions = useStore(s => s.getExamQuestions);
  const getMistakeQuestions = useStore(s => s.getMistakeQuestions);
  const mistakeCount = useStore(s => s.mistakeCount);
  const completeLesson = useStore(s => s.completeLesson);
  const canBuyStreakFreeze = useStore(s => s.canBuyStreakFreeze);
  const buyStreakFreeze = useStore(s => s.buyStreakFreeze);
  const isStreakFrozen = useStore(s => s.isStreakFrozen);
  const progressForTopic = useStore(s => s.progressForTopic);
  const addXP = useStore(s => s.addXP);
  const theme = useTheme();
  const playSound = useSoundEffect();

  const [dailyOpen, setDailyOpen] = useState(false);
  const [examListOpen, setExamListOpen] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [practiceQs, setPracticeQs] = useState<any[]>([]);
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickQs, setQuickQs] = useState<any[]>([]);
  const [activeRecLesson, setActiveRecLesson] = useState<{ topic: Topic; lesson: Lesson } | null>(null);

  const startReview = () => {
    const qs = getMistakeQuestions(10);
    if (qs.length === 0) return;
    playSound('tap');
    setPracticeQs(qs);
    setPracticeOpen(true);
  };

  const startQuickExam = () => {
    playSound('tap');
    setQuickQs(getExamQuestions(10));
    setQuickOpen(true);
  };
  // Seed que cambia cada vez que se entra al tab Inicio para que las
  // recomendaciones se rebajeren al volver.
  const [recSeed, setRecSeed] = useState(() => Math.random());

  const scrollRef = useRef<ScrollView>(null);
  useTabResetEffect('home', useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    setRecSeed(Math.random());
  }, []));

  useEffect(() => {
    generateDailyQuests();
  }, [generateDailyQuests]);

  const league = getLeagueInfo(user.league);
  const level = Math.floor(user.xp / 100) + 1;
  const xpPct = (user.xp % 100) / 100;
  const mistakesTotal = mistakeCount();
  const streakFrozen = isStreakFrozen();
  const canFreeze = canBuyStreakFreeze();
  const freezeUsefull = user.streak >= 1; // si no tienes racha, no tiene sentido congelarla
  const freezeDisabled = streakFrozen || !canFreeze || !freezeUsefull;
  // Horas restantes del freeze activo
  const freezeHoursLeft = streakFrozen && user.streakFreezeActiveUntil
    ? Math.max(1, Math.ceil((new Date(user.streakFreezeActiveUntil).getTime() - Date.now()) / 3600000))
    : 0;
  // Estado del bloque Daily Quests
  const allQuestsClaimed = !!dailyQuests && dailyQuests.quests.every(q => q.claimed);

  const streakMsg =
    user.streak === 0 ? 'Empieza tu racha hoy' :
    user.streak < 3   ? `${user.streak} día${user.streak > 1 ? 's' : ''} seguido` :
    user.streak < 7   ? `Racha de ${user.streak} días` :
                        `Racha increíble: ${user.streak} días`;

  // Recomendaciones: 2 lecciones de temas flojos + 2 aleatorias entre las
  // que aún no se han hecho perfectas. Se rebajeran al entrar al tab.
  const recommendations: { topic: Topic; lesson: Lesson; weak: boolean }[] = useMemo(() => {
    const lessonStats = user.lessonStats ?? {};
    const topicStats = user.topicStats ?? {};
    const open = topics.flatMap(t =>
      t.lessons
        .filter(l => {
          const st = lessonStats[l.id];
          return !st || st.bestWrong > 0;
        })
        .map(l => ({ topic: t, lesson: l }))
    );
    if (open.length === 0) return [];

    const weakTopicIds = new Set(
      topics
        .filter(t => {
          const s = topicStats[t.id];
          return s && s.total >= 5 && s.correct / s.total < 0.7;
        })
        .map(t => t.id)
    );

    // Shuffle determinista por recSeed para evitar saltos entre renders
    const rngShuffle = <T,>(arr: T[]): T[] => {
      const out = [...arr];
      let r = recSeed;
      for (let i = out.length - 1; i > 0; i--) {
        r = (r * 9301 + 49297) % 233280;
        const j = Math.floor((r / 233280) * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    };

    const weak = rngShuffle(open.filter(o => weakTopicIds.has(o.topic.id))).slice(0, 2);
    const weakIds = new Set(weak.map(w => w.lesson.id));
    const others = rngShuffle(open.filter(o => !weakIds.has(o.lesson.id))).slice(0, 4 - weak.length);
    return [
      ...weak.map(w => ({ ...w, weak: true })),
      ...others.map(o => ({ ...o, weak: false })),
    ];
  }, [topics, user.lessonStats, user.topicStats, recSeed]);

  return (
    <SafeAreaView edges={['top']} style={[s.safe, { backgroundColor: theme.bg }]}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

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

        {dailyQuests && (
          <View style={[s.card, { backgroundColor: theme.card }]}>
            <View style={s.sectionHeader}>
              <Text style={[s.dailyTitle, { color: theme.textPrimary }]}>Misiones de hoy</Text>
              {allQuestsClaimed ? (
                <View style={s.questsDoneBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={theme.correct} />
                  <Text style={[s.questsDoneTxt, { color: theme.correct }]}>Completadas</Text>
                </View>
              ) : (
                <Ionicons name="diamond" size={16} color="#9C27B0" />
              )}
            </View>
            <View style={s.questList}>
              {dailyQuests.quests.map(quest => {
                const done = quest.progress >= quest.goal;
                const pct = Math.min(1, quest.progress / quest.goal);
                return (
                  <View key={quest.id} style={[s.questRow, { borderColor: theme.border, backgroundColor: theme.bg2 }]}>
                    <Text style={s.questEmoji}>{quest.emoji}</Text>
                    <View style={{ flex: 1, gap: 5 }}>
                      <View style={s.questTop}>
                        <Text style={[s.questLabel, { color: theme.textPrimary }]} numberOfLines={1}>{quest.label}</Text>
                        <Text style={[s.questReward, { color: '#9C27B0' }]}>+{quest.rewardGems}</Text>
                      </View>
                      <View style={[s.questBarBg, { backgroundColor: theme.border }]}>
                        <View style={[s.questBarFill, { width: `${pct * 100}%`, backgroundColor: done ? theme.correct : theme.primary }]} />
                      </View>
                    </View>
                    {quest.claimed ? (
                      <Ionicons name="checkmark-circle" size={22} color={theme.correct} />
                    ) : done ? (
                      <TouchableOpacity
                        style={[s.claimBtn, { backgroundColor: theme.correct }]}
                        onPress={() => { if (claimQuestReward(quest.id)) playSound('achievement'); }}
                      >
                        <Text style={s.claimTxt}>Cobrar</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={[s.questProgress, { color: theme.textSecondary }]}>{quest.progress}/{quest.goal}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Tarjeta destacada de fallos por repasar */}
        {mistakesTotal > 0 && (
          <TouchableOpacity
            style={[s.reviewCard, { backgroundColor: theme.wrong + '14', borderColor: theme.wrong + '40' }]}
            onPress={startReview}
            activeOpacity={0.85}
          >
            <View style={[s.reviewIcon, { backgroundColor: theme.wrong + '22' }]}>
              <Ionicons name="refresh-circle" size={26} color={theme.wrong} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.reviewTitle, { color: theme.textPrimary }]}>
                Tienes {mistakesTotal} fallo{mistakesTotal === 1 ? '' : 's'} por repasar
              </Text>
              <Text style={[s.reviewSub, { color: theme.textSecondary }]}>
                Repásalos para que no se te vuelvan a escapar.
              </Text>
            </View>
            <View style={[s.reviewBtn, { backgroundColor: theme.wrong }]}>
              <Text style={s.reviewBtnTxt}>Repasar</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={s.utilityGrid}>
          <TouchableOpacity
            style={[s.utilityCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={startQuickExam}
            activeOpacity={0.85}
          >
            <View style={[s.utilityIcon, { backgroundColor: theme.primary + '18' }]}>
              <Ionicons name="timer-outline" size={24} color={theme.primary} />
            </View>
            <Text style={[s.utilityTitle, { color: theme.textPrimary }]}>Examen rápido</Text>
            <Text style={[s.utilitySub, { color: theme.textSecondary }]}>
              10 preguntas · 5 min
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.utilityCard, { backgroundColor: theme.card, borderColor: theme.border }, freezeDisabled && !streakFrozen && { opacity: 0.55 }]}
            disabled={freezeDisabled}
            onPress={() => {
              if (buyStreakFreeze()) playSound('achievement');
            }}
            activeOpacity={0.85}
          >
            <View style={[s.utilityIcon, { backgroundColor: theme.blue + '18' }]}>
              <Ionicons name={streakFrozen ? 'shield-checkmark' : 'shield-outline'} size={24} color={theme.blue} />
            </View>
            <Text style={[s.utilityTitle, { color: theme.textPrimary }]}>Streak Freeze</Text>
            <Text style={[s.utilitySub, { color: theme.textSecondary }]}>
              {streakFrozen
                ? `Activo · ${freezeHoursLeft}h restantes`
                : !freezeUsefull
                  ? 'Necesitas racha activa'
                  : canFreeze
                    ? 'Comprar por 30 💎'
                    : user.gems < 30 ? 'Faltan gemas' : 'Límite mensual'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lecciones recomendadas */}
        {recommendations.length > 0 && (
          <>
            <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>Seguir estudiando</Text>
            <View style={s.topicsGrid}>
              {recommendations.map(({ topic, lesson, weak }) => {
                const stats = user.lessonStats?.[lesson.id];
                return (
                  <TouchableOpacity
                    key={lesson.id}
                    style={[s.topicCard, { backgroundColor: theme.card }, SHADOWS.small]}
                    onPress={() => { playSound('tap'); setActiveRecLesson({ topic, lesson }); }}
                    activeOpacity={0.85}
                  >
                    <TopicIcon topicId={topic.id} size={36} />
                    <Text style={[s.topicName, { color: theme.textPrimary }]} numberOfLines={2}>{lesson.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      {weak && <Ionicons name="trending-down" size={11} color={theme.orange} />}
                      <Text
                        style={[
                          s.topicPct,
                          { color: weak ? theme.orange : stats?.bestWrong ? theme.orange : theme.textSecondary },
                        ]}
                        numberOfLines={1}
                      >
                        {weak ? 'Punto débil' : stats?.bestWrong ? `${stats.bestWrong} fallo${stats.bestWrong === 1 ? '' : 's'}` : topic.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* Exam button */}
        <TouchableOpacity
          style={[s.card, s.examCard, { backgroundColor: theme.card }]}
          onPress={() => { playSound('tap'); setExamListOpen(true); }}
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
      <Modal
        visible={examListOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setExamListOpen(false)}
      >
        <ExamListScreen onClose={() => setExamListOpen(false)} />
      </Modal>
      <QuizModal
        visible={practiceOpen}
        questions={practiceQs}
        title="Repaso de fallos"
        isPractice
        onClose={() => setPracticeOpen(false)}
        onComplete={(xp) => { addXP(xp); setPracticeOpen(false); }}
      />
      <QuizModal
        visible={quickOpen}
        questions={quickQs}
        title="Examen rápido"
        isExam
        examTimeLimitSec={5 * 60}
        examMaxErrors={1}
        recordExamResult={false}
        onClose={() => setQuickOpen(false)}
        onComplete={() => setQuickOpen(false)}
      />
      {activeRecLesson && (
        <QuizModal
          visible
          questions={activeRecLesson.lesson.questions}
          title={activeRecLesson.lesson.title}
          onClose={() => setActiveRecLesson(null)}
          onComplete={(_xp, _perfect, bestCombo, wrongCount) => {
            completeLesson(
              activeRecLesson.lesson.id,
              activeRecLesson.topic.id,
              activeRecLesson.lesson.questions.length,
              wrongCount ?? 0,
              bestCombo,
            );
            setActiveRecLesson(null);
          }}
        />
      )}
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
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  questsDoneBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  questsDoneTxt: { fontSize: 11, fontWeight: '800' },
  questList: { gap: 8 },
  questRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, borderWidth: 1, padding: 10 },
  questEmoji: { fontSize: 20, width: 26, textAlign: 'center' },
  questTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  questLabel: { flex: 1, fontSize: 12, fontWeight: '700' },
  questReward: { fontSize: 11, fontWeight: '800' },
  questBarBg: { height: 5, borderRadius: 3, overflow: 'hidden' },
  questBarFill: { height: 5, borderRadius: 3 },
  questProgress: { minWidth: 34, fontSize: 11, fontWeight: '700', textAlign: 'right' },
  claimBtn: { borderRadius: 9, paddingHorizontal: 10, paddingVertical: 6 },
  claimTxt: { color: '#fff', fontSize: 11, fontWeight: '800' },
  utilityGrid: { flexDirection: 'row', gap: 10 },
  utilityCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 12, gap: 6, ...SHADOWS.small },
  utilityIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  utilityTitle: { fontSize: 13, fontWeight: '800' },
  utilitySub: { fontSize: 11, lineHeight: 15 },
  reviewCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, borderWidth: 1, padding: 14 },
  reviewIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  reviewTitle: { fontSize: 15, fontWeight: '800' },
  reviewSub: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  reviewBtn: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
  reviewBtnTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },
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
