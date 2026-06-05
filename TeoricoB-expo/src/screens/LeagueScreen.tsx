import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore, getLeagueInfo, LEAGUES } from '../store/useStore';
import { useTheme } from '../hooks/useTheme';
import { SHADOWS } from '../theme';
import { AvatarView } from '../components/AvatarView';
import { LeagueType, LeagueStanding } from '../types';
import { useLeaderboard } from '../sync/useLeaderboard';
import { useFriends } from '../friends/useFriends';
import FriendsScreen from './FriendsScreen';

export default function LeagueScreen() {
  const user = useStore(s => s.user);
  const fallbackStandings = useStore(s => s.leagueStandings);
  const remote = useLeaderboard(user.league);
  const friendsState = useFriends();
  const [showFriends, setShowFriends] = useState(false);
  // Si el usuario está autenticado y la query terminó con datos, usamos
  // el ranking real. En cualquier otro caso (no autenticado, todavía
  // cargando, o fallo de red) caemos al ranking simulado del store
  // para no dejar la pantalla vacía.
  const standings: LeagueStanding[] =
    remote.available && remote.standings.length > 0
      ? remote.standings
      : fallbackStandings;
  const theme = useTheme();

  const league = getLeagueInfo(user.league);
  const leagueIdx = LEAGUES.findIndex(l => l.name === user.league);
  const nextLeague = leagueIdx < LEAGUES.length - 1 ? LEAGUES[leagueIdx + 1] : null;
  const xpToNext = nextLeague ? nextLeague.xpRequired - user.xp : 0;
  const promoPct = nextLeague ? Math.min(1, user.xp / nextLeague.xpRequired) : 1;
  const mockFriends = user.friends ?? [];

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
        <View style={s.rankingHeader}>
          <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>Clasificación semanal</Text>
          {remote.available && remote.standings.length > 0 && (
            <View style={[s.realBadge, { backgroundColor: theme.correct + '18' }]}>
              <Ionicons name="cloud-done" size={11} color={theme.correct} />
              <Text style={[s.realBadgeTxt, { color: theme.correct }]}>en vivo</Text>
            </View>
          )}
        </View>

        {!remote.available && (
          <View style={[s.fakeBanner, { backgroundColor: theme.bg2, borderColor: theme.border }]}>
            <Ionicons name="information-circle-outline" size={16} color={theme.textTertiary} />
            <Text style={[s.fakeBannerTxt, { color: theme.textSecondary }]}>
              Ranking simulado. Inicia sesión para competir con usuarios reales.
            </Text>
          </View>
        )}

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
        {friendsState.available ? (
          <>
            <View style={s.rankingHeader}>
              <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>
                Amigos {friendsState.friends.length > 0 ? `(${friendsState.friends.length})` : ''}
              </Text>
              {friendsState.incoming.length > 0 && (
                <View style={[s.realBadge, { backgroundColor: theme.orange + '22' }]}>
                  <Ionicons name="notifications" size={11} color={theme.orange} />
                  <Text style={[s.realBadgeTxt, { color: theme.orange }]}>
                    {friendsState.incoming.length} pendiente{friendsState.incoming.length === 1 ? '' : 's'}
                  </Text>
                </View>
              )}
            </View>

            <View style={[s.rankingCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {friendsState.friends.length === 0 ? (
                <View style={s.emptyFriends}>
                  <Ionicons name="people-outline" size={32} color={theme.textTertiary} />
                  <Text style={[s.emptyFriendsTitle, { color: theme.textPrimary }]}>
                    Aún no tienes amigos
                  </Text>
                  <Text style={[s.emptyFriendsSub, { color: theme.textSecondary }]}>
                    Comparte tu código o introduce el de un amigo.
                  </Text>
                  {friendsState.myCode && (
                    <View style={[s.codeChip, { backgroundColor: theme.bg2 }]}>
                      <Text style={[s.codeChipTxt, { color: theme.textPrimary }]}>{friendsState.myCode}</Text>
                    </View>
                  )}
                </View>
              ) : (
                friendsState.friends.slice(0, 4).map((f, i) => {
                  const fi = getLeagueInfo(f.league);
                  return (
                    <View key={f.userId} style={[s.rankRow, { borderBottomColor: theme.border }, i < Math.min(friendsState.friends.length, 4) - 1 && s.rankDivider]}>
                      <AvatarView color={f.avatarEmoji.startsWith('#') ? f.avatarEmoji : fi.color} name={f.name} size={34} />
                      <View style={{ flex: 1 }}>
                        <Text style={[s.rankName, { color: theme.textPrimary }]} numberOfLines={1}>{f.name}</Text>
                        <View style={s.friendMeta}>
                          <Text style={[s.friendMetaTxt, { color: theme.textSecondary }]}>{fi.emoji} {f.league}</Text>
                          <Ionicons name="flame" size={12} color={theme.orange} />
                          <Text style={[s.friendMetaTxt, { color: theme.textSecondary }]}>{f.streak}</Text>
                        </View>
                      </View>
                      <Text style={[s.rankXP, { color: theme.textSecondary }]}>{f.weeklyXP} XP</Text>
                    </View>
                  );
                })
              )}
              <TouchableOpacity
                style={[s.inviteRow, { borderTopColor: theme.border }]}
                onPress={() => setShowFriends(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="person-add-outline" size={16} color={theme.primary} />
                <Text style={[s.inviteTxt, { color: theme.primary, fontWeight: '600' }]}>
                  Gestionar amigos
                </Text>
                <Ionicons name="chevron-forward" size={14} color={theme.primary} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          mockFriends.length > 0 && (
            <>
              <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>Amigos</Text>
              <View style={[s.rankingCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {mockFriends.slice(0, 4).map((f, i) => {
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
                  <Ionicons name="information-circle-outline" size={14} color={theme.textTertiary} />
                  <Text style={[s.inviteTxt, { color: theme.textTertiary }]}>
                    Inicia sesión para añadir amigos reales
                  </Text>
                </View>
              </View>
            </>
          )
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

      <Modal visible={showFriends} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowFriends(false)}>
        <FriendsScreen onClose={() => setShowFriends(false)} />
      </Modal>
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
  rankingHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  realBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  realBadgeTxt: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  fakeBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 10, borderWidth: 1 },
  fakeBannerTxt: { flex: 1, fontSize: 12, lineHeight: 16 },
  emptyFriends: { alignItems: 'center', padding: 20, gap: 6 },
  emptyFriendsTitle: { fontSize: 15, fontWeight: '700' },
  emptyFriendsSub: { fontSize: 12, textAlign: 'center', marginBottom: 6 },
  codeChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, marginTop: 4 },
  codeChipTxt: { fontSize: 16, fontWeight: '800', letterSpacing: 2, fontFamily: 'Menlo' },
});
