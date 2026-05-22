import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserState, LeagueType, Achievement, DailyChallenge, LeagueStanding, Topic, Friend } from '../types';
import { ALL_TOPICS } from '../data/questions';

const HEART_REGEN_MINUTES = 30;

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_lesson',   name: '¡Arranque!',           emoji: '🚀', description: 'Completa tu primera lección' },
  { id: 'streak_3',       name: 'En Racha',             emoji: '🔥', description: 'Mantén una racha de 3 días' },
  { id: 'streak_7',       name: 'Semana de Fuego',      emoji: '⚡', description: 'Mantén una racha de 7 días' },
  { id: 'streak_30',      name: 'Mes Perfecto',         emoji: '💫', description: 'Mantén una racha de 30 días' },
  { id: 'perfect_lesson', name: 'Sin Errores',          emoji: '⭐', description: 'Completa una lección perfecta' },
  { id: 'topic_complete', name: 'Experto Temático',     emoji: '🏆', description: 'Completa todos los temas de una categoría' },
  { id: 'all_topics',     name: '¡Teórico Superado!',   emoji: '🎓', description: 'Completa todos los temas' },
  { id: 'xp_100',         name: 'Primer Centenar',      emoji: '💯', description: 'Gana 100 XP' },
  { id: 'xp_1000',        name: '¡Mil Puntos!',         emoji: '🌟', description: 'Gana 1000 XP' },
  { id: 'gold_league',    name: 'Liga de Oro',          emoji: '🥇', description: 'Alcanza la Liga de Oro' },
  { id: 'exam_pass',      name: 'Aprobado',             emoji: '🎉', description: 'Pasa el examen simulado' },
  { id: 'accuracy_90',    name: 'Precisión de Cirujano',emoji: '🎯', description: 'Mantén +90% de acierto (50+ respuestas)' },
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
  topics: Topic[];
  leagueStandings: LeagueStanding[];
  dailyChallenge: DailyChallenge | null;
  newAchievement: Achievement | null;

  completeOnboarding: (name: string, avatar: string) => void;
  addXP: (amount: number) => void;
  loseHeart: () => void;
  restoreHeart: () => void;
  buyHeartWithGems: () => boolean;
  tickHeartRegen: () => void;
  recordAnswer: (correct: boolean) => void;
  completeLesson: (lessonId: string, topicId: string, xpEarned: number, perfect: boolean) => void;
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
};

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      user: defaultUser,
      isOnboardingComplete: false,
      isDarkMode: false,
      topics: ALL_TOPICS,
      leagueStandings: [],
      dailyChallenge: null,
      newAchievement: null,

      completeOnboarding: (name, avatar) => {
        set(s => ({ user: { ...s.user, name, avatarEmoji: avatar }, isOnboardingComplete: true }));
        get().generateLeagueStandings();
        get().generateDailyChallenge();
      },

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
          const addedId = newAchievements.find(id => !s.user.achievements.includes(id));
          const newAchievement = addedId ? ACHIEVEMENTS.find(a => a.id === addedId) ?? null : s.newAchievement;
          return { user: { ...s.user, xp: newXP, leagueXP: newLeagueXP, weeklyXP: s.user.weeklyXP + amount, league: newLeague, achievements: newAchievements }, newAchievement };
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

      recordAnswer: (correct) => set(s => ({
        user: { ...s.user, totalAnswered: s.user.totalAnswered + 1, totalCorrect: s.user.totalCorrect + (correct ? 1 : 0) }
      })),

      completeLesson: (lessonId, topicId, xpEarned, perfect) => {
        set(s => {
          const completedLessons = s.user.completedLessons.includes(lessonId)
            ? s.user.completedLessons : [...s.user.completedLessons, lessonId];
          const topic = ALL_TOPICS.find(t => t.id === topicId);
          const allDone = topic?.lessons.every(l => completedLessons.includes(l.id)) ?? false;
          const completedTopics = allDone && !s.user.completedTopics.includes(topicId)
            ? [...s.user.completedTopics, topicId] : s.user.completedTopics;
          const newAchievements = [...s.user.achievements];
          if (!newAchievements.includes('first_lesson')) newAchievements.push('first_lesson');
          if (perfect && !newAchievements.includes('perfect_lesson')) newAchievements.push('perfect_lesson');
          if (allDone && !newAchievements.includes('topic_complete')) newAchievements.push('topic_complete');
          const addedId = newAchievements.find(id => !s.user.achievements.includes(id));
          const newAchievement = addedId ? ACHIEVEMENTS.find(a => a.id === addedId) ?? null : s.newAchievement;
          return { user: { ...s.user, completedLessons, completedTopics, achievements: newAchievements }, newAchievement };
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
          if (today === last) return {};
          const newStreak = last === yesterday ? s.user.streak + 1 : 1;
          const newAchievements = [...s.user.achievements];
          if (newStreak >= 3  && !newAchievements.includes('streak_3'))  newAchievements.push('streak_3');
          if (newStreak >= 7  && !newAchievements.includes('streak_7'))  newAchievements.push('streak_7');
          if (newStreak >= 30 && !newAchievements.includes('streak_30')) newAchievements.push('streak_30');
          const addedId = newAchievements.find(id => !s.user.achievements.includes(id));
          const newAchievement = addedId ? ACHIEVEMENTS.find(a => a.id === addedId) ?? null : s.newAchievement;
          return { user: { ...s.user, streak: newStreak, lastActiveDate: new Date().toISOString(), achievements: newAchievements }, newAchievement };
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
      resetProgress: () => set({ user: { ...defaultUser, friends: MOCK_FRIENDS }, isOnboardingComplete: false }),
      toggleDarkMode: () => set(s => ({ isDarkMode: !s.isDarkMode })),
    }),
    {
      name: 'teoricob-v2',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ user: s.user, isOnboardingComplete: s.isOnboardingComplete, dailyChallenge: s.dailyChallenge, isDarkMode: s.isDarkMode }),
      merge: (persisted: any, current) => ({
        ...current,
        ...persisted,
        user: { ...defaultUser, ...(persisted as any)?.user, friends: MOCK_FRIENDS },
      }),
    }
  )
);
