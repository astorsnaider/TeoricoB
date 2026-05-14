import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../store/useStore';
import { COLORS, SHADOWS } from '../theme';
import { Topic, Lesson } from '../types';
import { TopicIcon } from '../components/TopicIcon';
import QuizModal from '../components/QuizModal';

export default function LearnScreen() {
  const topics = useStore(s => s.topics);
  const progressForTopic = useStore(s => s.progressForTopic);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  if (selectedTopic) {
    return <TopicDetail topic={selectedTopic} onBack={() => setSelectedTopic(null)} />;
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <Text style={s.title}>Aprender</Text>
        <Text style={s.subtitle}>Elige un tema para empezar</Text>

        {topics.map(topic => {
          const prog = progressForTopic(topic.id);
          const done = prog >= 1;
          return (
            <TouchableOpacity
              key={topic.id}
              style={[s.topicCard, SHADOWS.small]}
              onPress={() => setSelectedTopic(topic)}
              activeOpacity={0.85}
            >
              {/* Icon */}
              <View style={[s.iconBox, { backgroundColor: topic.colorHex + '18' }]}>
                <TopicIcon topicId={topic.id} size={52} />
              </View>

              <View style={{ flex: 1, gap: 5 }}>
                <View style={s.topicRow}>
                  <Text style={s.topicName}>{topic.name}</Text>
                  {done
                    ? <Text style={s.doneBadge}>✅ Completo</Text>
                    : <Text style={[s.pctBadge, { color: topic.colorHex, backgroundColor: topic.colorHex + '18' }]}>{Math.round(prog * 100)}%</Text>}
                </View>
                <Text style={s.topicDesc} numberOfLines={1}>{topic.description}</Text>
                <View style={s.progBg}>
                  <View style={[s.progFill, { width: `${prog * 100}%`, backgroundColor: topic.colorHex }]} />
                </View>
                <Text style={s.topicMeta}>
                  {topic.lessons.length} lecciones · {topic.lessons.reduce((a, l) => a + l.questions.length, 0)} preguntas
                </Text>
              </View>
              <Text style={[s.arrow, { color: topic.colorHex }]}>›</Text>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function TopicDetail({ topic, onBack }: { topic: Topic; onBack: () => void }) {
  const isLessonCompleted = useStore(s => s.isLessonCompleted);
  const completeLesson = useStore(s => s.completeLesson);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Text style={s.backTxt}>‹ Todos los temas</Text>
        </TouchableOpacity>

        {/* Header gradient */}
        <LinearGradient colors={[topic.colorHex + '30', topic.colorHex + '08']} style={s.topicHeader}>
          <TopicIcon topicId={topic.id} size={64} />
          <Text style={[s.topicHeaderName, { color: topic.colorHex }]}>{topic.name}</Text>
          <Text style={s.topicHeaderDesc}>{topic.description}</Text>
          <View style={s.topicHeaderStats}>
            <View style={s.statChip}>
              <Text style={s.statChipTxt}>📚 {topic.lessons.length} lecciones</Text>
            </View>
            <View style={s.statChip}>
              <Text style={s.statChipTxt}>❓ {topic.lessons.reduce((a, l) => a + l.questions.length, 0)} preguntas</Text>
            </View>
          </View>
        </LinearGradient>

        <Text style={s.lessonsSectionTitle}>Lecciones</Text>

        {topic.lessons.map((lesson, idx) => {
          const done = isLessonCompleted(lesson.id);
          return (
            <TouchableOpacity
              key={lesson.id}
              style={[s.lessonCard, SHADOWS.small, done && { borderLeftWidth: 4, borderLeftColor: topic.colorHex }]}
              onPress={() => setActiveLesson(lesson)}
              activeOpacity={0.85}
            >
              <View style={[s.lessonNum, { backgroundColor: done ? topic.colorHex : COLORS.bg }]}>
                <Text style={[s.lessonNumTxt, done && { color: '#fff' }]}>{done ? '✓' : `${idx + 1}`}</Text>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={s.lessonTitle}>{lesson.title}</Text>
                <Text style={s.lessonSub}>{lesson.subtitle}</Text>
                <View style={s.lessonMeta}>
                  <View style={[s.diffBadge, { backgroundColor: diffColor(lesson.difficulty) + '20' }]}>
                    <Text style={[s.diffTxt, { color: diffColor(lesson.difficulty) }]}>{lesson.difficulty}</Text>
                  </View>
                  <Text style={s.lessonQCount}>{lesson.questions.length} preguntas</Text>
                </View>
              </View>
              <Text style={[s.arrow, { color: topic.colorHex }]}>{done ? '↺' : '▶'}</Text>
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
          onComplete={(xp, perfect) => {
            completeLesson(activeLesson.id, topic.id, xp, perfect);
            setActiveLesson(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const diffColor = (d: string) =>
  d === 'Básico' ? '#4CAF50' : d === 'Intermedio' ? '#FF9800' : '#F44336';

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, gap: 12 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.dark },
  subtitle: { fontSize: 14, color: COLORS.secondary, marginBottom: 4 },
  topicCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.card, borderRadius: 18, padding: 16 },
  iconBox: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  topicRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topicName: { fontSize: 15, fontWeight: '700', color: COLORS.dark, flex: 1, marginRight: 8 },
  pctBadge: { fontSize: 11, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  doneBadge: { fontSize: 11, fontWeight: '700', color: COLORS.correct },
  topicDesc: { fontSize: 12, color: COLORS.secondary },
  progBg: { height: 5, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  progFill: { height: 5, borderRadius: 3 },
  topicMeta: { fontSize: 11, color: COLORS.secondary },
  arrow: { fontSize: 22 },
  backBtn: { marginBottom: 8 },
  backTxt: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
  topicHeader: { borderRadius: 20, padding: 24, alignItems: 'center', gap: 8, marginBottom: 8 },
  topicHeaderName: { fontSize: 22, fontWeight: '800' },
  topicHeaderDesc: { fontSize: 13, color: COLORS.secondary, textAlign: 'center' },
  topicHeaderStats: { flexDirection: 'row', gap: 10, marginTop: 4 },
  statChip: { backgroundColor: '#00000010', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  statChipTxt: { fontSize: 12, color: COLORS.dark, fontWeight: '600' },
  lessonsSectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.dark },
  lessonCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.card, borderRadius: 16, padding: 16 },
  lessonNum: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  lessonNumTxt: { fontSize: 15, fontWeight: '800', color: COLORS.secondary },
  lessonTitle: { fontSize: 15, fontWeight: '700', color: COLORS.dark },
  lessonSub: { fontSize: 12, color: COLORS.secondary },
  lessonMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  diffBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  diffTxt: { fontSize: 11, fontWeight: '700' },
  lessonQCount: { fontSize: 11, color: COLORS.secondary },
});
