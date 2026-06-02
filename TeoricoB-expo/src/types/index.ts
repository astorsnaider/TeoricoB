export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  legalRef?: string;   // e.g. "Art. 132 RGC"
  category: string;
  signId?: string;     // ID de señal SVG a mostrar (de TrafficSign.tsx)
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  difficulty: 'Básico' | 'Intermedio' | 'Avanzado';
  questions: Question[];
}

export interface Topic {
  id: string;
  name: string;
  emoji: string;
  description: string;
  colorHex: string;
  lessons: Lesson[];
}

export type LeagueType =
  | 'Bronce' | 'Plata' | 'Oro' | 'Zafiro'
  | 'Rubí' | 'Esmeralda' | 'Amatista' | 'Diamante';

export interface Friend {
  name: string;
  avatarEmoji: string;
  xp: number;
  streak: number;
  league: LeagueType;
}

export interface TopicStat {
  correct: number;
  total: number;
}

export interface ExamResult {
  date: string;           // ISO timestamp
  totalQuestions: number; // siempre 30
  correctCount: number;
  wrongCount: number;
  timeElapsed: number;    // segundos
  passed: boolean;        // true si <= 3 fallos y termino a tiempo
}

export interface MistakeEntry {
  questionId: string;
  category: string;
  failedAt: string;     // ISO timestamp del último fallo
  attempts: number;     // veces que ha fallado esta pregunta
  recoveriesNeeded: number; // aciertos consecutivos restantes para limpiar (default 2)
}

export interface UserState {
  name: string;
  avatarEmoji: string;     // hex color (legacy field name)
  profilePhotoUri?: string; // optional photo URI (overrides color)
  xp: number;
  streak: number;
  hearts: number;
  maxHearts: number;
  lastHeartRegenTime: string;
  league: LeagueType;
  leagueXP: number;
  completedLessons: string[];
  completedTopics: string[];
  achievements: string[];
  lastActiveDate: string;
  totalCorrect: number;
  totalAnswered: number;
  weeklyXP: number;
  gems: number;
  friends: Friend[];
  topicStats: Record<string, TopicStat>;  // accuracy por categoria de pregunta
  examHistory: ExamResult[];               // ultimos 50 examenes
  mistakes: MistakeEntry[];                // preguntas falladas para repaso (spaced repetition simple)
  streakFreezeActiveUntil?: string;        // ISO date hasta cuándo dura el freeze actual
  streakFreezesUsedThisMonth: number;      // contador resetable cada mes (límite 3)
  streakFreezesMonthKey: string;           // 'YYYY-MM' para detectar cambio de mes
  dailyQuestStreak: number;                // días seguidos con TODAS las quests completadas
  lastDailyQuestStreakDate?: string;       // YYYY-MM-DD del último día con quests completas
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  rewardGems?: number;  // gemas que se otorgan al desbloquear
  rewardXP?: number;    // XP extra (opcional)
}

export interface LeagueStanding {
  name: string;
  avatarEmoji: string;
  xp: number;
  rank: number;
  isCurrentUser: boolean;
}

export interface DailyChallenge {
  date: string;
  questions: Question[];
  isCompleted: boolean;
  xpReward: number;
}

export type DailyQuestId = 'xp_30' | 'lesson_1' | 'correct_15';

export interface DailyQuest {
  id: DailyQuestId;
  label: string;        // texto del quest, ej. "Gana 30 XP hoy"
  emoji: string;
  goal: number;
  progress: number;
  rewardGems: number;
  claimed: boolean;
}

export interface DailyQuests {
  date: string;         // 'YYYY-MM-DD' del día en que se generó
  quests: DailyQuest[];
}

// Configuración de notificaciones
export interface NotificationsConfig {
  enabled: boolean;
  reminderHour: number;       // 0-23
  reminderMinute: number;     // 0-59
  reminderEnabled: boolean;
  streakDangerEnabled: boolean;
  heartsFullEnabled: boolean;
  questsEnabled: boolean;
}
