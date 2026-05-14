import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useStore } from './src/store/useStore';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import LearnScreen from './src/screens/LearnScreen';
import LeagueScreen from './src/screens/LeagueScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { COLORS, SHADOWS } from './src/theme';

type Tab = 'home' | 'learn' | 'league' | 'profile';

const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: 'home',    label: 'Inicio',   emoji: '🏠' },
  { key: 'learn',   label: 'Aprender', emoji: '📚' },
  { key: 'league',  label: 'Liga',     emoji: '🏆' },
  { key: 'profile', label: 'Perfil',   emoji: '👤' },
];

export default function App() {
  const isOnboardingComplete = useStore(s => s.isOnboardingComplete);
  const generateLeagueStandings = useStore(s => s.generateLeagueStandings);
  const generateDailyChallenge = useStore(s => s.generateDailyChallenge);
  const dailyChallenge = useStore(s => s.dailyChallenge);
  const newAchievement = useStore(s => s.newAchievement);
  const clearNewAchievement = useStore(s => s.clearNewAchievement);
  const [activeTab, setActiveTab] = React.useState<Tab>('home');

  useEffect(() => {
    if (isOnboardingComplete) {
      generateLeagueStandings();
      if (!dailyChallenge) generateDailyChallenge();
    }
  }, [isOnboardingComplete]);

  if (!isOnboardingComplete) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <OnboardingScreen />
      </SafeAreaProvider>
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':    return <HomeScreen />;
      case 'learn':   return <LearnScreen />;
      case 'league':  return <LeagueScreen />;
      case 'profile': return <ProfileScreen />;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />

      {newAchievement && (
        <View style={styles.toast}>
          <Text style={styles.toastEmoji}>{newAchievement.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.toastTitle}>¡Logro desbloqueado!</Text>
            <Text style={styles.toastName}>{newAchievement.name}</Text>
          </View>
          <TouchableOpacity onPress={clearNewAchievement}>
            <Text style={{ color: '#fff', fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ flex: 1 }}>
        {renderScreen()}
      </View>

      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabEmoji, activeTab === tab.key && styles.tabEmojiActive]}>
              {tab.emoji}
            </Text>
            <Text style={[styles.tabLabel, activeTab === tab.key && { color: COLORS.primary, fontWeight: '700' }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row', backgroundColor: COLORS.card,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    paddingBottom: 20, paddingTop: 10, ...SHADOWS.medium,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 2 },
  tabEmoji: { fontSize: 22, opacity: 0.4 },
  tabEmojiActive: { opacity: 1 },
  tabLabel: { fontSize: 10, color: COLORS.secondary },
  toast: {
    position: 'absolute', top: 60, left: 16, right: 16, zIndex: 999,
    backgroundColor: COLORS.dark, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12, ...SHADOWS.medium,
  },
  toastEmoji: { fontSize: 28 },
  toastTitle: { color: '#fff', fontSize: 11, opacity: 0.7 },
  toastName: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
