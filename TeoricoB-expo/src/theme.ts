export interface AppTheme {
  bg: string;
  bg2: string;
  card: string;
  cardAlt: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  primary: string;
  correct: string;
  wrong: string;
  yellow: string;
  orange: string;
  blue: string;
  heading: string;
  isDark: boolean;
}

export const lightTheme: AppTheme = {
  bg:           '#F2F2F7',
  bg2:          '#E5E5EA',
  card:         '#FFFFFF',
  cardAlt:      '#F9F9F9',
  textPrimary:  '#1C1C1E',
  textSecondary:'#6D6D72',
  textTertiary: '#AEAEB2',
  border:       '#E5E5EA',
  primary:      '#E63946',
  correct:      '#06D6A0',
  wrong:        '#EF476F',
  yellow:       '#FFD166',
  orange:       '#F4A261',
  blue:         '#457B9D',
  heading:      '#1C1C1E',
  isDark:       false,
};

export const darkTheme: AppTheme = {
  bg:           '#000000',
  bg2:          '#1C1C1E',
  card:         '#1C1C1E',
  cardAlt:      '#2C2C2E',
  textPrimary:  '#FFFFFF',
  textSecondary:'#AEAEB2',
  textTertiary: '#636366',
  border:       '#3A3A3C',
  primary:      '#FF453A',
  correct:      '#30D158',
  wrong:        '#FF453A',
  yellow:       '#FFD60A',
  orange:       '#FF9F0A',
  blue:         '#0A84FF',
  heading:      '#FFFFFF',
  isDark:       true,
};

// Legacy COLORS export for backward compatibility (uses light theme)
export const COLORS = {
  primary:   lightTheme.primary,
  orange:    lightTheme.orange,
  yellow:    lightTheme.yellow,
  green:     lightTheme.correct,
  blue:      lightTheme.blue,
  correct:   lightTheme.correct,
  wrong:     lightTheme.wrong,
  bg:        lightTheme.bg,
  card:      lightTheme.card,
  dark:      lightTheme.heading,
  secondary: lightTheme.textSecondary,
  border:    lightTheme.border,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 5,
  },
};
