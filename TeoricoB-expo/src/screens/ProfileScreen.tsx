import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useStore, getAllAchievements, getLeagueInfo } from '../store/useStore';
import { COLORS, SHADOWS } from '../theme';

export default function ProfileScreen() {
  const user = useStore(s => s.user);
  const topics = useStore(s => s.topics);
  const resetProgress = useStore(s => s.resetProgress);
  const league = getLeagueInfo(user.league);
  const achievements = getAllAchievements().map(a => ({ ...a, isUnlocked: user.achievements.includes(a.id) }));
  const accuracy = user.totalAnswered > 0 ? Math.round((user.totalCorrect / user.totalAnswered) * 100) : 0;
  const totalLessons = topics.reduce((a, t) => a + t.lessons.length, 0);
  const completedLessons = user.completedLessons.length;

  const confirmReset = () => {
    Alert.alert('Reiniciar progreso', '¿Seguro que quieres borrar todo tu progreso?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sí, reiniciar', style: 'destructive', onPress: resetProgress },
    ]);
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* Avatar & name */}
        <View style={s.profileHeader}>
          <View style={[s.avatarCircle, { borderColor: league.color }]}>
            <Text style={s.avatarEmoji}>{user.avatarEmoji}</Text>
          </View>
          <Text style={s.profileName}>{user.name}</Text>
          <View style={s.leagueBadge}>
            <Text style={{ fontSize: 16 }}>{league.emoji}</Text>
            <Text style={[s.leagueTxt, { color: league.color }]}>Liga {user.league}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={s.statsGrid}>
          <StatBox emoji="⭐" label="XP Total" value={`${user.xp}`} />
          <StatBox emoji="🔥" label="Racha" value={`${user.streak} días`} />
          <StatBox emoji="✅" label="Lecciones" value={`${completedLessons}/${totalLessons}`} />
          <StatBox emoji="🎯" label="Aciertos" value={`${accuracy}%`} />
          <StatBox emoji="❤️" label="Vidas" value={`${user.hearts}/${user.maxHearts}`} />
          <StatBox emoji="💎" label="Gemas" value={`${user.gems}`} />
        </View>

        {/* Progress by topic */}
        <Text style={s.sectionTitle}>Progreso por tema</Text>
        <View style={[s.card, { gap: 12 }]}>
          {topics.map(topic => {
            const done = topic.lessons.filter(l => user.completedLessons.includes(l.id)).length;
            const total = topic.lessons.length;
            const pct = total > 0 ? done / total : 0;
            return (
              <View key={topic.id} style={s.topicRow}>
                <Text style={{ fontSize: 20, width: 28 }}>{topic.emoji}</Text>
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={s.topicName}>{topic.name}</Text>
                    <Text style={s.topicPct}>{done}/{total}</Text>
                  </View>
                  <View style={s.progBg}>
                    <View style={[s.progFill, { width: `${pct * 100}%`, backgroundColor: topic.colorHex }]} />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Achievements */}
        <Text style={s.sectionTitle}>Logros ({achievements.filter(a => a.isUnlocked).length}/{achievements.length})</Text>
        <View style={s.achievementsGrid}>
          {achievements.map(a => (
            <View key={a.id} style={[s.achievementCard, !a.isUnlocked && s.achievementLocked, SHADOWS.small]}>
              <Text style={[s.achievementEmoji, !a.isUnlocked && { opacity: 0.3 }]}>{a.emoji}</Text>
              <Text style={[s.achievementName, !a.isUnlocked && { opacity: 0.4 }]} numberOfLines={2}>{a.name}</Text>
            </View>
          ))}
        </View>

        {/* Reset button */}
        <TouchableOpacity style={s.resetBtn} onPress={confirmReset}>
          <Text style={s.resetTxt}>Reiniciar progreso</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <View style={[sb.box, SHADOWS.small]}>
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text style={sb.value}>{value}</Text>
      <Text style={sb.label}>{label}</Text>
    </View>
  );
}
const sb = StyleSheet.create({
  box: { width: '30%', backgroundColor: COLORS.card, borderRadius: 14, padding: 12, alignItems: 'center', gap: 3 },
  value: { fontSize: 15, fontWeight: '800', color: COLORS.dark },
  label: { fontSize: 11, color: COLORS.secondary, textAlign: 'center' },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, gap: 14 },
  profileHeader: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  avatarCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', borderWidth: 3, ...SHADOWS.medium },
  avatarEmoji: { fontSize: 44 },
  profileName: { fontSize: 24, fontWeight: '800', color: COLORS.dark },
  leagueBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, ...SHADOWS.small },
  leagueTxt: { fontSize: 14, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.dark },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, ...SHADOWS.small },
  topicRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topicName: { fontSize: 13, fontWeight: '600', color: COLORS.dark },
  topicPct: { fontSize: 12, color: COLORS.secondary },
  progBg: { height: 5, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  progFill: { height: 5, borderRadius: 3 },
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achievementCard: { width: '30%', backgroundColor: COLORS.card, borderRadius: 14, padding: 12, alignItems: 'center', gap: 4 },
  achievementLocked: { backgroundColor: COLORS.bg },
  achievementEmoji: { fontSize: 28 },
  achievementName: { fontSize: 11, fontWeight: '600', color: COLORS.dark, textAlign: 'center' },
  resetBtn: { borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.wrong, padding: 14, alignItems: 'center' },
  resetTxt: { color: COLORS.wrong, fontSize: 15, fontWeight: '600' },
});
