import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from './src/store/useStore';
import { useTheme } from './src/hooks/useTheme';
import OnboardingScreen from './src/screens/OnboardingScreen';
import DisclaimerScreen from './src/screens/DisclaimerScreen';
import HomeScreen from './src/screens/HomeScreen';
import LearnScreen from './src/screens/LearnScreen';
import ManualScreen from './src/screens/ManualScreen';
import LeagueScreen from './src/screens/LeagueScreen';
import ProfileScreen from './src/screens/ProfileScreen';

type Tab = 'home' | 'learn' | 'manual' | 'league' | 'profile';

interface TabDef {
  key: Tab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}

const TABS: TabDef[] = [
  { key: 'home',    label: 'Inicio',   icon: 'home-outline',          iconActive: 'home' },
  { key: 'learn',   label: 'Aprender', icon: 'book-outline',          iconActive: 'book' },
  { key: 'manual',  label: 'Manual',   icon: 'document-text-outline', iconActive: 'document-text' },
  { key: 'league',  label: 'Liga',     icon: 'trophy-outline',        iconActive: 'trophy' },
  { key: 'profile', label: 'Perfil',   icon: 'person-outline',        iconActive: 'person' },
];

export default function App() {
  const isOnboardingComplete = useStore(s => s.isOnboardingComplete);
  const disclaimerAccepted = useStore(s => s.disclaimerAccepted);
  const generateLeagueStandings = useStore(s => s.generateLeagueStandings);
  const generateDailyChallenge = useStore(s => s.generateDailyChallenge);
  const dailyChallenge = useStore(s => s.dailyChallenge);
  const newAchievement = useStore(s => s.newAchievement);
  const clearNewAchievement = useStore(s => s.clearNewAchievement);
  const isDarkMode = useStore(s => s.isDarkMode);

  const [activeTab, setActiveTab] = React.useState<Tab>('home');
  const theme = useTheme();
  const requestedManualChapter = useStore(s => s.requestedManualChapter);

  useEffect(() => {
    if (isOnboardingComplete && disclaimerAccepted) {
      generateLeagueStandings();
      if (!dailyChallenge) generateDailyChallenge();
    }
  }, [isOnboardingComplete, disclaimerAccepted]);

  // Si una pantalla solicita abrir un capítulo del manual, cambia al tab Manual
  useEffect(() => {
    if (requestedManualChapter) setActiveTab('manual');
  }, [requestedManualChapter]);

  // Disclaimer first — legally required acceptance before any use
  if (!disclaimerAccepted) {
    return (
      <SafeAreaProvider>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <DisclaimerScreen />
      </SafeAreaProvider>
    );
  }

  if (!isOnboardingComplete) {
    return (
      <SafeAreaProvider>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <OnboardingScreen />
      </SafeAreaProvider>
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':    return <HomeScreen />;
      case 'learn':   return <LearnScreen />;
      case 'manual':  return <ManualScreen />;
      case 'league':  return <LeagueScreen />;
      case 'profile': return <ProfileScreen />;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* Achievement toast */}
      {newAchievement && (
        <View style={[styles.toast, { backgroundColor: theme.card }]}>
          <View style={[styles.toastIcon, { backgroundColor: theme.primary + '20' }]}>
            <Ionicons name="star" size={22} color={theme.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.toastTitle, { color: theme.textSecondary }]}>Logro desbloqueado</Text>
            <Text style={[styles.toastName, { color: theme.textPrimary }]}>{newAchievement.name}</Text>
          </View>
          <TouchableOpacity onPress={clearNewAchievement} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        {renderScreen()}
      </View>

      {/* Tab bar */}
      <View style={[styles.tabBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        {TABS.map(tab => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={active ? tab.iconActive : tab.icon}
                size={22}
                color={active ? theme.primary : theme.textTertiary}
              />
              <Text style={[styles.tabLabel, { color: active ? theme.primary : theme.textTertiary, fontWeight: active ? '700' : '400' }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    paddingBottom: 24,
    paddingTop: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 3 },
  tabLabel: { fontSize: 10 },
  toast: {
    position: 'absolute', top: 56, left: 16, right: 16, zIndex: 999,
    borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  toastIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  toastTitle: { fontSize: 11 },
  toastName: { fontSize: 14, fontWeight: '700', marginTop: 1 },
});
