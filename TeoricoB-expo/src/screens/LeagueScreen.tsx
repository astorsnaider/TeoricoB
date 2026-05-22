import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore, getLeagueInfo, LEAGUES } from '../store/useStore';
import { useTheme } from '../hooks/useTheme';
import { SHADOWS } from '../theme';
import { AvatarView } from '../components/AvatarView';
import { LeagueType } from '../types';

export default function LeagueScreen() {
  const user = useStore(s => s.user);
  const standings = useStore(s => s.leagueStandings);
  const theme = useTheme();

  const league = getLeagueInfo(user.league);
  const leagueIdx = LEAGUES.findIndex(l => l.name === user.league);
  const nextLeague = leagueIdx < LEAGUES.length - 1 ? LEAGUES[leagueIdx + 1] : null;
  const xpToNext = nextLeague ? nextLeague.xpRequired - user.xp : 0;
  const promoPct = nextLeague ? Math.min(1, user.xp / nextLeague.xpRequired) : 1;
  const friends = user.friends ?? [];

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Ionicons name="trophy" size={20} color="#FFD700" />;
    if (rank === 2) return <Ionicons name="trophy" size={20} color="#A8A9AD" />;
    if (rank === 3) return <Ionicons name="trophy" size={20} color="#CD7F32" />;
    return <Text style={[s.rankNum, { color: theme.textSecondary }]}>#{rank}</Text>;
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* League header */}
        <LinearGradient colors={[league.color + '28', league.color + '06']} style={s.leagueHeader}>
          <Text style={s.leagueEmoji}>{league.emoji}</Text>
          <Text style={[s.leagueName, { color: league.color }]}>Liga {user.league}</Text>
          {nextLeague ? (
            <>
              <Text style={[s.leagueSub, { color: theme.textSecondary }]}>
                Faltan <Text style={{ color: league.color, fontWeight: '700' }}>{xpToNext} XP</Text> para {nextLeague.emoji} {nextLeague.name}
              </Text>
              <View style={[s.promoBg, { backgroundColor: theme.bg2 }]}>
                <View style={[s.promoFill, { width: `${promoPct * 100}%`, backgroundColor: league.color }]} />
              </View>
            </>
          ) : (
            <Text style={[s.leagueSub, { color: theme.textSecondary }]}>
              Liga máxima alcanzada
            </Text>
          )}
        </LinearGradient>

        {/* Ranking */}
        <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>Clasificación semanal</Text>
        <View style={[s.rankingCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {standings.map((st, i) => (
            <View
              key={`st-${i}`}
              style={[
                s.rankRow,
                { borderBottomColor: theme.border },
                st.isCurrentUser && { backgroundColor: league.color + '10' },
                i < standings.length - 1 && s.rankDivider,
              ]}
            >
              <View style={s.rankPos}>{rankIcon(st.rank)}</View>
              <AvatarView
                color={st.avatarEmoji.startsWith('#') ? st.avatarEmoji : league.color}
                name={st.name}
                size={34}
              />
              <Text
                style={[s.rankName, { color: st.isCurrentUser ? league.color : theme.textPrimary, fontWeight: st.isCurrentUser ? '800' : '500' }]}
                numberOfLines={1}
              >
                {st.name}{st.isCurrentUser ? ' · tú' : ''}
              </Text>
              <Text style={[s.rankXP, { color: st.isCurrentUser ? league.color : theme.textSecondary }]}>
                {st.xp} XP
              </Text>
            </View>
          ))}
        </View>

        {/* Friends */}
        {friends.length > 0 && (
          <>
            <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>Amigos</Text>
            <View style={[s.rankingCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {friends.slice(0, 4).map((f, i) => {
                const fi = getLeagueInfo(f.league as LeagueType);
                return (
                  <View key={`fr-${i}`} style={[s.rankRow, { borderBottomColor: theme.border }, i < 3 && s.rankDivider]}>
                    <AvatarView color={f.avatarEmoji.startsWith('#') ? f.avatarEmoji : fi.color} name={f.name} size={34} />
                    <View style={{ flex: 1 }}>
                      <Text style={[s.rankName, { color: theme.textPrimary }]}>{f.name}</Text>
                      <View style={s.friendMeta}>
                        <Text style={[s.friendMetaTxt, { color: theme.textSecondary }]}>{fi.emoji} {f.league}</Text>
                        <Ionicons name="flame" size={12} color={theme.orange} />
                        <Text style={[s.friendMetaTxt, { color: theme.textSecondary }]}>{f.streak}</Text>
                      </View>
                    </View>
                    <Text style={[s.rankXP, { color: theme.textSecondary }]}>{f.xp} XP</Text>
                  </View>
                );
              })}
              <View style={[s.inviteRow, { borderTopColor: theme.border }]}>
                <Ionicons name="person-add-outline" size={16} color={theme.textTertiary} />
                <Text style={[s.inviteTxt, { color: theme.textTertiary }]}>Invitar amigos — próximamente</Text>
              </View>
            </View>
          </>
        )}

        {/* All leagues */}
        <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>Todas las ligas</Text>
        <View style={s.leaguesGrid}>
          {LEAGUES.map((lg) => {
            const isCurrent = lg.name === user.league;
            const isUnlocked = user.xp >= lg.xpRequired;
            return (
              <View
                key={lg.name}
                style={[
                  s.leagueTile,
                  { backgroundColor: theme.card, borderColor: isCurrent ? lg.color : theme.border },
                  isCurrent && { borderWidth: 2 },
                  !isUnlocked && { opacity: 0.35 },
                ]}
              >
                <Text style={{ fontSize: 24 }}>{lg.emoji}</Text>
                <Text style={[s.leagueTileName, { color: isCurrent ? lg.color : theme.textPrimary }]}>{lg.name}</Text>
                <Text style={[s.leagueTileXP, { color: theme.textSecondary }]}>
                  {lg.xpRequired > 0 ? `${lg.xpRequired} XP` : 'Inicio'}
                </Text>
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
  safe: { flex: 1 },
  content: { padding: 16, gap: 14 },
  leagueHeader: { borderRadius: 20, padding: 24, alignItems: 'center', gap: 8 },
  leagueEmoji: { fontSize: 54 },
  leagueName: { fontSize: 24, fontWeight: '800' },
  leagueSub: { fontSize: 13, textAlign: 'center' },
  promoBg: { width: '100%', height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 4 },
  promoFill: { height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  rankingCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  rankRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11, gap: 10 },
  rankDivider: { borderBottomWidth: 0.5 },
  rankPos: { width: 28, alignItems: 'center' },
  rankNum: { fontSize: 13, fontWeight: '700' },
  rankName: { flex: 1, fontSize: 14 },
  rankXP: { fontSize: 12, fontWeight: '700' },
  friendMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  friendMetaTxt: { fontSize: 11 },
  inviteRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderTopWidth: 0.5 },
  inviteTxt: { fontSize: 13 },
  leaguesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  leagueTile: {
    width: '22%', borderRadius: 12, padding: 10,
    alignItems: 'center', gap: 3, borderWidth: 1,
  },
  leagueTileName: { fontSize: 10, fontWeight: '700', textAlign: 'center' },
  leagueTileXP: { fontSize: 9 },
});
