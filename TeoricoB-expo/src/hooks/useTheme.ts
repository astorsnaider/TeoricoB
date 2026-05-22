import { useStore } from '../store/useStore';
import { lightTheme, darkTheme, AppTheme } from '../theme';

export function useTheme(): AppTheme {
  const isDarkMode = useStore(s => s.isDarkMode);
  return isDarkMode ? darkTheme : lightTheme;
}
