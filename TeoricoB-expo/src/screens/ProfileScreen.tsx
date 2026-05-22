import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore, getAllAchievements, getLeagueInfo } from '../store/useStore';
import { useTheme } from '../hooks/useTheme';
import { SHADOWS } from '../theme';

export default function ProfileScreen() {
  const user = useStore(s => s.user);
  const topics = useStore(s => s.topics);
  const resetProgress = useStore(s => s.resetProgress);
  const isDarkMode = useStore(s => s.isDarkMode);
  const toggleDarkMode = useStore(s => s.toggleDarkMode);
  const theme = useTheme();

  const league = getLeagueInfo(user.league);
  const achievements = getAllAchievements().map(a => ({ ...a, isUnlocked: user.achievements.includes(a.id) }));
  const accuracy = user.totalAnswered > 0 ? Math.round((user.totalCorrect / user.totalAnswered) * 100) : 0;
  const totalLessons = topics.reduce((a, t) => a + t.lessons.length, 0);

  const confirmReset = () => {
    Alert.alert('Reiniciar progreso', '¿Seguro que quieres borrar todo tu progreso?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Reiniciar', style: 'destructive', onPress: resetProgress },
    ]);
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* Avatar */}
        <View style={s.profileHeader}>
          <View style={[s.avatarCircle, { borderColor: league.color, backgroundColor: theme.card }]}>
            <Text style={s.avatarEmoji}>{user.avatarEmoji}</Text>
          </View>
          <Text style={[s.profileName, { color: theme.textPrimary }]}>{user.name}</Text>
          <View style={[s.leagueBadge, { backgroundColor: league.color + '18' }]}>
            <Text style={{ fontSize: 14 }}>{league.emoji}</Text>
            <Text style={[s.leagueTxt, { color: league.color }]}>Liga {user.league}</Text>
          </View>
        </View>

        {/* Stats grid */}
        <View style={s.statsGrid}>
          {[
            { icon: 'star' as const,       label: 'XP Total',    value: `${user.xp}`,                    color: theme.yellow },
            { icon: 'flame' as const,       label: 'Racha',       value: `${user.streak} días`,            color: theme.orange },
            { icon: 'checkbox' as const,    label: 'Lecciones',   value: `${user.completedLessons.length}/${totalLessons}`, color: theme.correct },
            { icon: 'stats-chart' as const, label: 'Aciertos',    value: `${accuracy}%`,                  color: theme.blue },
            { icon: 'heart' as const,       label: 'Vidas',       value: `${user.hearts}/${user.maxHearts}`, color: theme.wrong },
            { icon: 'diamond' as const,     label: 'Gemas',       value: `${user.gems}`,                  color: '#9C27B0' },
          ].map(({ icon, label, value, color }) => (
            <View key={label} style={[s.statBox, { backgroundColor: theme.card }, SHADOWS.small]}>
              <Ionicons name={icon} size={20} color={color} />
              <Text style={[s.statValue, { color: theme.textPrimary }]}>{value}</Text>
              <Text style={[s.statLabel, { color: theme.textSecondary }]}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Topic progress */}
        <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>Progreso por tema</Text>
        <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {topics.map(topic => {
            const done = topic.lessons.filter(l => user.completedLessons.includes(l.id)).length;
            const total = topic.lessons.length;
            const pct = total > 0 ? done / total : 0;
            return (
              <View key={topic.id} style={[s.topicRow, { borderBottomColor: theme.border }]}>
                <View style={[s.topicColorDot, { backgroundColor: topic.colorHex }]} />
                <View style={{ flex: 1, gap: 3 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[s.topicName, { color: theme.textPrimary }]}>{topic.name}</Text>
                    <Text style={[s.topicPct, { color: theme.textSecondary }]}>{done}/{total}</Text>
                  </View>
                  <View style={[s.progBg, { backgroundColor: theme.bg2 }]}>
                    <View style={[s.progFill, { width: `${pct * 100}%`, backgroundColor: topic.colorHex }]} />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Achievements */}
        <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>
          Logros ({achievements.filter(a => a.isUnlocked).length}/{achievements.length})
        </Text>
        <View style={s.achievementsGrid}>
          {achievements.map(a => (
            <View
              key={a.id}
              style={[s.achievementCard, { backgroundColor: a.isUnlocked ? theme.card : theme.bg2, borderColor: a.isUnlocked ? theme.border : 'transparent' }, SHADOWS.small]}
            >
              <Text style={[s.achievementEmoji, !a.isUnlocked && { opacity: 0.2 }]}>{a.emoji}</Text>
              <Text style={[s.achievementName, { color: a.isUnlocked ? theme.textPrimary : theme.textTertiary }]} numberOfLines={2}>
                {a.name}
              </Text>
            </View>
          ))}
        </View>

        {/* Settings */}
        <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>Ajustes</Text>
        <View style={[s.settingsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={s.settingRow}>
            <Ionicons name="moon-outline" size={20} color={theme.textSecondary} />
            <Text style={[s.settingLabel, { color: theme.textPrimary }]}>Modo oscuro</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: theme.border, true: theme.primary + '80' }}
              thumbColor={isDarkMode ? theme.primary : theme.textTertiary}
            />
          </View>
        </View>

        {/* Reset */}
        <TouchableOpacity
          style={[s.resetBtn, { borderColor: theme.wrong }]}
          onPress={confirmReset}
        >
          <Ionicons name="trash-outline" size={18} color={theme.wrong} />
          <Text style={[s.resetTxt, { color: theme.wrong }]}>Reiniciar progreso</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 12 },
  profileHeader: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  avatarCircle: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 3, ...SHADOWS.medium },
  avatarEmoji: { fontSize: 44 },
  profileName: { fontSize: 22, fontWeight: '800' },
  leagueBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6 },
  leagueTxt: { fontSize: 14, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  statBox: { width: '30%', borderRadius: 14, padding: 12, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 14, fontWeight: '800' },
  statLabel: { fontSize: 10, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  card: { borderRadius: 14, overflow: 'hidden', borderWidth: 1 },
  topicRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderBottomWidth: 0.5 },
  topicColorDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  topicName: { fontSize: 13, fontWeight: '600' },
  topicPct: { fontSize: 12 },
  progBg: { height: 5, borderRadius: 3, overflow: 'hidden' },
  progFill: { height: 5, borderRadius: 3 },
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achievementCard: { width: '30%', borderRadius: 14, padding: 12, alignItems: 'center', gap: 4, borderWidth: 1 },
  achievementEmoji: { fontSize: 26 },
  achievementName: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
  settingsCard: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  settingLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, borderWidth: 1.5, padding: 14 },
  resetTxt: { fontSize: 15, fontWeight: '600' },
});
