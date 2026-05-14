import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore, getLeagueInfo, LEAGUES } from '../store/useStore';
import { COLORS, SHADOWS } from '../theme';
import { LeagueType } from '../types';

export default function LeagueScreen() {
  const user = useStore(s => s.user);
  const standings = useStore(s => s.leagueStandings);
  const league = getLeagueInfo(user.league);
  const allLeagues = LEAGUES;
  const leagueIdx = allLeagues.findIndex(l => l.name === user.league);
  const nextLeague = leagueIdx < allLeagues.length - 1 ? allLeagues[leagueIdx + 1] : null;
  const xpToNext = nextLeague ? nextLeague.xpRequired - user.xp : 0;
  const promoPct = nextLeague ? Math.min(1, user.xp / nextLeague.xpRequired) : 1;
  const friends = user.friends ?? [];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* League header */}
        <LinearGradient
          colors={[league.color + '30', league.color + '08']}
          style={s.leagueHeader}
        >
          <Text style={s.leagueEmoji}>{league.emoji}</Text>
          <Text style={[s.leagueName, { color: league.color }]}>Liga {user.league}</Text>
          {nextLeague ? (
            <>
              <Text style={s.leagueSub}>
                Te faltan <Text style={{ color: league.color, fontWeight: '700' }}>{xpToNext} XP</Text> para{' '}
                {nextLeague.emoji} {nextLeague.name}
              </Text>
              <View style={s.promoBg}>
                <View style={[s.promoFill, { width: `${promoPct * 100}%`, backgroundColor: league.color }]} />
              </View>
            </>
          ) : (
            <Text style={s.leagueSub}>¡Estás en la liga más alta! 👑</Text>
          )}
        </LinearGradient>

        {/* Weekly ranking */}
        <Text style={s.sectionTitle}>Clasificación semanal</Text>
        <View style={[s.card, SHADOWS.small]}>
          {standings.map((st, i) => (
            <View
              key={`standing-${i}`}
              style={[s.rankRow, st.isCurrentUser && { backgroundColor: league.color + '12' }, i < standings.length - 1 && s.rankDivider]}
            >
              <View style={s.rankPos}>
                {i === 0 ? <Text style={s.medal}>🥇</Text>
                  : i === 1 ? <Text style={s.medal}>🥈</Text>
                  : i === 2 ? <Text style={s.medal}>🥉</Text>
                  : <Text style={s.rankNum}>#{st.rank}</Text>}
              </View>
              <Text style={s.rankAvatar}>{st.avatarEmoji}</Text>
              <Text style={[s.rankName, st.isCurrentUser && { fontWeight: '800', color: league.color }]} numberOfLines={1}>
                {st.name}{st.isCurrentUser ? ' (tú)' : ''}
              </Text>
              <Text style={[s.rankXP, st.isCurrentUser && { color: league.color }]}>{st.xp} XP</Text>
            </View>
          ))}
        </View>

        {/* Friends */}
        {friends.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Amigos</Text>
            <View style={[s.card, SHADOWS.small]}>
              {friends.slice(0, 4).map((f, i) => {
                const fi = getLeagueInfo(f.league as LeagueType);
                return (
                  <View key={`friend-${i}`} style={[s.rankRow, i < Math.min(3, friends.length - 1) && s.rankDivider]}>
                    <Text style={s.rankAvatar}>{f.avatarEmoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.rankName}>{f.name}</Text>
                      <Text style={s.friendMeta}>{fi.emoji} {f.league} · 🔥 {f.streak} días</Text>
                    </View>
                    <Text style={s.rankXP}>{f.xp} XP</Text>
                  </View>
                );
              })}
              <View style={s.inviteRow}>
                <Text style={s.inviteTxt}>📨 Invitar amigos — próximamente</Text>
              </View>
            </View>
          </>
        )}

        {/* All leagues map */}
        <Text style={s.sectionTitle}>Todas las ligas</Text>
        <View style={s.leaguesGrid}>
          {allLeagues.map((lg) => {
            const isCurrent = lg.name === user.league;
            const isUnlocked = user.xp >= lg.xpRequired;
            return (
              <View
                key={lg.name}
                style={[s.leagueTile, isCurrent && { borderColor: lg.color, borderWidth: 2 }, !isUnlocked && { opacity: 0.35 }]}
              >
                <Text style={{ fontSize: 28 }}>{lg.emoji}</Text>
                <Text style={[s.leagueTileName, isCurrent && { color: lg.color }]}>{lg.name}</Text>
                <Text style={s.leagueTileXP}>{lg.xpRequired > 0 ? `${lg.xpRequired} XP` : 'Inicial'}</Text>
                {isCurrent && <View style={[s.currentDot, { backgroundColor: lg.color }]} />}
              </View>
            );
          })}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, gap: 14 },
  leagueHeader: { borderRadius: 20, padding: 24, alignItems: 'center', gap: 8 },
  leagueEmoji: { fontSize: 60 },
  leagueName: { fontSize: 26, fontWeight: '800' },
  leagueSub: { fontSize: 14, color: COLORS.secondary, textAlign: 'center' },
  promoBg: { width: '100%', height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden', marginTop: 4 },
  promoFill: { height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.dark },
  card: { backgroundColor: COLORS.card, borderRadius: 16 },
  rankRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  rankDivider: { borderBottomWidth: 1, borderColor: COLORS.border },
  rankPos: { width: 30, alignItems: 'center' },
  medal: { fontSize: 20 },
  rankNum: { fontSize: 13, fontWeight: '700', color: COLORS.secondary },
  rankAvatar: { fontSize: 22 },
  rankName: { flex: 1, fontSize: 14, color: COLORS.dark },
  rankXP: { fontSize: 13, fontWeight: '700', color: COLORS.secondary },
  friendMeta: { fontSize: 11, color: COLORS.secondary, marginTop: 1 },
  inviteRow: { padding: 14, alignItems: 'center' },
  inviteTxt: { fontSize: 13, color: COLORS.secondary },
  leaguesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  leagueTile: {
    width: '22%', backgroundColor: COLORS.card, borderRadius: 14, padding: 10,
    alignItems: 'center', gap: 4, borderWidth: 1, borderColor: COLORS.border,
  },
  leagueTileName: { fontSize: 11, fontWeight: '700', color: COLORS.dark, textAlign: 'center' },
  leagueTileXP: { fontSize: 9, color: COLORS.secondary },
  currentDot: { width: 6, height: 6, borderRadius: 3 },
});
