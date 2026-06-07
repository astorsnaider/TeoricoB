import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TabPager, { TabPagerHandle } from './src/components/TabPager';
import { PagerControlProvider, usePagerControl } from './src/components/PagerControl';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from './src/store/useStore';
import { useTheme } from './src/hooks/useTheme';
import { useSoundEffect } from './src/audio/useSoundEffect';
import { requestPermissions as requestNotifPermissions, syncNotifications } from './src/notifications/scheduler';
import { AchievementUnlockModal } from './src/components/AchievementUnlockModal';
import { AuthProvider } from './src/auth/AuthContext';
import { useAutoSync } from './src/sync/useAutoSync';
import OnboardingScreen from './src/screens/OnboardingScreen';
import TutorialScreen from './src/screens/TutorialScreen';
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
  return (
    <AuthProvider>
      <PagerControlProvider>
        <AppContent />
      </PagerControlProvider>
    </AuthProvider>
  );
}

function AppContent() {
  useAutoSync();
  const isOnboardingComplete = useStore(s => s.isOnboardingComplete);
  const tutorialSeen = useStore(s => s.tutorialSeen);
  const disclaimerAccepted = useStore(s => s.disclaimerAccepted);
  const generateLeagueStandings = useStore(s => s.generateLeagueStandings);
  const generateDailyChallenge = useStore(s => s.generateDailyChallenge);
  const generateDailyQuests = useStore(s => s.generateDailyQuests);
  const tickHeartRegen = useStore(s => s.tickHeartRegen);
  const dailyChallenge = useStore(s => s.dailyChallenge);
  const newAchievement = useStore(s => s.newAchievement);
  const clearNewAchievement = useStore(s => s.clearNewAchievement);
  const isDarkMode = useStore(s => s.isDarkMode);

  const [activeTab, setActiveTab] = React.useState<Tab>('home');
  const theme = useTheme();
  const requestedManualChapter = useStore(s => s.requestedManualChapter);
  const pagerRef = useRef<TabPagerHandle>(null);
  const { enabled: pagerEnabled } = usePagerControl();

  const goToTab = (tab: Tab) => {
    const idx = TABS.findIndex(t => t.key === tab);
    if (idx >= 0) pagerRef.current?.setPage(idx);
    setActiveTab(tab);
  };

  useEffect(() => {
    if (isOnboardingComplete && disclaimerAccepted) {
      generateLeagueStandings();
      const today = new Date().toISOString().slice(0, 10);
      if (!dailyChallenge || dailyChallenge.date.slice(0, 10) !== today) generateDailyChallenge();
      generateDailyQuests();
      tickHeartRegen();
    }
  }, [isOnboardingComplete, disclaimerAccepted, dailyChallenge, generateDailyChallenge, generateDailyQuests, generateLeagueStandings, tickHeartRegen]);

  useEffect(() => {
    if (!isOnboardingComplete || !disclaimerAccepted) return;
    const timer = setInterval(() => {
      const today = new Date().toISOString().slice(0, 10);
      tickHeartRegen();
      generateDailyQuests();
      if (!dailyChallenge || dailyChallenge.date.slice(0, 10) !== today) generateDailyChallenge();
    }, 60 * 1000);
    return () => clearInterval(timer);
  }, [isOnboardingComplete, disclaimerAccepted, dailyChallenge, generateDailyChallenge, generateDailyQuests, tickHeartRegen]);

  // Si una pantalla solicita abrir un capítulo del manual, cambia al tab Manual
  useEffect(() => {
    if (requestedManualChapter) goToTab('manual');
  }, [requestedManualChapter]);

  // ── Cableado global de sonidos basado en cambios del store ─────────────
  const playSound = useSoundEffect();
  const user = useStore(s => s.user);
  const prevHeartsRef = useRef(user.hearts);
  const prevLeagueRef = useRef(user.league);
  const prevStreakRef = useRef(user.streak);
  const prevAchievementRef = useRef<typeof newAchievement>(null);

  // Nuevo logro desbloqueado
  useEffect(() => {
    if (newAchievement && prevAchievementRef.current?.id !== newAchievement.id) {
      playSound('achievement');
    }
    prevAchievementRef.current = newAchievement;
  }, [newAchievement, playSound]);

  // Cambio de liga (subida de nivel)
  useEffect(() => {
    if (user.league !== prevLeagueRef.current) {
      // Solo si subió (la app no degrada manualmente)
      playSound('levelup');
      prevLeagueRef.current = user.league;
    }
  }, [user.league, playSound]);

  // Cambio de vidas
  useEffect(() => {
    const prev = prevHeartsRef.current;
    if (user.hearts < prev) playSound('heartLose');
    else if (user.hearts > prev) playSound('heartGain');
    prevHeartsRef.current = user.hearts;
  }, [user.hearts, playSound]);

  // Racha incrementada al completar lección / reto diario
  useEffect(() => {
    if (user.streak > prevStreakRef.current) {
      playSound('streak');
    }
    prevStreakRef.current = user.streak;
  }, [user.streak, playSound]);

  // ── Notificaciones locales (solo móvil; en web los stubs no hacen nada) ──
  const notifications = useStore(s => s.notifications);
  const minutesToNextHeart = useStore(s => s.minutesToNextHeart);
  const notifPermissionAskedRef = useRef(false);

  // Pedir permisos UNA vez cuando el user habilita notifs por primera vez
  useEffect(() => {
    if (!isOnboardingComplete || !disclaimerAccepted) return;
    if (!notifications.enabled) return;
    if (notifPermissionAskedRef.current) return;
    notifPermissionAskedRef.current = true;
    requestNotifPermissions().catch(() => undefined);
  }, [isOnboardingComplete, disclaimerAccepted, notifications.enabled]);

  // Re-sincronizar el plan de notificaciones cuando cambia la config o el
  // estado relevante (racha, vidas faltantes).
  useEffect(() => {
    if (!isOnboardingComplete || !disclaimerAccepted) return;
    const minutesUntilFull = user.hearts >= user.maxHearts
      ? 0
      : (user.maxHearts - user.hearts) * 30 - (30 - minutesToNextHeart());
    syncNotifications({
      config: notifications,
      streak: user.streak,
      minutesUntilHeartsFull: Math.max(0, minutesUntilFull),
    }).catch(() => undefined);
  }, [
    isOnboardingComplete,
    disclaimerAccepted,
    notifications,
    user.streak,
    user.hearts,
    user.maxHearts,
    minutesToNextHeart,
  ]);

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

  if (!tutorialSeen) {
    return (
      <SafeAreaProvider>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <TutorialScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />

        {/* Achievement modal animado */}
        <AchievementUnlockModal achievement={newAchievement} onClose={clearNewAchievement} />

        <TabPager
          ref={pagerRef}
          style={{ flex: 1, backgroundColor: theme.bg }}
          initialPage={0}
          scrollEnabled={pagerEnabled}
          onPageSelected={position => {
            const key = TABS[position]?.key;
            if (key && key !== activeTab) setActiveTab(key);
          }}
        >
          <View key="home"    style={{ flex: 1 }}><HomeScreen /></View>
          <View key="learn"   style={{ flex: 1 }}><LearnScreen /></View>
          <View key="manual"  style={{ flex: 1 }}><ManualScreen /></View>
          <View key="league"  style={{ flex: 1 }}><LeagueScreen /></View>
          <View key="profile" style={{ flex: 1 }}><ProfileScreen /></View>
        </TabPager>

        {/* Tab bar */}
        <View style={[styles.tabBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          {TABS.map(tab => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabItem}
                onPress={() => goToTab(tab.key)}
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
    </GestureHandlerRootView>
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
});
