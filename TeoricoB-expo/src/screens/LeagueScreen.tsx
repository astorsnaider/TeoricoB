import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { useTabResetEffect } from '../components/PagerControl';

export default function LeagueScreen() {
  const user = useStore(s => s.user);
  const fallbackStandings = useStore(s => s.leagueStandings);
  const remote = useLeaderboard(user.league);
  const friendsState = useFriends();
  const [showFriends, setShowFriends] = useState(false);
  const pendingFriendUsername = useStore(s => s.pendingFriendUsername);
  const clearPendingFriend = useStore(s => s.clearPendingFriend);
  const theme = useTheme();

  useEffect(() => {
    if (pendingFriendUsername) setShowFriends(true);
  }, [pendingFriendUsername]);

  const standings: LeagueStanding[] =
    remote.available && remote.standings.length > 0
      ? remote.standings
      : fallbackStandings;

  const league = getLeagueInfo(user.league);
  const leagueIdx = LEAGUES.findIndex(l => l.name === user.league);
  const nextLeague = leagueIdx < LEAGUES.length - 1 ? LEAGUES[leagueIdx + 1] : null;
  const xpToNext = nextLeague ? Math.max(0, nextLeague.xpRequired - user.xp) : 0;
  const promoPct = nextLeague ? Math.min(1, user.xp / nextLeague.xpRequired) : 1;
  const mockFriends = user.friends ?? [];

  const top3 = standings.slice(0, 3);
  const rest = standings.slice(3);
  const showPodium = top3.length === 3;

  const scrollRef = useRef<ScrollView>(null);
  useTabResetEffect('league', useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []));

  return (
    <SafeAreaView edges={['top']} style={[s.safe, { backgroundColor: theme.bg }]}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* ════ HERO DE LIGA ════ */}
        <LinearGradient
          colors={[league.color, league.color + 'CC']}
          style={s.hero}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <Text style={s.heroEmoji}>{league.emoji}</Text>
          <Text style={s.heroTitle}>Liga {user.league}</Text>
          {remote.available && remote.standings.length > 0 && (
            <View style={s.livePill}>
              <View style={s.liveDot} />
              <Text style={s.livePillTxt}>EN VIVO</Text>
            </View>
          )}
          {nextLeague ? (
            <>
              <Text style={s.heroSub}>
                Faltan <Text style={{ fontWeight: '800' }}>{xpToNext} XP</Text> para {nextLeague.emoji} {nextLeague.name}
              </Text>
              <View style={s.promoBg}>
                <View style={[s.promoFill, { width: `${promoPct * 100}%` }]} />
              </View>
            </>
          ) : (
            <Text style={s.heroSub}>Liga máxima alcanzada</Text>
          )}
        </LinearGradient>

        {/* Banner si no auth */}
        {!remote.available && (
          <View style={[s.banner, { backgroundColor: theme.bg2, borderColor: theme.border }]}>
            <Ionicons name="information-circle-outline" size={16} color={theme.textTertiary} />
            <Text style={[s.bannerTxt, { color: theme.textSecondary }]}>
              Ranking simulado. Inicia sesión para competir con usuarios reales.
            </Text>
          </View>
        )}

        {/* ════ CLASIFICACIÓN ════ */}
        <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>Clasificación semanal</Text>

        {showPodium && (
          <View style={s.podium}>
            <PodiumColumn
              place={2}
              standing={top3[1]}
              theme={theme}
              color="#A8A9AD"
              accentColor={league.color}
              size="small"
            />
            <PodiumColumn
              place={1}
              standing={top3[0]}
              theme={theme}
              color="#FFD700"
              accentColor={league.color}
              size="large"
            />
            <PodiumColumn
              place={3}
              standing={top3[2]}
              theme={theme}
              color="#CD7F32"
              accentColor={league.color}
              size="small"
            />
          </View>
        )}

        {/* Lista del puesto 4 en adelante (o todos si no hay podio) */}
        {(showPodium ? rest : standings).length > 0 && (
          <View style={[s.listCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {(showPodium ? rest : standings).map((st, i, arr) => (
              <View
                key={`st-${st.rank}-${i}`}
                style={[
                  s.row,
                  { borderBottomColor: theme.border },
                  st.isCurrentUser && { backgroundColor: league.color + '14' },
                  i < arr.length - 1 && s.rowDivider,
                ]}
              >
                <Text style={[s.rank, { color: st.isCurrentUser ? league.color : theme.textTertiary }]}>
                  {st.rank}
                </Text>
                <AvatarView
                  color={st.avatarEmoji.startsWith('#') ? st.avatarEmoji : league.color}
                  name={st.name}
                  size={34}
                />
                <Text
                  style={[s.rowName, {
                    color: st.isCurrentUser ? league.color : theme.textPrimary,
                    fontWeight: st.isCurrentUser ? '800' : '500',
                  }]}
                  numberOfLines={1}
                >
                  {st.name}{st.isCurrentUser ? ' · tú' : ''}
                </Text>
                <Text style={[s.rowXP, { color: st.isCurrentUser ? league.color : theme.textSecondary }]}>
                  {st.xp} XP
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ════ AMIGOS ════ */}
        {friendsState.available ? (
          <>
            <View style={s.sectionHeader}>
              <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>
                Amigos {friendsState.friends.length > 0 ? `(${friendsState.friends.length})` : ''}
              </Text>
              {friendsState.incoming.length > 0 && (
                <View style={[s.notifPill, { backgroundColor: theme.orange + '22' }]}>
                  <Ionicons name="notifications" size={11} color={theme.orange} />
                  <Text style={[s.notifPillTxt, { color: theme.orange }]}>
                    {friendsState.incoming.length} pendiente{friendsState.incoming.length === 1 ? '' : 's'}
                  </Text>
                </View>
              )}
            </View>

            <View style={[s.listCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {friendsState.friends.length === 0 ? (
                <View style={s.emptyFriends}>
                  <Ionicons name="people-outline" size={32} color={theme.textTertiary} />
                  <Text style={[s.emptyFriendsTitle, { color: theme.textPrimary }]}>
                    Aún no tienes amigos
                  </Text>
                  <Text style={[s.emptyFriendsSub, { color: theme.textSecondary }]}>
                    Busca a tus amigos por @username o comparte tu enlace.
                  </Text>
                  {friendsState.myUsername && (
                    <View style={[s.handleChip, { backgroundColor: theme.bg2 }]}>
                      <Text style={[s.handleChipTxt, { color: theme.textPrimary }]}>@{friendsState.myUsername}</Text>
                    </View>
                  )}
                </View>
              ) : (
                friendsState.friends.slice(0, 4).map((f, i, arr) => {
                  const fi = getLeagueInfo(f.league);
                  return (
                    <View key={f.userId} style={[s.row, { borderBottomColor: theme.border }, i < arr.length - 1 && s.rowDivider]}>
                      <AvatarView color={f.avatarEmoji.startsWith('#') ? f.avatarEmoji : fi.color} name={f.name} size={34} />
                      <View style={{ flex: 1 }}>
                        <Text style={[s.rowName, { color: theme.textPrimary }]} numberOfLines={1}>{f.name}</Text>
                        <View style={s.friendMeta}>
                          <Text style={[s.friendMetaTxt, { color: theme.textSecondary }]}>{fi.emoji} {f.league}</Text>
                          <Ionicons name="flame" size={12} color={theme.orange} />
                          <Text style={[s.friendMetaTxt, { color: theme.textSecondary }]}>{f.streak}</Text>
                        </View>
                      </View>
                      <Text style={[s.rowXP, { color: theme.textSecondary }]}>{f.weeklyXP} XP</Text>
                    </View>
                  );
                })
              )}
              <TouchableOpacity
                style={[s.cardFooter, { borderTopColor: theme.border }]}
                onPress={() => setShowFriends(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="person-add-outline" size={16} color={theme.primary} />
                <Text style={[s.cardFooterTxt, { color: theme.primary }]}>Gestionar amigos</Text>
                <Ionicons name="chevron-forward" size={14} color={theme.primary} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          mockFriends.length > 0 && (
            <>
              <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>Amigos</Text>
              <View style={[s.listCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {mockFriends.slice(0, 4).map((f, i, arr) => {
                  const fi = getLeagueInfo(f.league as LeagueType);
                  return (
                    <View key={`fr-${i}`} style={[s.row, { borderBottomColor: theme.border }, i < arr.length - 1 && s.rowDivider]}>
                      <AvatarView color={f.avatarEmoji.startsWith('#') ? f.avatarEmoji : fi.color} name={f.name} size={34} />
                      <View style={{ flex: 1 }}>
                        <Text style={[s.rowName, { color: theme.textPrimary }]}>{f.name}</Text>
                        <View style={s.friendMeta}>
                          <Text style={[s.friendMetaTxt, { color: theme.textSecondary }]}>{fi.emoji} {f.league}</Text>
                          <Ionicons name="flame" size={12} color={theme.orange} />
                          <Text style={[s.friendMetaTxt, { color: theme.textSecondary }]}>{f.streak}</Text>
                        </View>
                      </View>
                      <Text style={[s.rowXP, { color: theme.textSecondary }]}>{f.xp} XP</Text>
                    </View>
                  );
                })}
                <View style={[s.cardFooter, { borderTopColor: theme.border }]}>
                  <Ionicons name="information-circle-outline" size={14} color={theme.textTertiary} />
                  <Text style={[s.cardFooterTxt, { color: theme.textTertiary }]}>
                    Inicia sesión para añadir amigos reales
                  </Text>
                </View>
              </View>
            </>
          )
        )}

        {/* ════ TODAS LAS LIGAS ════ */}
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

      <Modal
        visible={showFriends}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => { setShowFriends(false); clearPendingFriend(); }}
      >
        <FriendsScreen
          onClose={() => { setShowFriends(false); clearPendingFriend(); }}
          prefillUsername={pendingFriendUsername ?? undefined}
        />
      </Modal>
    </SafeAreaView>
  );
}

// ─── PODIO ────────────────────────────────────────────────────────────

function PodiumColumn({
  place, standing, theme, color, accentColor, size,
}: {
  place: 1 | 2 | 3;
  standing: LeagueStanding;
  theme: ReturnType<typeof useTheme>;
  color: string;
  accentColor: string;
  size: 'large' | 'small';
}) {
  const isLarge = size === 'large';
  const avatarSize = isLarge ? 66 : 50;
  const pedestalHeight = isLarge ? 90 : 64;
  const isYou = standing.isCurrentUser;
  return (
    <View style={[p.col, { width: isLarge ? '38%' : '31%' }]}>
      {/* Corona (solo el 1º) */}
      {place === 1 && (
        <View style={p.crownBox}>
          <Ionicons name="trophy" size={24} color={color} />
        </View>
      )}
      <View style={[p.avatarWrap, { borderColor: color, borderWidth: 3 }]}>
        <AvatarView
          color={standing.avatarEmoji.startsWith('#') ? standing.avatarEmoji : accentColor}
          name={standing.name}
          size={avatarSize}
        />
      </View>
      <Text
        style={[p.name, { color: isYou ? accentColor : theme.textPrimary, fontWeight: isYou ? '800' : '700' }]}
        numberOfLines={1}
      >
        {isYou ? 'Tú' : standing.name.split(' ')[0]}
      </Text>
      <Text style={[p.xp, { color: theme.textSecondary }]}>{standing.xp} XP</Text>
      {/* Pedestal */}
      <View style={[p.pedestal, { backgroundColor: color, height: pedestalHeight }]}>
        <Text style={p.place}>{place}</Text>
      </View>
    </View>
  );
}

const p = StyleSheet.create({
  col: { alignItems: 'center', gap: 4, justifyContent: 'flex-end' },
  crownBox: { marginBottom: 2 },
  avatarWrap: { borderRadius: 999, padding: 2, ...SHADOWS.small },
  name: { fontSize: 13, maxWidth: '100%' },
  xp: { fontSize: 11, fontWeight: '600' },
  pedestal: {
    width: '100%',
    borderTopLeftRadius: 14, borderTopRightRadius: 14,
    alignItems: 'center', justifyContent: 'flex-start',
    paddingTop: 10,
    marginTop: 4,
  },
  place: { color: '#fff', fontSize: 28, fontWeight: '900' },
});

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 14 },

  hero: { borderRadius: 24, padding: 22, alignItems: 'center', gap: 8, ...SHADOWS.medium },
  heroEmoji: { fontSize: 56 },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: 0.2 },
  heroSub: { color: 'rgba(255,255,255,0.92)', fontSize: 13, textAlign: 'center' },
  livePill: {
    position: 'absolute', top: 14, right: 14,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  livePillTxt: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  promoBg: { width: '100%', height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.18)', marginTop: 4 },
  promoFill: { height: 8, borderRadius: 4, backgroundColor: '#fff' },

  banner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 10, borderWidth: 1 },
  bannerTxt: { flex: 1, fontSize: 12, lineHeight: 16 },

  sectionTitle: { fontSize: 16, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  notifPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  notifPillTxt: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },

  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 6,
    paddingTop: 12,
  },

  listCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11, gap: 10 },
  rowDivider: { borderBottomWidth: 0.5 },
  rank: { width: 26, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  rowName: { flex: 1, fontSize: 14 },
  rowXP: { fontSize: 12, fontWeight: '700' },

  friendMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  friendMetaTxt: { fontSize: 11 },

  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderTopWidth: 0.5 },
  cardFooterTxt: { fontSize: 13, fontWeight: '600', flex: 1 },

  emptyFriends: { alignItems: 'center', padding: 22, gap: 6 },
  emptyFriendsTitle: { fontSize: 15, fontWeight: '700' },
  emptyFriendsSub: { fontSize: 12, textAlign: 'center', marginBottom: 6 },
  handleChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, marginTop: 4 },
  handleChipTxt: { fontSize: 16, fontWeight: '800', letterSpacing: 1 },

  leaguesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  leagueTile: {
    width: '22%', borderRadius: 12, padding: 10,
    alignItems: 'center', gap: 3, borderWidth: 1,
  },
  leagueTileName: { fontSize: 10, fontWeight: '700', textAlign: 'center' },
  leagueTileXP: { fontSize: 9 },
});
