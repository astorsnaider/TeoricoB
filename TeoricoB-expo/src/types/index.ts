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
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
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
