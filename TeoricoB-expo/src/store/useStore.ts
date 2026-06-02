import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserState, LeagueType, Achievement, DailyChallenge, LeagueStanding, Topic, Friend } from '../types';
import { ALL_TOPICS } from '../data/questions';

const HEART_REGEN_MINUTES = 30;

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_lesson',   name: '¡Arranque!',           emoji: '🚀', description: 'Completa tu primera lección',           rewardGems: 10 },
  { id: 'streak_3',       name: 'En Racha',             emoji: '🔥', description: 'Mantén una racha de 3 días',             rewardGems: 15 },
  { id: 'streak_7',       name: 'Semana de Fuego',      emoji: '⚡', description: 'Mantén una racha de 7 días',             rewardGems: 30 },
  { id: 'streak_30',      name: 'Mes Perfecto',         emoji: '💫', description: 'Mantén una racha de 30 días',            rewardGems: 100 },
  { id: 'perfect_lesson', name: 'Sin Errores',          emoji: '⭐', description: 'Completa una lección perfecta',          rewardGems: 15 },
  { id: 'topic_complete', name: 'Experto Temático',     emoji: '🏆', description: 'Completa todos los temas de una categoría', rewardGems: 30 },
  { id: 'all_topics',     name: '¡Teórico Superado!',   emoji: '🎓', description: 'Completa todos los temas',               rewardGems: 100, rewardXP: 200 },
  { id: 'xp_100',         name: 'Primer Centenar',      emoji: '💯', description: 'Gana 100 XP',                            rewardGems: 10 },
  { id: 'xp_1000',        name: '¡Mil Puntos!',         emoji: '🌟', description: 'Gana 1000 XP',                           rewardGems: 50 },
  { id: 'gold_league',    name: 'Liga de Oro',          emoji: '🥇', description: 'Alcanza la Liga de Oro',                 rewardGems: 50 },
  { id: 'exam_pass',      name: 'Aprobado',             emoji: '🎉', description: 'Pasa el examen simulado',                rewardGems: 25 },
  { id: 'accuracy_90',    name: 'Precisión de Cirujano',emoji: '🎯', description: 'Mantén +90% de acierto (50+ respuestas)',rewardGems: 30 },
  // ── Logros nuevos (v0.7) ─────────────────────────────────────────────
  { id: 'lessons_50',     name: 'Aprendiz Maestro',     emoji: '🧠', description: 'Completa 50 lecciones',                  rewardGems: 50 },
  { id: 'accuracy_95',    name: 'Bisturí',              emoji: '🩻', description: '95% de acierto con 100+ respuestas',     rewardGems: 40 },
  { id: 'exam_perfect',   name: 'Pleno',                emoji: '🎯', description: 'Examen simulado 30/30 sin errores',      rewardGems: 60 },
  { id: 'combo_10',       name: 'Rey del Combo',        emoji: '🔥', description: '10 respuestas correctas seguidas',        rewardGems: 25 },
  { id: 'quests_7',       name: 'Cumplidor',            emoji: '📅', description: 'Completa todas las misiones 7 días seguidos', rewardGems: 40 },
];

export const LEAGUES: { name: LeagueType; emoji: string; xpRequired: number; color: string }[] = [
  { name: 'Bronce',    emoji: '🥉', xpRequired: 0,     color: '#CD7F32' },
  { name: 'Plata',     emoji: '🥈', xpRequired: 500,   color: '#A8A9AD' },
  { name: 'Oro',       emoji: '🥇', xpRequired: 1500,  color: '#FFD700' },
  { name: 'Zafiro',    emoji: '💙', xpRequired: 3000,  color: '#0F52BA' },
  { name: 'Rubí',      emoji: '❤️', xpRequired: 5500,  color: '#E0115F' },
  { name: 'Esmeralda', emoji: '💚', xpRequired: 9000,  color: '#50C878' },
  { name: 'Amatista',  emoji: '💜', xpRequired: 14000, color: '#9966CC' },
  { name: 'Diamante',  emoji: '💎', xpRequired: 20000, color: '#00BFFF' },
];

const MOCK_FRIENDS: Friend[] = [
  { name: 'Carlos M.',  avatarEmoji: '😎', xp: 1240, streak: 12, league: 'Plata' },
  { name: 'Ana García', avatarEmoji: '🤩', xp: 890,  streak: 5,  league: 'Bronce' },
  { name: 'Pablo R.',   avatarEmoji: '🚀', xp: 3200, streak: 28, league: 'Oro' },
  { name: 'María L.',   avatarEmoji: '⭐', xp: 560,  streak: 3,  league: 'Bronce' },
];

export const getLeagueInfo = (name: LeagueType) => LEAGUES.find(l => l.name === name) ?? LEAGUES[0];
export const getAllAchievements = () => ACHIEVEMENTS;
export const getTopics = (): Topic[] => ALL_TOPICS;

interface AppStore {
  user: UserState;
  isOnboardingComplete: boolean;
  tutorialSeen: boolean;
  topics: Topic[];
  leagueStandings: LeagueStanding[];
  dailyChallenge: DailyChallenge | null;
  newAchievement: Achievement | null;

  completeOnboarding: (name: string, avatar: string) => void;
  completeTutorial: () => void;
  addXP: (amount: number) => void;
  loseHeart: () => void;
  restoreHeart: () => void;
  buyHeartWithGems: () => boolean;
  tickHeartRegen: () => void;
  recordAnswer: (correct: boolean, category?: string) => void;
  completeLesson: (lessonId: string, topicId: string, xpEarned: number, perfect: boolean, bestCombo?: number) => void;
  completeDailyChallenge: () => void;
  updateStreak: () => void;
  clearNewAchievement: () => void;
  generateDailyChallenge: () => void;
  generateLeagueStandings: () => void;
  getExamQuestions: () => import('../types').Question[];
  progressForTopic: (topicId: string) => number;
  isLessonCompleted: (lessonId: string) => boolean;
  isTopicCompleted: (topicId: string) => boolean;
  minutesToNextHeart: () => number;
  resetProgress: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  soundsEnabled: boolean;
  toggleSounds: () => void;
  disclaimerAccepted: boolean;
  acceptDisclaimer: () => void;
  setProfilePhoto: (uri: string | undefined) => void;
  setAvatarColor: (color: string) => void;
  requestedManualChapter: string | null;
  requestManualChapter: (chapterId: string) => void;
  clearRequestedManualChapter: () => void;
  saveExamResult: (result: import('../types').ExamResult) => void;

  // ── Mistakes / repaso ───────────────────────────────
  recordMistake: (questionId: string, category: string) => void;
  registerMistakeRecovery: (questionId: string) => void;
  getMistakeQuestions: (limit?: number) => import('../types').Question[];
  mistakeCount: () => number;

  // ── Streak freeze ───────────────────────────────────
  canBuyStreakFreeze: () => boolean;
  buyStreakFreeze: () => boolean;
  isStreakFrozen: () => boolean;

  // ── Daily Quests ────────────────────────────────────
  dailyQuests: import('../types').DailyQuests | null;
  generateDailyQuests: () => void;
  claimQuestReward: (questId: import('../types').DailyQuestId) => boolean;

  // ── Notifications config ────────────────────────────
  notifications: import('../types').NotificationsConfig;
  setNotificationsConfig: (patch: Partial<import('../types').NotificationsConfig>) => void;
}

const defaultUser: UserState = {
  name: '',
  avatarEmoji: '🚗',
  xp: 0,
  streak: 0,
  hearts: 5,
  maxHearts: 5,
  lastHeartRegenTime: new Date().toISOString(),
  league: 'Bronce',
  leagueXP: 0,
  completedLessons: [],
  completedTopics: [],
  achievements: [],
  lastActiveDate: new Date().toISOString(),
  totalCorrect: 0,
  totalAnswered: 0,
  weeklyXP: 0,
  gems: 50,
  friends: MOCK_FRIENDS,
  topicStats: {},
  examHistory: [],
  mistakes: [],
  streakFreezesUsedThisMonth: 0,
  streakFreezesMonthKey: new Date().toISOString().slice(0, 7),
  dailyQuestStreak: 0,
};

const RECOVERIES_TO_CLEAR = 2;        // aciertos consecutivos para limpiar fallo
const STREAK_FREEZE_COST = 30;        // gemas
const STREAK_FREEZES_PER_MONTH = 3;
const PRACTICE_XP_PER_CORRECT = 5;    // vs 10 en modo normal

const DEFAULT_NOTIFICATIONS: import('../types').NotificationsConfig = {
  enabled: false,
  reminderHour: 19,
  reminderMinute: 0,
  reminderEnabled: true,
  streakDangerEnabled: true,
  heartsFullEnabled: true,
  questsEnabled: true,
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function monthKey(): string {
  return new Date().toISOString().slice(0, 7);  // YYYY-MM
}

/**
 * Calcula la diferencia de logros y devuelve la recompensa acumulada
 * a aplicar al user. Devuelve también el nuevo Achievement (el primero
 * desbloqueado) para activar el modal del UI.
 */
function rewardForNewAchievements(prev: string[], next: string[]): { gems: number; xp: number; firstNew: Achievement | null } {
  let gems = 0;
  let xp = 0;
  let firstNew: Achievement | null = null;
  for (const id of next) {
    if (prev.includes(id)) continue;
    const a = ACHIEVEMENTS.find(x => x.id === id);
    if (!a) continue;
    gems += a.rewardGems ?? 0;
    xp += a.rewardXP ?? 0;
    if (!firstNew) firstNew = a;
  }
  return { gems, xp, firstNew };
}

function generateQuestsForToday(): import('../types').DailyQuests {
  return {
    date: todayKey(),
    quests: [
      { id: 'xp_30',      label: 'Gana 30 XP hoy',        emoji: '⚡', goal: 30, progress: 0, rewardGems: 15, claimed: false },
      { id: 'lesson_1',   label: 'Completa 1 lección',    emoji: '📚', goal: 1,  progress: 0, rewardGems: 10, claimed: false },
      { id: 'correct_15', label: 'Acierta 15 preguntas',  emoji: '🎯', goal: 15, progress: 0, rewardGems: 20, claimed: false },
    ],
  };
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      user: defaultUser,
      isOnboardingComplete: false,
      tutorialSeen: false,
      isDarkMode: false,
      soundsEnabled: true,
      disclaimerAccepted: false,
      acceptDisclaimer: () => set({ disclaimerAccepted: true }),
      setProfilePhoto: (uri) => set(s => ({ user: { ...s.user, profilePhotoUri: uri } })),
      setAvatarColor: (color) => set(s => ({ user: { ...s.user, avatarEmoji: color, profilePhotoUri: undefined } })),
      requestedManualChapter: null,
      requestManualChapter: (chapterId) => set({ requestedManualChapter: chapterId }),
      clearRequestedManualChapter: () => set({ requestedManualChapter: null }),
      topics: ALL_TOPICS,
      leagueStandings: [],
      dailyChallenge: null,
      newAchievement: null,
      dailyQuests: null,
      notifications: DEFAULT_NOTIFICATIONS,

      completeOnboarding: (name, avatar) => {
        set(s => ({ user: { ...s.user, name, avatarEmoji: avatar }, isOnboardingComplete: true }));
        get().generateLeagueStandings();
        get().generateDailyChallenge();
        get().generateDailyQuests();
      },

      completeTutorial: () => set({ tutorialSeen: true }),

      addXP: (amount) => {
        set(s => {
          const newXP = s.user.xp + amount;
          const newLeagueXP = s.user.leagueXP + amount;
          let newLeague = s.user.league;
          for (let i = LEAGUES.length - 1; i >= 0; i--) {
            if (newXP >= LEAGUES[i].xpRequired) { newLeague = LEAGUES[i].name; break; }
          }
          const newAchievements = [...s.user.achievements];
          if (newXP >= 100  && !newAchievements.includes('xp_100'))  newAchievements.push('xp_100');
          if (newXP >= 1000 && !newAchievements.includes('xp_1000')) newAchievements.push('xp_1000');
          if (newLeague === 'Oro' && !newAchievements.includes('gold_league')) newAchievements.push('gold_league');
          const reward = rewardForNewAchievements(s.user.achievements, newAchievements);
          // Avanzar quest "Gana 30 XP hoy" si está activo y no reclamado
          const today = todayKey();
          const dq = s.dailyQuests && s.dailyQuests.date === today ? {
            ...s.dailyQuests,
            quests: s.dailyQuests.quests.map(q =>
              q.id === 'xp_30' && !q.claimed
                ? { ...q, progress: Math.min(q.goal, q.progress + amount) }
                : q
            ),
          } : s.dailyQuests;
          return {
            user: {
              ...s.user,
              xp: newXP + reward.xp,
              leagueXP: newLeagueXP + reward.xp,
              weeklyXP: s.user.weeklyXP + amount + reward.xp,
              league: newLeague,
              achievements: newAchievements,
              gems: s.user.gems + reward.gems,
            },
            newAchievement: reward.firstNew ?? s.newAchievement,
            dailyQuests: dq,
          };
        });
        get().generateLeagueStandings();
      },

      loseHeart: () => set(s => {
        const hearts = Math.max(0, s.user.hearts - 1);
        const lastHeartRegenTime = s.user.hearts === s.user.maxHearts ? new Date().toISOString() : s.user.lastHeartRegenTime;
        return { user: { ...s.user, hearts, lastHeartRegenTime } };
      }),

      restoreHeart: () => set(s => ({
        user: { ...s.user, hearts: Math.min(s.user.maxHearts, s.user.hearts + 1) }
      })),

      buyHeartWithGems: () => {
        const { user } = get();
        const GEM_COST = 10;
        if (user.gems < GEM_COST || user.hearts >= user.maxHearts) return false;
        set(s => ({ user: { ...s.user, gems: s.user.gems - GEM_COST, hearts: Math.min(s.user.maxHearts, s.user.hearts + 1) } }));
        return true;
      },

      tickHeartRegen: () => {
        const { user } = get();
        if (user.hearts >= user.maxHearts) return;
        const now = Date.now();
        const last = new Date(user.lastHeartRegenTime).getTime();
        const elapsed = (now - last) / 60000; // minutes
        if (elapsed >= HEART_REGEN_MINUTES) {
          const heartsToAdd = Math.floor(elapsed / HEART_REGEN_MINUTES);
          const newHearts = Math.min(user.maxHearts, user.hearts + heartsToAdd);
          const newLastRegen = new Date(last + heartsToAdd * HEART_REGEN_MINUTES * 60000).toISOString();
          set(s => ({ user: { ...s.user, hearts: newHearts, lastHeartRegenTime: newHearts >= s.user.maxHearts ? new Date().toISOString() : newLastRegen } }));
        }
      },

      minutesToNextHeart: () => {
        const { user } = get();
        if (user.hearts >= user.maxHearts) return 0;
        const last = new Date(user.lastHeartRegenTime).getTime();
        const elapsed = (Date.now() - last) / 60000;
        return Math.max(0, Math.ceil(HEART_REGEN_MINUTES - (elapsed % HEART_REGEN_MINUTES)));
      },

      recordAnswer: (correct, category) => set(s => {
        const stats = { ...(s.user.topicStats ?? {}) };
        if (category) {
          const prev = stats[category] ?? { correct: 0, total: 0 };
          stats[category] = { correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1 };
        }
        const totalAnswered = s.user.totalAnswered + 1;
        const totalCorrect = s.user.totalCorrect + (correct ? 1 : 0);
        const accuracy = totalAnswered > 0 ? totalCorrect / totalAnswered : 0;
        const newAchievements = [...s.user.achievements];
        if (totalAnswered >= 50  && accuracy >= 0.9  && !newAchievements.includes('accuracy_90'))  newAchievements.push('accuracy_90');
        if (totalAnswered >= 100 && accuracy >= 0.95 && !newAchievements.includes('accuracy_95')) newAchievements.push('accuracy_95');
        const reward = rewardForNewAchievements(s.user.achievements, newAchievements);
        // Avanzar quest "Acierta 15 preguntas" si correct
        const today = todayKey();
        const dq = correct && s.dailyQuests && s.dailyQuests.date === today ? {
          ...s.dailyQuests,
          quests: s.dailyQuests.quests.map(q =>
            q.id === 'correct_15' && !q.claimed
              ? { ...q, progress: Math.min(q.goal, q.progress + 1) }
              : q
          ),
        } : s.dailyQuests;
        return {
          user: {
            ...s.user,
            totalAnswered,
            totalCorrect,
            topicStats: stats,
            achievements: newAchievements,
            gems: s.user.gems + reward.gems,
            xp: s.user.xp + reward.xp,
          },
          newAchievement: reward.firstNew ?? s.newAchievement,
          dailyQuests: dq,
        };
      }),

      saveExamResult: (result) => set(s => {
        const history = [result, ...(s.user.examHistory ?? [])].slice(0, 50); // máximo 50 examenes
        const newAchievements = [...s.user.achievements];
        if (result.passed && !newAchievements.includes('exam_pass')) newAchievements.push('exam_pass');
        // exam_perfect: 30 preguntas sin fallos
        if (result.wrongCount === 0 && result.correctCount === result.totalQuestions && !newAchievements.includes('exam_perfect')) {
          newAchievements.push('exam_perfect');
        }
        const reward = rewardForNewAchievements(s.user.achievements, newAchievements);
        return {
          user: {
            ...s.user,
            examHistory: history,
            achievements: newAchievements,
            gems: s.user.gems + reward.gems,
            xp: s.user.xp + reward.xp,
          },
          newAchievement: reward.firstNew ?? s.newAchievement,
        };
      }),

      completeLesson: (lessonId, topicId, xpEarned, perfect, bestCombo) => {
        set(s => {
          const completedLessons = s.user.completedLessons.includes(lessonId)
            ? s.user.completedLessons : [...s.user.completedLessons, lessonId];
          const topic = ALL_TOPICS.find(t => t.id === topicId);
          const allDone = topic?.lessons.every(l => completedLessons.includes(l.id)) ?? false;
          const completedTopics = allDone && !s.user.completedTopics.includes(topicId)
            ? [...s.user.completedTopics, topicId] : s.user.completedTopics;
          // ¿Todos los topics del banco entero completados?
          const allTopicsDone = ALL_TOPICS.every(t => completedTopics.includes(t.id));
          const newAchievements = [...s.user.achievements];
          if (!newAchievements.includes('first_lesson')) newAchievements.push('first_lesson');
          if (perfect && !newAchievements.includes('perfect_lesson')) newAchievements.push('perfect_lesson');
          if (allDone && !newAchievements.includes('topic_complete')) newAchievements.push('topic_complete');
          if (allTopicsDone && !newAchievements.includes('all_topics')) newAchievements.push('all_topics');
          if (completedLessons.length >= 50 && !newAchievements.includes('lessons_50')) newAchievements.push('lessons_50');
          if ((bestCombo ?? 0) >= 10 && !newAchievements.includes('combo_10')) newAchievements.push('combo_10');
          const reward = rewardForNewAchievements(s.user.achievements, newAchievements);
          // Avanzar quest "Completa 1 lección"
          const today = todayKey();
          const isNewCompletion = !s.user.completedLessons.includes(lessonId);
          const dq = isNewCompletion && s.dailyQuests && s.dailyQuests.date === today ? {
            ...s.dailyQuests,
            quests: s.dailyQuests.quests.map(q =>
              q.id === 'lesson_1' && !q.claimed
                ? { ...q, progress: Math.min(q.goal, q.progress + 1) }
                : q
            ),
          } : s.dailyQuests;
          return {
            user: {
              ...s.user,
              completedLessons,
              completedTopics,
              achievements: newAchievements,
              gems: s.user.gems + reward.gems,
              xp: s.user.xp + reward.xp,
            },
            newAchievement: reward.firstNew ?? s.newAchievement,
            dailyQuests: dq,
          };
        });
        get().addXP(xpEarned);
        get().updateStreak();
      },

      completeDailyChallenge: () => {
        set(s => ({ dailyChallenge: s.dailyChallenge ? { ...s.dailyChallenge, isCompleted: true } : null }));
        get().addXP(50);
        get().updateStreak();
      },

      updateStreak: () => {
        set(s => {
          const today = new Date().toDateString();
          const last = new Date(s.user.lastActiveDate).toDateString();
          const yesterday = new Date(Date.now() - 86400000).toDateString();
          const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toDateString();
          if (today === last) return {};
          // ¿Hay streak freeze activo y se saltó UN día (no más)?
          const frozen = !!s.user.streakFreezeActiveUntil &&
                         new Date(s.user.streakFreezeActiveUntil) > new Date();
          let newStreak: number;
          let consumedFreeze = false;
          if (last === yesterday) {
            // Estudió ayer → racha avanza normal
            newStreak = s.user.streak + 1;
          } else if (frozen && last === twoDaysAgo) {
            // Saltó UN día pero tenía freeze activo → mantiene racha sin incrementar
            // y CONSUME el freeze para que no salve días futuros (sería ilimitado)
            newStreak = s.user.streak;
            consumedFreeze = true;
          } else {
            // Reset
            newStreak = 1;
          }
          const newAchievements = [...s.user.achievements];
          if (newStreak >= 3  && !newAchievements.includes('streak_3'))  newAchievements.push('streak_3');
          if (newStreak >= 7  && !newAchievements.includes('streak_7'))  newAchievements.push('streak_7');
          if (newStreak >= 30 && !newAchievements.includes('streak_30')) newAchievements.push('streak_30');
          const addedId = newAchievements.find(id => !s.user.achievements.includes(id));
          const newAchievement = addedId ? ACHIEVEMENTS.find(a => a.id === addedId) ?? null : s.newAchievement;
          return {
            user: {
              ...s.user,
              streak: newStreak,
              lastActiveDate: new Date().toISOString(),
              achievements: newAchievements,
              streakFreezeActiveUntil: consumedFreeze ? undefined : s.user.streakFreezeActiveUntil,
            },
            newAchievement,
          };
        });
      },

      clearNewAchievement: () => set({ newAchievement: null }),

      generateDailyChallenge: () => {
        const all = ALL_TOPICS.flatMap(t => t.lessons.flatMap(l => l.questions));
        const shuffled = [...all].sort(() => Math.random() - 0.5).slice(0, 10);
        set({ dailyChallenge: { date: new Date().toISOString(), questions: shuffled, isCompleted: false, xpReward: 50 } });
      },

      generateLeagueStandings: () => {
        const { user } = get();
        const base = user.leagueXP;
        const competitors = [
          { name: 'Carlos M.',  avatarEmoji: '😎', xp: base + 45,              isMe: false },
          { name: 'Ana García', avatarEmoji: '🤩', xp: base + 30,              isMe: false },
          { name: 'Pablo R.',   avatarEmoji: '🚀', xp: base + 15,              isMe: false },
          { name: user.name || 'Tú', avatarEmoji: user.avatarEmoji, xp: base,  isMe: true  },
          { name: 'María L.',   avatarEmoji: '⭐', xp: Math.max(0, base - 20), isMe: false },
          { name: 'David S.',   avatarEmoji: '🎯', xp: Math.max(0, base - 45), isMe: false },
          { name: 'Laura T.',   avatarEmoji: '💪', xp: Math.max(0, base - 80), isMe: false },
          { name: 'Miguel A.',  avatarEmoji: '🔥', xp: Math.max(0, base - 110),isMe: false },
          { name: 'Sofía V.',   avatarEmoji: '⚡', xp: Math.max(0, base - 150),isMe: false },
          { name: 'Roberto G.', avatarEmoji: '🏆', xp: Math.max(0, base - 200),isMe: false },
        ];
        const sorted = [...competitors].sort((a, b) => b.xp - a.xp);
        set({ leagueStandings: sorted.map((c, i) => ({ name: c.name, avatarEmoji: c.avatarEmoji, xp: c.xp, rank: i + 1, isCurrentUser: c.isMe })) });
      },

      getExamQuestions: () => {
        const all = ALL_TOPICS.flatMap(t => t.lessons.flatMap(l => l.questions));
        return [...all].sort(() => Math.random() - 0.5).slice(0, 30);
      },

      progressForTopic: (topicId) => {
        const { user } = get();
        const topic = ALL_TOPICS.find(t => t.id === topicId);
        if (!topic || topic.lessons.length === 0) return 0;
        return topic.lessons.filter(l => user.completedLessons.includes(l.id)).length / topic.lessons.length;
      },

      isLessonCompleted: (lessonId) => get().user.completedLessons.includes(lessonId),
      isTopicCompleted: (topicId) => get().user.completedTopics.includes(topicId),
      resetProgress: () => set({ user: { ...defaultUser, friends: MOCK_FRIENDS }, isOnboardingComplete: false, tutorialSeen: false, dailyQuests: null }),
      toggleDarkMode: () => set(s => ({ isDarkMode: !s.isDarkMode })),
      toggleSounds: () => set(s => ({ soundsEnabled: !s.soundsEnabled })),

      // ── Mistakes / repaso ─────────────────────────────────────────
      recordMistake: (questionId, category) => set(s => {
        const now = new Date().toISOString();
        const current = s.user.mistakes ?? [];
        const existing = current.find(m => m.questionId === questionId);
        const list = existing
          // Devolver nuevos objetos (immutable) — no mutar los del snapshot anterior
          ? current.map(m =>
              m.questionId === questionId
                ? { ...m, attempts: m.attempts + 1, failedAt: now, recoveriesNeeded: RECOVERIES_TO_CLEAR }
                : m
            )
          : [...current, { questionId, category, failedAt: now, attempts: 1, recoveriesNeeded: RECOVERIES_TO_CLEAR }];
        return { user: { ...s.user, mistakes: list } };
      }),

      registerMistakeRecovery: (questionId) => set(s => {
        const list = (s.user.mistakes ?? []).flatMap(m => {
          if (m.questionId !== questionId) return [m];
          const remaining = m.recoveriesNeeded - 1;
          return remaining <= 0 ? [] : [{ ...m, recoveriesNeeded: remaining }];
        });
        return { user: { ...s.user, mistakes: list } };
      }),

      getMistakeQuestions: (limit = 10) => {
        const { user } = get();
        const mistakes = user.mistakes ?? [];
        if (mistakes.length === 0) return [];
        // Indexar todas las preguntas por id
        const byId = new Map<string, import('../types').Question>();
        for (const t of ALL_TOPICS) {
          for (const l of t.lessons) {
            for (const q of l.questions) byId.set(q.id, q);
          }
        }
        // Ordenar: más fallos primero, más reciente desempata
        const sorted = [...mistakes].sort((a, b) => {
          if (b.attempts !== a.attempts) return b.attempts - a.attempts;
          return new Date(b.failedAt).getTime() - new Date(a.failedAt).getTime();
        });
        const out: import('../types').Question[] = [];
        for (const m of sorted) {
          const q = byId.get(m.questionId);
          if (q) out.push(q);
          if (out.length >= limit) break;
        }
        return out;
      },

      mistakeCount: () => (get().user.mistakes ?? []).length,

      // ── Streak freeze ─────────────────────────────────────────────
      canBuyStreakFreeze: () => {
        const { user } = get();
        const thisMonth = monthKey();
        const usedThisMonth = user.streakFreezesMonthKey === thisMonth ? user.streakFreezesUsedThisMonth : 0;
        if (usedThisMonth >= STREAK_FREEZES_PER_MONTH) return false;
        if (user.gems < STREAK_FREEZE_COST) return false;
        // No tiene sentido comprar si ya hay uno activo
        if (user.streakFreezeActiveUntil && new Date(user.streakFreezeActiveUntil) > new Date()) return false;
        return true;
      },

      buyStreakFreeze: () => {
        if (!get().canBuyStreakFreeze()) return false;
        const until = new Date();
        until.setHours(until.getHours() + 24);
        set(s => {
          const thisMonth = monthKey();
          const usedThisMonth = s.user.streakFreezesMonthKey === thisMonth ? s.user.streakFreezesUsedThisMonth + 1 : 1;
          return {
            user: {
              ...s.user,
              gems: s.user.gems - STREAK_FREEZE_COST,
              streakFreezeActiveUntil: until.toISOString(),
              streakFreezesUsedThisMonth: usedThisMonth,
              streakFreezesMonthKey: thisMonth,
            }
          };
        });
        return true;
      },

      isStreakFrozen: () => {
        const { user } = get();
        return !!user.streakFreezeActiveUntil && new Date(user.streakFreezeActiveUntil) > new Date();
      },

      // ── Daily Quests ──────────────────────────────────────────────
      generateDailyQuests: () => set(s => {
        const today = todayKey();
        if (s.dailyQuests && s.dailyQuests.date === today) return {};
        return { dailyQuests: generateQuestsForToday() };
      }),

      claimQuestReward: (questId) => {
        const { dailyQuests } = get();
        if (!dailyQuests) return false;
        const quest = dailyQuests.quests.find(q => q.id === questId);
        if (!quest || quest.claimed || quest.progress < quest.goal) return false;
        set(s => {
          if (!s.dailyQuests) return {};
          const updatedQuests = s.dailyQuests.quests.map(q =>
            q.id === questId ? { ...q, claimed: true } : q
          );
          // ¿Acabamos de completar TODAS las quests del día? → avanza dailyQuestStreak
          const allClaimedNow = updatedQuests.every(q => q.claimed);
          const today = todayKey();
          const wasYesterday = (() => {
            if (!s.user.lastDailyQuestStreakDate) return false;
            const d = new Date(s.user.lastDailyQuestStreakDate + 'T00:00:00');
            const yKey = new Date(d.getTime() + 86400000).toISOString().slice(0, 10);
            return yKey === today;
          })();
          let dailyQuestStreak = s.user.dailyQuestStreak;
          let lastDailyQuestStreakDate = s.user.lastDailyQuestStreakDate;
          if (allClaimedNow && s.user.lastDailyQuestStreakDate !== today) {
            dailyQuestStreak = wasYesterday ? dailyQuestStreak + 1 : 1;
            lastDailyQuestStreakDate = today;
          }
          const newAchievements = [...s.user.achievements];
          if (dailyQuestStreak >= 7 && !newAchievements.includes('quests_7')) {
            newAchievements.push('quests_7');
          }
          const reward = rewardForNewAchievements(s.user.achievements, newAchievements);
          return {
            dailyQuests: { ...s.dailyQuests, quests: updatedQuests },
            user: {
              ...s.user,
              gems: s.user.gems + quest.rewardGems + reward.gems,
              xp: s.user.xp + reward.xp,
              achievements: newAchievements,
              dailyQuestStreak,
              lastDailyQuestStreakDate,
            },
            newAchievement: reward.firstNew ?? s.newAchievement,
          };
        });
        return true;
      },

      // ── Notifications config ──────────────────────────────────────
      setNotificationsConfig: (patch) => set(s => ({
        notifications: { ...(s.notifications ?? DEFAULT_NOTIFICATIONS), ...patch },
      })),
    }),
    {
      name: 'teoricob-v2',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        user: s.user,
        isOnboardingComplete: s.isOnboardingComplete,
        tutorialSeen: s.tutorialSeen,
        dailyChallenge: s.dailyChallenge,
        dailyQuests: s.dailyQuests,
        notifications: s.notifications,
        isDarkMode: s.isDarkMode,
        soundsEnabled: s.soundsEnabled,
        disclaimerAccepted: s.disclaimerAccepted,
      }),
      merge: (persisted: any, current) => ({
        ...current,
        ...persisted,
        user: { ...defaultUser, ...(persisted as any)?.user, friends: MOCK_FRIENDS },
      }),
    }
  )
);
