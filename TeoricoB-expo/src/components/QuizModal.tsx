import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  SafeAreaView, ScrollView, Animated, Platform, Share,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Question } from '../types';
import { useStore } from '../store/useStore';
import { useTheme } from '../hooks/useTheme';
import { SHADOWS } from '../theme';
import { TrafficSign } from './TrafficSign';
import { TrafficScene } from './TrafficScene';
import { getChapterIdForCategory, getChapterLabel } from '../legal/manualLinks';
import { useSoundEffect } from '../audio/useSoundEffect';
import { shuffleQuestion } from '../utils/shuffleQuestion';
import ManualChapterModal from './ManualChapterModal';
import ConfettiBurst from './ConfettiBurst';

interface Props {
  visible: boolean;
  questions: Question[];
  title: string;
  isExam?: boolean;
  isPractice?: boolean;
  onClose: () => void;
  onComplete: (xpEarned: number, perfect: boolean, bestCombo?: number, wrongCount?: number) => void;
}

type AnswerState = 'idle' | 'correct' | 'wrong' | 'dimmed';

const EXAM_TIME_LIMIT_SEC = 30 * 60; // 30 minutos (formato DGT)
const EXAM_MAX_ERRORS = 3;
const NORMAL_XP_PER_CORRECT = 10;
const PRACTICE_XP_PER_CORRECT = 5;
type AnswerRecord = { qIndex: number; selectedIndex: number; isCorrect: boolean };

export default function QuizModal({ visible, questions, title, isExam, isPractice, onClose, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [done, setDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [currentHearts, setCurrentHearts] = useState(5);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [showReview, setShowReview] = useState(false);
  // Preguntas barajadas (opciones aleatorias) — se regenera al abrir el modal
  const [shuffled, setShuffled] = useState<Question[]>([]);
  // Capítulo del manual abierto como overlay sobre el quiz (al pulsar "Ampliar en el Manual")
  const [openManualChapter, setOpenManualChapter] = useState<string | null>(null);
  // Confeti y animación del trofeo en la pantalla de resultados.
  const [resultBurst, setResultBurst] = useState(0);
  const trophyScale = useRef(new Animated.Value(0.4)).current;
  const trophyOpacity = useRef(new Animated.Value(0)).current;

  const user = useStore(s => s.user);
  const recordAnswer = useStore(s => s.recordAnswer);
  const loseHeart = useStore(s => s.loseHeart);
  const recordMistake = useStore(s => s.recordMistake);
  const registerMistakeRecovery = useStore(s => s.registerMistakeRecovery);
  const buyHeartWithGems = useStore(s => s.buyHeartWithGems);
  const minutesToNextHeart = useStore(s => s.minutesToNextHeart);
  const saveExamResult = useStore(s => s.saveExamResult);
  const soundsEnabled = useStore(s => s.soundsEnabled);
  const playSound = useSoundEffect();
  const theme = useTheme();
  const savedExamRef = useRef(false);
  const lastTimerTickRef = useRef<number | null>(null);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!visible) return;
    setIndex(0); setSelected(null); setShowFeedback(false);
    setCorrect(false); setCorrectCount(0); setWrongCount(0);
    setCombo(0); setBestCombo(0);
    setDone(false); setElapsed(0); setAnswers([]); setShowReview(false);
    setCurrentHearts(user.hearts);
    // Barajar opciones por pregunta (no mutar el array original)
    setShuffled(questions.map(shuffleQuestion));
    savedExamRef.current = false;
    lastTimerTickRef.current = null;
    timerRef.current = setInterval(() => {
      setElapsed(e => {
        const next = e + 1;
        // En examen: auto-end al llegar al tiempo limite
        if (isExam && next >= EXAM_TIME_LIMIT_SEC) {
          clearInterval(timerRef.current);
          setDone(true);
          return EXAM_TIME_LIMIT_SEC;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [visible, isExam, questions]);

  useEffect(() => {
    if (!visible || !isExam || done || !soundsEnabled) return;
    const remaining = Math.max(0, EXAM_TIME_LIMIT_SEC - elapsed);
    if (remaining > 0 && remaining <= 5 * 60 && remaining % 30 === 0 && lastTimerTickRef.current !== remaining) {
      lastTimerTickRef.current = remaining;
      playSound('tick');
    }
  }, [visible, isExam, done, elapsed, soundsEnabled]);

  useEffect(() => {
    if (!questions.length) return;
    Animated.spring(progressAnim, {
      toValue: (index + 1) / questions.length,
      useNativeDriver: false, tension: 50,
    }).start();
  }, [index, questions.length]);

  // Animación de entrada del trofeo + confeti en estados celebratorios.
  // Se dispara al pasar a `done = true`.
  useEffect(() => {
    if (!done) {
      trophyScale.setValue(0.4);
      trophyOpacity.setValue(0);
      return;
    }
    Animated.parallel([
      Animated.spring(trophyScale, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true }),
      Animated.timing(trophyOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
    const noHearts = !isExam && !isPractice && currentHearts <= 0 && index < questions.length - 1;
    const passed = isExam ? wrongCount <= EXAM_MAX_ERRORS : null;
    const perfectNow = wrongCount === 0 && index === questions.length - 1;
    const celebrating = !noHearts && (perfectNow || passed === true);
    if (celebrating) {
      setResultBurst(b => b + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    }
  }, [done]);

  if (!questions.length) return null;

  // No hearts screen
  if (visible && currentHearts <= 0 && !done && index === 0 && selected === null && !isExam && !isPractice) {
    const mins = minutesToNextHeart();
    return (
      <Modal visible={visible} animationType="slide">
        <SafeAreaView style={[nh.safe, { backgroundColor: theme.bg }]}>
          <View style={nh.content}>
            <View style={[nh.iconCircle, { backgroundColor: theme.wrong + '18' }]}>
              <Ionicons name="heart-dislike" size={48} color={theme.wrong} />
            </View>
            <Text style={[nh.title, { color: theme.textPrimary }]}>Sin vidas</Text>
            <Text style={[nh.sub, { color: theme.textSecondary }]}>
              Necesitas al menos una vida para estudiar.{'\n'}
              Las vidas se recuperan automáticamente cada 30 minutos.
            </Text>
            <View style={[nh.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="time-outline" size={20} color={theme.textSecondary} />
              <Text style={[nh.cardLabel, { color: theme.textSecondary }]}>Próxima vida en</Text>
              <Text style={[nh.timer, { color: theme.primary }]}>{mins} min</Text>
            </View>
            {user.gems >= 10 && (
              <TouchableOpacity
                style={[nh.gemBtn, { backgroundColor: '#7B1FA2' }]}
                onPress={() => { if (buyHeartWithGems()) setCurrentHearts(v => v + 1); }}
              >
                <Ionicons name="diamond" size={16} color="#fff" />
                <Text style={nh.gemBtnTxt}>Usar 10 gemas · +1 vida</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[nh.closeBtn, { borderColor: theme.border }]}
              onPress={onClose}
            >
              <Text style={[nh.closeBtnTxt, { color: theme.textSecondary }]}>Volver</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  // Usar la versión barajada si está lista; fallback al original en el primer render
  const q = shuffled[index] ?? questions[index];

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  };

  const selectAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = idx === q.correctIndex;
    setCorrect(isCorrect);
    recordAnswer(isCorrect, q.category);
    // Track de respuesta para la pantalla de repaso
    setAnswers(prev => [...prev, { qIndex: index, selectedIndex: idx, isCorrect }]);
    if (isCorrect) {
      setCorrectCount(c => c + 1);
      setCombo(c => {
        const nextCombo = c + 1;
        setBestCombo(best => Math.max(best, nextCombo));
        return nextCombo;
      });
      registerMistakeRecovery(q.id);
      playSound('correct');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setWrongCount(w => w + 1);
      setCombo(0);
      recordMistake(q.id, q.category);
      playSound('wrong');
      // En examen NO se pierden vidas (es solo un test)
      if (!isExam && !isPractice) {
        setCurrentHearts(h => Math.max(0, h - 1));
        loseHeart();
      }
      shake();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setShowFeedback(true);
    feedbackAnim.setValue(0);
    Animated.spring(feedbackAnim, { toValue: 1, useNativeDriver: true, tension: 80 }).start();
  };

  const next = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    feedbackAnim.setValue(0);
    if (!isExam && !isPractice && currentHearts <= 0) { clearInterval(timerRef.current); setDone(true); return; }
    // En examen: si ya he superado el máximo de errores, termino aquí
    if (isExam && wrongCount > EXAM_MAX_ERRORS) { clearInterval(timerRef.current); setDone(true); return; }
    if (index < questions.length - 1) {
      setIndex(i => i + 1); setSelected(null); setShowFeedback(false); setCorrect(false);
    } else {
      clearInterval(timerRef.current); setDone(true);
    }
  };

  const xpPerCorrect = isPractice ? PRACTICE_XP_PER_CORRECT : NORMAL_XP_PER_CORRECT;
  const xpEarned = correctCount * xpPerCorrect + (isPractice ? 0 : (wrongCount === 0 ? 20 : 0) + (elapsed < questions.length * 8 ? 10 : 0));
  const perfect = wrongCount === 0 && index === questions.length - 1;
  const examPassed = isExam ? wrongCount <= 3 : null;
  const noHeartsEarly = !isExam && !isPractice && currentHearts <= 0 && index < questions.length - 1;

  const answerState = (idx: number): AnswerState => {
    if (selected === null) return 'idle';
    if (idx === q.correctIndex) return 'correct';
    if (idx === selected) return 'wrong';
    return 'dimmed';
  };

  const LETTERS = ['A', 'B', 'C', 'D'];

  // ── Result screen ──────────────────────────────────────────────
  if (done) {
    const answered = correctCount + wrongCount;
    const pct = answered > 0 ? Math.round((correctCount / answered) * 100) : 0;
    const grade = pct >= 90 ? 'Sobresaliente' : pct >= 70 ? 'Notable' : pct >= 50 ? 'Aprobado' : 'Necesitas repasar';
    const resultIcon = noHeartsEarly ? 'heart-dislike' : perfect ? 'trophy' : examPassed === false ? 'close-circle' : 'checkmark-circle';
    const resultColor = noHeartsEarly ? theme.wrong : perfect ? theme.yellow : examPassed === false ? theme.wrong : theme.correct;
    const wrongAnswers = answers.filter(a => !a.isCorrect);
    const examTimeOut = isExam && elapsed >= EXAM_TIME_LIMIT_SEC && wrongCount <= EXAM_MAX_ERRORS;
    const examTooManyErrors = isExam && wrongCount > EXAM_MAX_ERRORS;
    const mmExam = Math.floor(elapsed / 60);
    const ssExam = elapsed % 60;

    // Guardar examen en historial una sola vez
    if (isExam && !savedExamRef.current) {
      savedExamRef.current = true;
      saveExamResult({
        date: new Date().toISOString(),
        totalQuestions: questions.length,
        correctCount,
        wrongCount,
        timeElapsed: elapsed,
        passed: !!examPassed,
      });
      playSound(examPassed ? 'examPass' : 'examFail');
    }

    // Pantalla de REPASO de fallos
    if (showReview) {
      return (
        <Modal visible={visible} animationType="slide">
          <SafeAreaView style={[rs.safe, { backgroundColor: theme.bg }]}>
            <View style={[qs.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
              <TouchableOpacity onPress={() => setShowReview(false)} style={[qs.closeBtn, { backgroundColor: theme.bg2 }]}>
                <Ionicons name="arrow-back" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
              <Text style={[qs.examCenter, { fontSize: 15, fontWeight: '700', color: theme.textPrimary, textAlign: 'center' }]}>
                Repaso de fallos
              </Text>
              <Text style={[qs.counter, { color: theme.textSecondary }]}>{wrongAnswers.length}</Text>
            </View>
            <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
              {wrongAnswers.length === 0 ? (
                <View style={{ padding: 32, alignItems: 'center' }}>
                  <Ionicons name="checkmark-circle" size={48} color={theme.correct} />
                  <Text style={{ marginTop: 12, fontSize: 16, fontWeight: '700', color: theme.textPrimary }}>¡Sin fallos!</Text>
                </View>
              ) : wrongAnswers.map((a, i) => {
                // Usar el shuffled para que selectedIndex coincida con lo que vio el user
                const q = shuffled[a.qIndex] ?? questions[a.qIndex];
                return (
                  <View key={i} style={{ backgroundColor: theme.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: theme.border, gap: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={{ backgroundColor: theme.wrong, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>Pregunta {a.qIndex + 1}</Text>
                      </View>
                      {q.legalRef && (
                        <Text style={{ fontSize: 11, color: theme.textTertiary, fontWeight: '600' }}>{q.legalRef}</Text>
                      )}
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textPrimary, lineHeight: 19 }}>{q.text}</Text>
                    <View style={{ borderLeftWidth: 3, borderLeftColor: theme.wrong, paddingLeft: 10, gap: 2 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: theme.wrong }}>TU RESPUESTA</Text>
                      <Text style={{ fontSize: 13, color: theme.textSecondary, textDecorationLine: 'line-through' }}>{q.options[a.selectedIndex]}</Text>
                    </View>
                    <View style={{ borderLeftWidth: 3, borderLeftColor: theme.correct, paddingLeft: 10, gap: 2 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: theme.correct }}>RESPUESTA CORRECTA</Text>
                      <Text style={{ fontSize: 13, color: theme.textPrimary, fontWeight: '700' }}>{q.options[q.correctIndex]}</Text>
                    </View>
                    <View style={{ backgroundColor: theme.bg2, borderRadius: 8, padding: 10 }}>
                      <Text style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 18 }}>{q.explanation}</Text>
                    </View>
                  </View>
                );
              })}
              <View style={{ height: 40 }} />
            </ScrollView>
          </SafeAreaView>
        </Modal>
      );
    }

    // Estado celebratorio: lección perfecta o examen aprobado.
    const celebrate = !noHeartsEarly && (perfect || examPassed === true);
    // Gradient del header según el estado.
    const heroGradient: [string, string] =
      noHeartsEarly       ? [theme.wrong, theme.wrong + 'CC'] :
      examTooManyErrors   ? [theme.wrong, theme.wrong + 'CC'] :
      examTimeOut         ? [theme.orange, theme.orange + 'CC'] :
      perfect             ? [theme.yellow, theme.orange] :
      examPassed === true ? [theme.correct, '#00897B'] :
                            [theme.primary, theme.primary + 'CC'];
    const heroTitle =
      noHeartsEarly       ? 'Sin vidas' :
      isExam              ? (examPassed ? '¡Examen aprobado!' : 'No esta vez') :
      perfect             ? '¡Lección perfecta!' :
                            grade;
    const heroSubtitle =
      noHeartsEarly       ? 'Espera a que se recarguen tus vidas para volver a intentarlo.' :
      examTimeOut         ? `Se acabó el tiempo con ${wrongCount} errores.` :
      examTooManyErrors   ? `${wrongCount} errores · Máx. permitido ${EXAM_MAX_ERRORS}.` :
      examPassed          ? 'Habrías aprobado el teórico real.' :
      perfect             ? `${correctCount}/${answered} aciertos · ¡Sin fallos!` :
                            `${correctCount}/${answered} aciertos`;
    const heroIcon =
      noHeartsEarly         ? 'heart-dislike' :
      examTooManyErrors     ? 'close-circle' :
      examTimeOut           ? 'time-outline' :
      celebrate             ? 'trophy' :
                              'checkmark-circle';

    const shareText = celebrate
      ? (isExam
          ? `Acabo de aprobar un examen DGT con ${correctCount}/${questions.length} en Teoric 🚗`
          : `Acabo de hacer una lección perfecta en Teoric: ${correctCount}/${questions.length} 🎯`)
      : `Estudiando para la DGT con Teoric: ${correctCount}/${questions.length} aciertos.`;

    const onShare = () => {
      Share.share({ message: shareText }).catch(() => undefined);
    };

    return (
      <Modal visible={visible} animationType="slide">
        <SafeAreaView style={[rs.safe, { backgroundColor: theme.bg }]}>
          {celebrate && <ConfettiBurst trigger={resultBurst} count={220} />}
          <ScrollView contentContainerStyle={rs.content}>
            {/* HERO */}
            <LinearGradient
              colors={heroGradient}
              style={rs.hero}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              <Animated.View
                style={[
                  rs.heroIconCircle,
                  { transform: [{ scale: trophyScale }], opacity: trophyOpacity },
                ]}
              >
                <Ionicons name={heroIcon} size={56} color="#fff" />
              </Animated.View>
              <Text style={rs.heroTitle}>{heroTitle}</Text>
              <Text style={rs.heroSub}>{heroSubtitle}</Text>
            </LinearGradient>

            {/* STAT TILES en 2 columnas */}
            <View style={rs.tileGrid}>
              <StatTile
                label="Aciertos"
                value={`${correctCount}/${answered}`}
                color={theme.correct}
                icon="checkmark"
                theme={theme}
              />
              <StatTile
                label={isExam ? 'Fallos' : 'Mejor combo'}
                value={isExam ? `${wrongCount}/${EXAM_MAX_ERRORS}` : `${bestCombo}`}
                color={isExam ? (wrongCount > EXAM_MAX_ERRORS ? theme.wrong : theme.textPrimary) : theme.orange}
                icon={isExam ? 'close' : 'flame'}
                theme={theme}
              />
              <StatTile
                label="Tiempo"
                value={`${mmExam}:${ssExam.toString().padStart(2, '0')}`}
                color={theme.blue}
                icon="time-outline"
                theme={theme}
              />
              <StatTile
                label={isExam ? 'Acierto' : 'XP ganada'}
                value={isExam ? `${pct}%` : `+${xpEarned}`}
                color={theme.yellow}
                icon={isExam ? 'stats-chart' : 'star'}
                theme={theme}
              />
            </View>

            {/* Botón de repaso solo si hay fallos */}
            {wrongAnswers.length > 0 && (
              <TouchableOpacity
                style={[rs.reviewBtn, { borderColor: theme.blue }]}
                onPress={() => setShowReview(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="book-outline" size={18} color={theme.blue} />
                <Text style={[rs.reviewBtnTxt, { color: theme.blue }]}>
                  Repasar {wrongAnswers.length} fallo{wrongAnswers.length === 1 ? '' : 's'}
                </Text>
              </TouchableOpacity>
            )}

            {/* CTAs */}
            <View style={{ width: '100%', gap: 10 }}>
              <TouchableOpacity
                style={{ borderRadius: 16, overflow: 'hidden' }}
                onPress={() => onComplete(xpEarned, perfect, bestCombo, wrongCount)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[theme.primary, theme.primary + 'CC']}
                  style={rs.btn}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  <Text style={rs.btnTxt}>Continuar</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={[rs.secondaryBtn, { borderColor: theme.border }]}
                onPress={onShare}
                activeOpacity={0.7}
              >
                <Ionicons name="share-outline" size={16} color={theme.textSecondary} />
                <Text style={[rs.secondaryBtnTxt, { color: theme.textSecondary }]}>Compartir</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  }

  // ── Quiz screen ────────────────────────────────────────────────
  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={[qs.safe, { backgroundColor: theme.bg }]}>
        {/* Header */}
        <View style={[qs.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose} style={[qs.closeBtn, { backgroundColor: theme.bg2 }]}>
            <Ionicons name="close" size={18} color={theme.textSecondary} />
          </TouchableOpacity>

          {isExam ? (
            <>
              {/* Timer cuenta atrás en modo examen */}
              <View style={qs.examCenter}>
                {(() => {
                  const remaining = Math.max(0, EXAM_TIME_LIMIT_SEC - elapsed);
                  const mm = Math.floor(remaining / 60);
                  const ss = remaining % 60;
                  const lowTime = remaining < 5 * 60;
                  return (
                    <View style={[qs.timerPill, { backgroundColor: lowTime ? theme.wrong + '20' : theme.bg2 }]}>
                      <Ionicons name="time" size={14} color={lowTime ? theme.wrong : theme.textPrimary} />
                      <Text style={[qs.timerTxt, { color: lowTime ? theme.wrong : theme.textPrimary }]}>
                        {mm}:{ss.toString().padStart(2, '0')}
                      </Text>
                    </View>
                  );
                })()}
                {/* Contador de errores */}
                <View style={[qs.errorsPill, { backgroundColor: wrongCount >= EXAM_MAX_ERRORS ? theme.wrong + '20' : theme.bg2 }]}>
                  <Ionicons name="close-circle" size={14} color={wrongCount >= EXAM_MAX_ERRORS ? theme.wrong : theme.textPrimary} />
                  <Text style={[qs.timerTxt, { color: wrongCount >= EXAM_MAX_ERRORS ? theme.wrong : theme.textPrimary }]}>
                    {wrongCount}/{EXAM_MAX_ERRORS}
                  </Text>
                </View>
              </View>
            </>
          ) : isPractice ? (
            <View style={[qs.practicePill, { backgroundColor: theme.blue + '15' }]}>
              <Ionicons name="fitness-outline" size={14} color={theme.blue} />
              <Text style={[qs.practiceTxt, { color: theme.blue }]}>Repaso</Text>
              {combo >= 2 && <Text style={[qs.practiceTxt, { color: theme.orange }]}>x{combo}</Text>}
            </View>
          ) : (
            <View style={qs.hearts}>
              {Array.from({ length: user.maxHearts }).map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < currentHearts ? 'heart' : 'heart-outline'}
                  size={18}
                  color={i < currentHearts ? theme.wrong : theme.textTertiary}
                />
              ))}
            </View>
          )}

          <Text style={[qs.counter, { color: theme.textSecondary }]}>{index + 1}/{questions.length}</Text>
        </View>

        {/* Progress bar */}
        <View style={[qs.progressBg, { backgroundColor: theme.bg2 }]}>
          <Animated.View style={[qs.progressFill, {
            backgroundColor: theme.primary,
            width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          }]} />
        </View>

        <ScrollView contentContainerStyle={qs.body} showsVerticalScrollIndicator={false}>
          {/* Traffic sign image */}
          {q.signId && (
            <View style={[qs.signContainer, { backgroundColor: theme.bg2 }]}>
              <TrafficSign signId={q.signId} size={120} />
              {q.legalRef && (
                <Text style={[qs.legalRef, { color: theme.textTertiary }]}>{q.legalRef}</Text>
              )}
            </View>
          )}

          {/* Traffic scene diagram (casos prácticos: intersecciones, rotondas, etc.) */}
          {q.sceneId && (
            <View style={[qs.signContainer, { backgroundColor: theme.bg2 }]}>
              <TrafficScene sceneId={q.sceneId} size={180} />
              {q.legalRef && (
                <Text style={[qs.legalRef, { color: theme.textTertiary }]}>{q.legalRef}</Text>
              )}
            </View>
          )}

          {/* Question */}
          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            <Text style={[qs.question, { color: theme.textPrimary }, (q.signId || q.sceneId) && { fontSize: 16 }]}>{q.text}</Text>
          </Animated.View>

          {/* Answer options */}
          <View style={qs.options}>
            {q.options.map((opt, idx) => {
              const state = answerState(idx);
              const borderColor = state === 'correct' ? theme.correct : state === 'wrong' ? theme.wrong : theme.border;
              const bgColor = state === 'correct' ? theme.correct + '12' : state === 'wrong' ? theme.wrong + '12' : state === 'dimmed' ? theme.bg2 : theme.card;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[qs.option, { backgroundColor: bgColor, borderColor, borderWidth: state === 'idle' ? 1 : 2.5 }]}
                  onPress={() => selectAnswer(idx)}
                  disabled={selected !== null}
                  activeOpacity={0.8}
                >
                  <View style={[qs.optBadge, {
                    backgroundColor: state === 'correct' ? theme.correct + '20' : state === 'wrong' ? theme.wrong + '20' : theme.bg2,
                    borderColor,
                    borderWidth: 1,
                  }]}>
                    {state === 'correct' && <Ionicons name="checkmark" size={14} color={theme.correct} />}
                    {state === 'wrong' && <Ionicons name="close" size={14} color={theme.wrong} />}
                    {(state === 'idle' || state === 'dimmed') && (
                      <Text style={[qs.optLetter, { color: theme.textSecondary, opacity: state === 'dimmed' ? 0.4 : 1 }]}>{LETTERS[idx]}</Text>
                    )}
                  </View>
                  <Text style={[qs.optText, { color: theme.textPrimary, opacity: state === 'dimmed' ? 0.35 : 1 }]} numberOfLines={4}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Feedback */}
          {showFeedback && (
            <Animated.View style={[
              qs.feedback,
              { backgroundColor: correct ? theme.correct + '12' : theme.wrong + '12', opacity: feedbackAnim },
            ]}>
              <View style={[qs.feedbackBar, { backgroundColor: correct ? theme.correct : theme.wrong }]} />
              <View style={{ flex: 1 }}>
                {isPractice ? (
                  <Text style={[qs.feedbackTitle, { color: correct ? theme.correct : theme.wrong }]}>
                    {correct ? `Correcto  +${xpPerCorrect} XP${combo >= 1 ? `  Combo x${combo}` : ''}` : 'Incorrecto'}
                  </Text>
                ) : (
                <Text style={[qs.feedbackTitle, { color: correct ? theme.correct : theme.wrong }]}>
                  {correct ? `Correcto  +10 XP` : `Incorrecto${!isExam && currentHearts <= 0 ? ' · Sin vidas' : ''}`}
                </Text>
                )}
                <Text style={[qs.feedbackExp, { color: theme.textSecondary }]}>{q.explanation}</Text>
                {!correct && (
                  <Text style={[qs.feedbackCorrect, { color: theme.textSecondary }]}>
                    Correcta: <Text style={{ color: theme.correct, fontWeight: '700' }}>{q.options[q.correctIndex]}</Text>
                  </Text>
                )}
                {(() => {
                  const chapterId = getChapterIdForCategory(q.category);
                  if (!chapterId) return null;
                  return (
                    <TouchableOpacity
                      style={[qs.boeBtn, { backgroundColor: theme.blue + '15', borderColor: theme.blue + '40' }]}
                      onPress={() => setOpenManualChapter(chapterId)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="book-outline" size={14} color={theme.blue} />
                      <View style={{ flex: 1 }}>
                        <Text style={[qs.boeLabel, { color: theme.blue }]}>Ampliar en el Manual</Text>
                        <Text style={[qs.boeSub, { color: theme.textTertiary }]}>{getChapterLabel(chapterId)}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={14} color={theme.blue} />
                    </TouchableOpacity>
                  );
                })()}
              </View>
            </Animated.View>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Continue button */}
        {showFeedback && (
          <View style={[qs.footer, { backgroundColor: theme.bg, borderTopColor: theme.border }]}>
            <TouchableOpacity onPress={next} activeOpacity={0.85} style={{ borderRadius: 16, overflow: 'hidden' }}>
              <LinearGradient
                colors={correct ? [theme.correct, '#00897B'] : [theme.wrong, '#C62828']}
                style={qs.continueBtn}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Text style={qs.continueTxt}>
                  {(!isExam && !isPractice && currentHearts <= 0) || index === questions.length - 1 ? 'Ver resultado' : 'Continuar'}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Manual del capítulo asociado, como overlay sobre el quiz */}
        {openManualChapter && (
          <ManualChapterModal
            visible
            chapterId={openManualChapter}
            onClose={() => setOpenManualChapter(null)}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const nh = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center' },
  sub: { fontSize: 14, textAlign: 'center', lineHeight: 21 },
  card: { width: '100%', borderRadius: 16, padding: 20, alignItems: 'center', gap: 6, borderWidth: 1 },
  cardLabel: { fontSize: 13 },
  timer: { fontSize: 38, fontWeight: '800' },
  gemBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 14, padding: 15, width: '100%', justifyContent: 'center' },
  gemBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
  closeBtn: { borderRadius: 14, borderWidth: 1, padding: 14, width: '100%', alignItems: 'center' },
  closeBtnTxt: { fontSize: 15, fontWeight: '600' },
});

const rs = StyleSheet.create({
  safe: { flex: 1 },
  content: { flexGrow: 1, padding: 20, paddingTop: 24, alignItems: 'center', gap: 16 },
  hero: { width: '100%', borderRadius: 24, padding: 26, alignItems: 'center', gap: 10 },
  heroIconCircle: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginBottom: 4,
  },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '900', textAlign: 'center' },
  heroSub: { color: 'rgba(255,255,255,0.92)', fontSize: 14, fontWeight: '600', textAlign: 'center', lineHeight: 20 },

  tileGrid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { flexBasis: '48%', flexGrow: 1, borderRadius: 16, padding: 14, gap: 6, borderWidth: 1 },
  tileTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tileLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  tileValue: { fontSize: 22, fontWeight: '900' },

  reviewBtn: {
    width: '100%', borderRadius: 14, borderWidth: 1.5,
    padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  reviewBtnTxt: { fontSize: 15, fontWeight: '700' },

  btn: { padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnTxt: { color: '#fff', fontSize: 17, fontWeight: '800' },

  secondaryBtn: {
    width: '100%', borderRadius: 14, borderWidth: 1,
    padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  secondaryBtnTxt: { fontSize: 14, fontWeight: '700' },
});

function StatTile({ label, value, color, icon, theme }: {
  label: string;
  value: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={[rs.tile, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={rs.tileTopRow}>
        <Text style={[rs.tileLabel, { color: theme.textTertiary }]}>{label}</Text>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={[rs.tileValue, { color }]}>{value}</Text>
    </View>
  );
}

const qs = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, borderBottomWidth: 0.5 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  hearts: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 5 },
  practicePill: { flex: 1, alignSelf: 'center', maxWidth: 130, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  practiceTxt: { fontSize: 12, fontWeight: '800' },
  counter: { fontSize: 13, fontWeight: '700', minWidth: 36, textAlign: 'right' },
  examCenter: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  timerPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  errorsPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  timerTxt: { fontSize: 13, fontWeight: '800', fontVariant: ['tabular-nums'] },
  progressBg: { height: 5, overflow: 'hidden' },
  progressFill: { height: 5 },
  body: { padding: 20, gap: 14 },
  signContainer: { borderRadius: 16, padding: 20, alignItems: 'center', gap: 6 },
  legalRef: { fontSize: 10, fontWeight: '600' },
  question: { fontSize: 20, fontWeight: '700', textAlign: 'center', lineHeight: 28, marginVertical: 4, paddingHorizontal: 4 },
  options: { gap: 10 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16 },
  optBadge: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  optLetter: { fontSize: 14, fontWeight: '800' },
  optText: { flex: 1, fontSize: 15, lineHeight: 21 },
  feedback: { flexDirection: 'row', borderRadius: 14, padding: 14, gap: 10 },
  feedbackBar: { width: 4, borderRadius: 2, alignSelf: 'stretch' },
  feedbackTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  feedbackExp: { fontSize: 13, lineHeight: 20 },
  feedbackCorrect: { fontSize: 13, marginTop: 6 },
  boeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 10, padding: 10, borderRadius: 10, borderWidth: 1,
  },
  boeLabel: { fontSize: 12, fontWeight: '800' },
  boeSub: { fontSize: 10, marginTop: 1 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 16, borderTopWidth: 0.5 },
  continueBtn: { borderRadius: 16, padding: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  continueTxt: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
