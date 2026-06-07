import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../store/useStore';
import { useTheme } from '../hooks/useTheme';
import { SHADOWS } from '../theme';
import { Topic, Lesson } from '../types';
import { TopicIcon } from '../components/TopicIcon';
import QuizModal from '../components/QuizModal';
import SwipeBack from '../components/SwipeBack';
import { useSoundEffect } from '../audio/useSoundEffect';

export default function LearnScreen() {
  const topics = useStore(s => s.topics);
  const progressForTopic = useStore(s => s.progressForTopic);
  const theme = useTheme();
  const playSound = useSoundEffect();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  if (selectedTopic) {
    return <TopicDetail topic={selectedTopic} onBack={() => setSelectedTopic(null)} />;
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <Text style={[s.title, { color: theme.textPrimary }]}>Aprender</Text>
        <Text style={[s.subtitle, { color: theme.textSecondary }]}>Selecciona un tema para estudiar</Text>

        {topics.map(topic => {
          const prog = progressForTopic(topic.id);
          return (
            <TouchableOpacity
              key={topic.id}
              style={[s.topicCard, { backgroundColor: theme.card, borderColor: theme.border }, SHADOWS.small]}
              onPress={() => { playSound('tap'); setSelectedTopic(topic); }}
              activeOpacity={0.85}
            >
              <View style={[s.iconBox, { backgroundColor: topic.colorHex + '18' }]}>
                <TopicIcon topicId={topic.id} size={52} />
              </View>
              <View style={{ flex: 1, gap: 5 }}>
                <View style={s.topicRow}>
                  <Text style={[s.topicName, { color: theme.textPrimary }]}>{topic.name}</Text>
                  {prog >= 1
                    ? <Ionicons name="checkmark-circle" size={18} color={theme.correct} />
                    : <Text style={[s.pctBadge, { color: topic.colorHex, backgroundColor: topic.colorHex + '18' }]}>{Math.round(prog * 100)}%</Text>}
                </View>
                <Text style={[s.topicDesc, { color: theme.textSecondary }]} numberOfLines={1}>{topic.description}</Text>
                <View style={[s.progBg, { backgroundColor: theme.bg2 }]}>
                  <View style={[s.progFill, { width: `${prog * 100}%`, backgroundColor: topic.colorHex }]} />
                </View>
                <Text style={[s.topicMeta, { color: theme.textTertiary }]}>
                  {topic.lessons.length} lecciones · {topic.lessons.reduce((a, l) => a + l.questions.length, 0)} preguntas
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function TopicDetail({ topic, onBack }: { topic: Topic; onBack: () => void }) {
  const lessonStats = useStore(s => s.user.lessonStats);
  const completeLesson = useStore(s => s.completeLesson);
  const theme = useTheme();
  const playSound = useSoundEffect();
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const diffColor = (d: string) =>
    d === 'Básico' ? '#4CAF50' : d === 'Intermedio' ? '#FF9800' : '#F44336';

  return (
    <SwipeBack onBack={onBack}>
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Ionicons name="arrow-back" size={16} color={theme.primary} />
          <Text style={[s.backTxt, { color: theme.primary }]}>Todos los temas</Text>
        </TouchableOpacity>

        <LinearGradient colors={[topic.colorHex + '28', topic.colorHex + '06']} style={s.topicHeader}>
          <TopicIcon topicId={topic.id} size={64} />
          <Text style={[s.topicHeaderName, { color: topic.colorHex }]}>{topic.name}</Text>
          <Text style={[s.topicHeaderDesc, { color: theme.textSecondary }]}>{topic.description}</Text>
          <View style={s.headerStats}>
            <View style={[s.statChip, { backgroundColor: '#00000012' }]}>
              <Ionicons name="book-outline" size={12} color={theme.textPrimary} />
              <Text style={[s.statChipTxt, { color: theme.textPrimary }]}>{topic.lessons.length} lecciones</Text>
            </View>
            <View style={[s.statChip, { backgroundColor: '#00000012' }]}>
              <Ionicons name="help-circle-outline" size={12} color={theme.textPrimary} />
              <Text style={[s.statChipTxt, { color: theme.textPrimary }]}>{topic.lessons.reduce((a, l) => a + l.questions.length, 0)} preguntas</Text>
            </View>
          </View>
        </LinearGradient>

        <Text style={[s.lessonsSectionTitle, { color: theme.textPrimary }]}>Lecciones</Text>
        {topic.lessons.map((lesson, idx) => {
          const stats = lessonStats?.[lesson.id];
          const status: 'todo' | 'wrong' | 'perfect' =
            !stats ? 'todo' : stats.bestWrong === 0 ? 'perfect' : 'wrong';
          const accentColor = status === 'perfect' ? theme.correct : status === 'wrong' ? theme.orange : null;
          return (
            <TouchableOpacity
              key={lesson.id}
              style={[
                s.lessonCard, { backgroundColor: theme.card, borderColor: theme.border },
                accentColor && { borderLeftWidth: 4, borderLeftColor: accentColor },
                SHADOWS.small,
              ]}
              onPress={() => { playSound('tap'); setActiveLesson(lesson); }}
              activeOpacity={0.85}
            >
              <View style={[s.lessonNum, { backgroundColor: accentColor ?? theme.bg2 }]}>
                {status === 'perfect'
                  ? <Ionicons name="checkmark" size={18} color="#fff" />
                  : status === 'wrong'
                    ? <Text style={{ color: '#fff', fontSize: 13, fontWeight: '800' }}>{stats!.bestWrong}</Text>
                    : <Text style={[s.lessonNumTxt, { color: theme.textSecondary }]}>{idx + 1}</Text>
                }
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[s.lessonTitle, { color: theme.textPrimary }]}>{lesson.title}</Text>
                <Text style={[s.lessonSub, { color: theme.textSecondary }]}>{lesson.subtitle}</Text>
                <View style={s.lessonMeta}>
                  <Text style={[s.diffBadge, { color: diffColor(lesson.difficulty), backgroundColor: diffColor(lesson.difficulty) + '18' }]}>
                    {lesson.difficulty}
                  </Text>
                  <Text style={[s.lessonQCount, { color: theme.textTertiary }]}>
                    {lesson.questions.length} preguntas
                    {status === 'wrong' && ` · ${stats!.bestWrong} fallo${stats!.bestWrong === 1 ? '' : 's'}`}
                  </Text>
                </View>
              </View>
              <Ionicons name={status !== 'todo' ? 'refresh' : 'play'} size={16} color={topic.colorHex} />
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>

      {activeLesson && (
        <QuizModal
          visible
          questions={activeLesson.questions}
          title={activeLesson.title}
          onClose={() => setActiveLesson(null)}
          onComplete={(_xp, _perfect, bestCombo, wrongCount) => {
            completeLesson(activeLesson.id, topic.id, activeLesson.questions.length, wrongCount ?? 0, bestCombo);
            setActiveLesson(null);
          }}
        />
      )}
    </SafeAreaView>
    </SwipeBack>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 12 },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 13 },
  topicCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 18, padding: 16, borderWidth: 1 },
  iconBox: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  topicRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topicName: { fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
  pctBadge: { fontSize: 11, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  topicDesc: { fontSize: 12 },
  progBg: { height: 5, borderRadius: 3, overflow: 'hidden' },
  progFill: { height: 5, borderRadius: 3 },
  topicMeta: { fontSize: 11 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  backTxt: { fontSize: 15, fontWeight: '600' },
  topicHeader: { borderRadius: 20, padding: 22, alignItems: 'center', gap: 8 },
  topicHeaderName: { fontSize: 20, fontWeight: '800' },
  topicHeaderDesc: { fontSize: 13, textAlign: 'center' },
  headerStats: { flexDirection: 'row', gap: 10, marginTop: 4 },
  statChip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  statChipTxt: { fontSize: 12, fontWeight: '600' },
  lessonsSectionTitle: { fontSize: 16, fontWeight: '700' },
  lessonCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 16, padding: 16, borderWidth: 1 },
  lessonNum: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  lessonNumTxt: { fontSize: 15, fontWeight: '800' },
  lessonTitle: { fontSize: 15, fontWeight: '700' },
  lessonSub: { fontSize: 12 },
  lessonMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  diffBadge: { fontSize: 10, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  lessonQCount: { fontSize: 11 },
});
