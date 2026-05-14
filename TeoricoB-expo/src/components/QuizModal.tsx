import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  SafeAreaView, ScrollView, Animated, Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Question } from '../types';
import { COLORS, SHADOWS } from '../theme';
import { useStore } from '../store/useStore';

interface Props {
  visible: boolean;
  questions: Question[];
  title: string;
  isExam?: boolean;
  onClose: () => void;
  onComplete: (xpEarned: number, perfect: boolean) => void;
}

type AnswerState = 'idle' | 'correct' | 'wrong' | 'dimmed';

export default function QuizModal({ visible, questions, title, isExam, onClose, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [done, setDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const user = useStore(s => s.user);
  const recordAnswer = useStore(s => s.recordAnswer);
  const loseHeart = useStore(s => s.loseHeart);
  const buyHeartWithGems = useStore(s => s.buyHeartWithGems);
  const minutesToNextHeart = useStore(s => s.minutesToNextHeart);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<any>(null);

  // Runtime hearts count (starts from user.hearts at quiz start)
  const [currentHearts, setCurrentHearts] = useState(user.hearts);
  const [showNoHearts, setShowNoHearts] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setIndex(0); setSelected(null); setShowFeedback(false);
    setCorrect(false); setCorrectCount(0); setWrongCount(0);
    setDone(false); setElapsed(0);
    setCurrentHearts(user.hearts);
    setShowNoHearts(false);
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [visible]);

  useEffect(() => {
    if (!questions.length) return;
    Animated.spring(progressAnim, {
      toValue: (index + 1) / questions.length,
      useNativeDriver: false,
      tension: 50,
    }).start();
  }, [index, questions.length]);

  if (!questions.length) return null;

  // No hearts screen (shown at quiz start if hearts = 0)
  if (visible && currentHearts <= 0 && !done && index === 0 && selected === null) {
    const mins = minutesToNextHeart();
    return (
      <Modal visible={visible} animationType="slide">
        <SafeAreaView style={nh.safe}>
          <View style={nh.content}>
            <Text style={nh.emoji}>💔</Text>
            <Text style={nh.title}>Sin vidas</Text>
            <Text style={nh.sub}>
              Necesitas al menos una vida para estudiar.{'\n'}
              Las vidas se recuperan automáticamente.
            </Text>

            <View style={nh.card}>
              <Text style={nh.cardTitle}>⏱️ Próxima vida en</Text>
              <Text style={nh.timer}>{mins} min</Text>
            </View>

            {user.gems >= 10 && (
              <TouchableOpacity
                style={nh.gemBtn}
                onPress={() => { buyHeartWithGems(); setCurrentHearts(v => v + 1); setShowNoHearts(false); }}
              >
                <Text style={nh.gemBtnTxt}>💎 Usar 10 gemas para 1 vida</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={nh.closeBtn} onPress={onClose}>
              <Text style={nh.closeBtnTxt}>Volver</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  const q = questions[index];

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const selectAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = idx === q.correctIndex;
    setCorrect(isCorrect);
    recordAnswer(isCorrect);

    if (isCorrect) {
      setCorrectCount(c => c + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setWrongCount(w => w + 1);
      const newHearts = currentHearts - 1;
      setCurrentHearts(newHearts);
      loseHeart();
      shake();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setShowFeedback(true);
    Animated.spring(feedbackAnim, { toValue: 1, useNativeDriver: true, tension: 80 }).start();
  };

  const next = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    feedbackAnim.setValue(0);

    // Block if no hearts (except in exam mode where we allow 3 errors)
    if (!isExam && currentHearts <= 0) {
      clearInterval(timerRef.current);
      setDone(true);
      return;
    }

    if (index < questions.length - 1) {
      setIndex(i => i + 1);
      setSelected(null);
      setShowFeedback(false);
      setCorrect(false);
    } else {
      clearInterval(timerRef.current);
      setDone(true);
    }
  };

  const xpEarned = correctCount * 10 + (wrongCount === 0 ? 20 : 0) + (elapsed < questions.length * 8 ? 10 : 0);
  const perfect = wrongCount === 0 && index === questions.length - 1;
  const examPassed = isExam ? wrongCount <= 3 : null;

  const answerState = (idx: number): AnswerState => {
    if (selected === null) return 'idle';
    if (idx === q.correctIndex) return 'correct';
    if (idx === selected) return 'wrong';
    return 'dimmed';
  };

  const LETTERS = ['A', 'B', 'C', 'D'];

  // ── Result screen ──────────────────────────────────────────
  if (done) {
    const answered = correctCount + wrongCount;
    const pct = answered > 0 ? Math.round((correctCount / answered) * 100) : 0;
    const grade = pct >= 90 ? 'Sobresaliente' : pct >= 70 ? 'Notable' : pct >= 50 ? 'Aprobado' : 'Necesitas repasar';
    const gradeEmoji = pct >= 90 ? '🌟' : pct >= 70 ? '⭐' : pct >= 50 ? '👍' : '📚';
    const noHeartsEarly = !isExam && currentHearts <= 0 && index < questions.length - 1;

    return (
      <Modal visible={visible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
          <ScrollView contentContainerStyle={rs.content}>
            <LinearGradient
              colors={noHeartsEarly ? ['#EF476F22', '#EF476F00'] : perfect ? ['#06D6A022', '#06D6A000'] : ['#FFD16622', '#FFD16600']}
              style={rs.gradientTop}
            />
            <Text style={rs.bigEmoji}>{noHeartsEarly ? '💔' : gradeEmoji}</Text>
            <Text style={rs.resultTitle}>
              {noHeartsEarly ? 'Se acabaron las vidas' : isExam ? (examPassed ? '¡Examen Superado!' : 'Examen No Superado') : (perfect ? '¡Lección Perfecta!' : '¡Completado!')}
            </Text>

            {noHeartsEarly && (
              <Text style={rs.noHeartsMsg}>Has respondido {answered} preguntas antes de quedarte sin vidas.</Text>
            )}
            {isExam && (
              <Text style={[rs.examResult, { color: examPassed ? COLORS.correct : COLORS.wrong }]}>
                {examPassed ? '✅ Habrías aprobado el teórico real' : `❌ ${wrongCount} errores (máx. 3 permitidos)`}
              </Text>
            )}

            <View style={rs.statsBox}>
              <StatRow label="✅ Correctas"  value={`${correctCount}/${answered}`}     color={COLORS.correct} />
              <StatRow label="❌ Fallos"      value={`${wrongCount}`}                   color={wrongCount > 0 ? COLORS.wrong : COLORS.secondary} />
              <StatRow label="📊 Porcentaje" value={`${pct}%`} />
              {!noHeartsEarly && <StatRow label="🏅 Nota" value={`${grade} ${gradeEmoji}`} />}
              <StatRow label="⭐ XP ganados" value={`+${xpEarned} XP`}                color={COLORS.yellow} />
            </View>

            <TouchableOpacity style={rs.btn} onPress={() => onComplete(xpEarned, perfect)} activeOpacity={0.85}>
              <LinearGradient colors={[COLORS.primary, '#C62828']} style={rs.btnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={rs.btnText}>Continuar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  }

  // ── Quiz screen ─────────────────────────────────────────────
  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={qs.safe}>
        {/* Header */}
        <View style={qs.header}>
          <TouchableOpacity onPress={onClose} style={qs.closeBtn}>
            <Text style={{ fontSize: 16, color: COLORS.secondary, fontWeight: '700' }}>✕</Text>
          </TouchableOpacity>

          {/* Hearts */}
          <View style={qs.hearts}>
            {Array.from({ length: user.maxHearts }).map((_, i) => (
              <Text key={i} style={[qs.heart, i >= currentHearts && qs.heartEmpty]}>❤️</Text>
            ))}
          </View>

          <Text style={qs.counter}>{index + 1}/{questions.length}</Text>
        </View>

        {/* Progress */}
        <View style={qs.progressBg}>
          <Animated.View style={[qs.progressFill, {
            width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
          }]} />
        </View>

        <ScrollView contentContainerStyle={qs.body} showsVerticalScrollIndicator={false}>
          {/* Question */}
          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            <Text style={qs.question}>{q.text}</Text>
          </Animated.View>

          {/* Options */}
          <View style={qs.options}>
            {q.options.map((opt, idx) => {
              const state = answerState(idx);
              return (
                <TouchableOpacity
                  key={idx}
                  style={[qs.option, optStyle(state)]}
                  onPress={() => selectAnswer(idx)}
                  disabled={selected !== null}
                  activeOpacity={0.8}
                >
                  <View style={[qs.optLetter, optLetterStyle(state)]}>
                    <Text style={[qs.optLetterTxt, state === 'correct' && { color: COLORS.correct }, state === 'wrong' && { color: COLORS.wrong }]}>
                      {state === 'correct' ? '✓' : state === 'wrong' ? '✗' : LETTERS[idx]}
                    </Text>
                  </View>
                  <Text style={[qs.optText, state === 'dimmed' && { opacity: 0.4 }]} numberOfLines={4}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Feedback */}
          {showFeedback && (
            <Animated.View style={[qs.feedback, { backgroundColor: correct ? COLORS.correct + '14' : COLORS.wrong + '14' }, { opacity: feedbackAnim, transform: [{ scale: feedbackAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }] }]}>
              <View style={[qs.feedbackBar, { backgroundColor: correct ? COLORS.correct : COLORS.wrong }]} />
              <View style={{ flex: 1 }}>
                <Text style={[qs.feedbackTitle, { color: correct ? COLORS.correct : COLORS.wrong }]}>
                  {correct ? `¡Correcto! +10 XP` : `Incorrecto ${!isExam && currentHearts <= 0 ? '· Sin vidas' : ''}`}
                </Text>
                <Text style={qs.feedbackExp}>{q.explanation}</Text>
                {!correct && (
                  <Text style={qs.feedbackCorrect}>Respuesta: <Text style={{ color: COLORS.correct, fontWeight: '700' }}>{q.correctAnswer}</Text></Text>
                )}
              </View>
            </Animated.View>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Continue button */}
        {showFeedback && (
          <View style={qs.footer}>
            <TouchableOpacity onPress={next} activeOpacity={0.85}>
              <LinearGradient
                colors={correct ? [COLORS.correct, '#00897B'] : [COLORS.wrong, '#C62828']}
                style={qs.continueBtn}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Text style={qs.continueTxt}>
                  {!isExam && currentHearts <= 0 ? 'Ver resultado' :
                    index === questions.length - 1 ? 'Ver resultado' : 'Continuar →'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: COLORS.border }}>
      <Text style={{ color: COLORS.secondary, fontSize: 14 }}>{label}</Text>
      <Text style={{ fontWeight: '700', fontSize: 14, color: color ?? COLORS.dark }}>{value}</Text>
    </View>
  );
}

const optStyle = (s: AnswerState) => ({
  borderColor: s === 'correct' ? COLORS.correct : s === 'wrong' ? COLORS.wrong : COLORS.border,
  borderWidth: s === 'idle' ? 1.5 : 2.5,
  backgroundColor: s === 'correct' ? COLORS.correct + '12' : s === 'wrong' ? COLORS.wrong + '12' : s === 'dimmed' ? '#F8F8F8' : COLORS.card,
  shadowColor: s === 'idle' ? '#000' : 'transparent',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: s === 'idle' ? 0.05 : 0,
  shadowRadius: 4,
  elevation: s === 'idle' ? 2 : 0,
});
const optLetterStyle = (s: AnswerState) => ({
  borderColor: s === 'correct' ? COLORS.correct : s === 'wrong' ? COLORS.wrong : COLORS.border,
  backgroundColor: s === 'idle' ? COLORS.bg : s === 'correct' ? COLORS.correct + '20' : s === 'wrong' ? COLORS.wrong + '20' : 'transparent',
  borderWidth: 1.5,
});

const nh = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  emoji: { fontSize: 72 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.dark },
  sub: { fontSize: 15, color: COLORS.secondary, textAlign: 'center', lineHeight: 22 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 20, alignItems: 'center', width: '100%', ...SHADOWS.small },
  cardTitle: { fontSize: 14, color: COLORS.secondary, marginBottom: 4 },
  timer: { fontSize: 36, fontWeight: '800', color: COLORS.primary },
  gemBtn: { backgroundColor: '#7B1FA2', borderRadius: 14, padding: 16, width: '100%', alignItems: 'center' },
  gemBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  closeBtn: { borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border, padding: 14, width: '100%', alignItems: 'center' },
  closeBtnTxt: { color: COLORS.secondary, fontSize: 15, fontWeight: '600' },
});

const rs = StyleSheet.create({
  content: { flexGrow: 1, padding: 24, paddingTop: 40, alignItems: 'center', gap: 12 },
  gradientTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
  bigEmoji: { fontSize: 80, marginBottom: 8 },
  resultTitle: { fontSize: 26, fontWeight: '800', color: COLORS.dark, textAlign: 'center' },
  noHeartsMsg: { fontSize: 14, color: COLORS.secondary, textAlign: 'center' },
  examResult: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  statsBox: { width: '100%', backgroundColor: COLORS.card, borderRadius: 18, padding: 16, ...SHADOWS.small },
  btn: { width: '100%', borderRadius: 16, overflow: 'hidden', marginTop: 8 },
  btnGrad: { padding: 18, alignItems: 'center', borderRadius: 16 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
});

const qs = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, backgroundColor: COLORS.card, borderBottomWidth: 1, borderColor: COLORS.border },
  closeBtn: { padding: 8, backgroundColor: COLORS.bg, borderRadius: 20, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  hearts: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 4 },
  heart: { fontSize: 18 },
  heartEmpty: { opacity: 0.2 },
  counter: { fontSize: 13, fontWeight: '700', color: COLORS.secondary, minWidth: 36, textAlign: 'right' },
  progressBg: { height: 6, backgroundColor: COLORS.border, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: COLORS.primary, borderRadius: 3 },
  body: { padding: 20, gap: 14 },
  question: { fontSize: 20, fontWeight: '700', color: COLORS.dark, textAlign: 'center', lineHeight: 30, marginVertical: 12, paddingHorizontal: 4 },
  options: { gap: 10 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, backgroundColor: COLORS.card },
  optLetter: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  optLetterTxt: { fontSize: 14, fontWeight: '800', color: COLORS.secondary },
  optText: { flex: 1, fontSize: 15, color: COLORS.dark, lineHeight: 21 },
  feedback: { flexDirection: 'row', borderRadius: 14, padding: 14, gap: 10, marginTop: 4 },
  feedbackBar: { width: 4, borderRadius: 2, alignSelf: 'stretch' },
  feedbackTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  feedbackExp: { fontSize: 13, color: COLORS.secondary, lineHeight: 20 },
  feedbackCorrect: { fontSize: 13, color: COLORS.secondary, marginTop: 6 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 16, backgroundColor: COLORS.bg, borderTopWidth: 1, borderColor: COLORS.border },
  continueBtn: { borderRadius: 16, padding: 17, alignItems: 'center' },
  continueTxt: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
});
