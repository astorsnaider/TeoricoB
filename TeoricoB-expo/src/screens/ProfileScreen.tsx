/**
 * ProfileScreen — versión estilo Duolingo.
 *
 * Estructura:
 *  1. Header rojo con avatar grande, nombre top-left, gear top-right.
 *  2. Subtítulo (@username · Se unió en YYYY).
 *  3. Stats row: Permiso B / Amigos / Liga.
 *  4. Botón "Agregar amigos" + share.
 *  5. 6 cards expandibles (XP, Racha, Lecciones, Aciertos, Vidas, Gemas).
 *  6. Progreso por tema.
 *  7. Logros: preview 4 + "Ver todos".
 *  8. Sección de amigos integrada (lista compacta + CTA).
 *
 * Todo lo de "ajustes" se ha movido a SettingsScreen (hub) accesible via
 * gear arriba a la derecha. Las sub-pantallas de Stats, Legal, AuthSheet
 * y Friends se abren como SubPage.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Animated,
  LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore, getAllAchievements, getLeagueInfo } from '../store/useStore';
import { useTheme } from '../hooks/useTheme';
import { SHADOWS } from '../theme';
import { AvatarView } from '../components/AvatarView';
import { useSoundEffect } from '../audio/useSoundEffect';
import { useAuth } from '../auth/AuthContext';
import { useFriends } from '../friends/useFriends';
import AuthScreen from '../auth/AuthScreen';
import FriendsScreen from './FriendsScreen';
import SettingsScreen from './SettingsScreen';
import { useLockPagerSwipe, useTabResetEffect } from '../components/PagerControl';
import SubPage from '../components/SubPage';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ProfileScreen() {
  const [showSettings, setShowSettings] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  useLockPagerSwipe(showSettings || showFriends || showAuth || showAllAchievements);

  return (
    <View style={{ flex: 1 }}>
      <ProfileMain
        onShowSettings={() => setShowSettings(true)}
        onShowFriends={() => setShowFriends(true)}
        onShowAuth={() => setShowAuth(true)}
        onShowAllAchievements={() => setShowAllAchievements(true)}
      />
      {showSettings && (
        <SubPage onBack={() => setShowSettings(false)}>
          <SettingsScreen onBack={() => setShowSettings(false)} />
        </SubPage>
      )}
      {showFriends && (
        <SubPage onBack={() => setShowFriends(false)}>
          <FriendsScreen onClose={() => setShowFriends(false)} />
        </SubPage>
      )}
      {showAllAchievements && (
        <SubPage onBack={() => setShowAllAchievements(false)}>
          <AllAchievementsScreen onBack={() => setShowAllAchievements(false)} />
        </SubPage>
      )}
      <Modal visible={showAuth} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAuth(false)}>
        <AuthScreen onClose={() => setShowAuth(false)} />
      </Modal>
    </View>
  );
}

function ProfileMain({
  onShowSettings, onShowFriends, onShowAuth, onShowAllAchievements,
}: {
  onShowSettings: () => void;
  onShowFriends: () => void;
  onShowAuth: () => void;
  onShowAllAchievements: () => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  useTabResetEffect('profile', useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []));

  const { user: authUser, profile } = useAuth();
  const user = useStore(s => s.user);
  const topics = useStore(s => s.topics);
  const minutesToNextHeart = useStore(s => s.minutesToNextHeart);
  const theme = useTheme();
  const playSound = useSoundEffect();
  const { friends: friendsList, myUsername } = useFriends();

  const league = getLeagueInfo(user.league);
  const allAchievements = getAllAchievements().map(a => ({ ...a, isUnlocked: user.achievements.includes(a.id) }));
  const achievementsUnlocked = allAchievements.filter(a => a.isUnlocked).length;
  const accuracy = user.totalAnswered > 0 ? Math.round((user.totalCorrect / user.totalAnswered) * 100) : 0;
  const totalLessons = topics.reduce((a, t) => a + t.lessons.length, 0);

  const joinYear = (() => {
    const iso = profile?.created_at ?? user.lastActiveDate;
    return new Date(iso).getFullYear();
  })();

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* === HEADER ROJO === */}
        <SafeAreaView edges={['top']} style={[s.heroWrap, { backgroundColor: theme.primary }]}>
          <View style={s.heroTopRow}>
            <Text style={s.heroName} numberOfLines={1}>{user.name}</Text>
            <TouchableOpacity onPress={onShowSettings} hitSlop={12} style={s.gearBtn}>
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={s.heroAvatarRow}>
            <AvatarView
              color={user.avatarEmoji}
              name={user.name}
              photoUri={user.profilePhotoUri}
              size={110}
              borderColor="#ffffffAA"
              borderWidth={3}
            />
          </View>
        </SafeAreaView>

        <View style={s.body}>
          {/* === SUBTÍTULO @user · Se unió en YYYY === */}
          <Text style={[s.handleSub, { color: theme.textSecondary }]}>
            {myUsername ? `@${myUsername}` : '@—'} · Se unió en {joinYear}
          </Text>

          {/* === STATS ROW (Permiso B / Amigos / Liga) === */}
          <View style={s.metaRow}>
            <View style={s.metaItem}>
              <Text style={s.metaEmoji}>🚗</Text>
              <Text style={[s.metaLabel, { color: theme.textSecondary }]}>Permiso B</Text>
            </View>
            <View style={s.metaItem}>
              <Text style={[s.metaValue, { color: theme.textPrimary }]}>{friendsList.length}</Text>
              <Text style={[s.metaLabel, { color: theme.textSecondary }]}>
                {friendsList.length === 1 ? 'Amigo' : 'Amigos'}
              </Text>
            </View>
            <View style={s.metaItem}>
              <Text style={s.metaEmoji}>{league.emoji}</Text>
              <Text style={[s.metaLabel, { color: theme.textSecondary }]}>{user.league}</Text>
            </View>
          </View>

          {/* === BOTÓN AGREGAR AMIGOS === */}
          <TouchableOpacity
            style={[s.addFriendsBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => { playSound('tap'); onShowFriends(); }}
            activeOpacity={0.85}
          >
            <Ionicons name="person-add" size={18} color={theme.textPrimary} />
            <Text style={[s.addFriendsTxt, { color: theme.textPrimary }]}>AGREGAR AMIGOS</Text>
          </TouchableOpacity>

          {/* === LOGIN PROMPT (si no autenticado) === */}
          {!authUser && (
            <TouchableOpacity
              onPress={onShowAuth}
              activeOpacity={0.85}
              style={[s.authPrompt, { backgroundColor: theme.primary + '12', borderColor: theme.primary + '30' }]}
            >
              <Ionicons name="cloud-upload-outline" size={20} color={theme.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[s.authPromptTitle, { color: theme.textPrimary }]}>
                  Inicia sesión para sincronizar
                </Text>
                <Text style={[s.authPromptSub, { color: theme.textSecondary }]}>
                  Guarda tu progreso entre dispositivos. Es gratis.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.primary} />
            </TouchableOpacity>
          )}

          {/* === 6 STAT CARDS EXPANDIBLES === */}
          <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>Tus estadísticas</Text>
          <View style={s.statsGrid}>
            <StatCard icon="star" label="XP Total" value={`${user.xp}`} color={theme.yellow} theme={theme}
              detail={`Has acumulado ${user.xp} puntos de experiencia.`} />
            <StatCard icon="flame" label="Racha" value={`${user.streak}`} color={theme.orange} theme={theme}
              detail={user.streak === 0 ? 'Empieza una racha hoy completando una lección.' : `Llevas ${user.streak} día${user.streak === 1 ? '' : 's'} seguido${user.streak === 1 ? '' : 's'}.`} />
            <StatCard icon="checkbox" label="Lecciones" value={`${user.completedLessons.length}/${totalLessons}`} color={theme.correct} theme={theme}
              detail={`Has completado ${user.completedLessons.length} de ${totalLessons} lecciones.`} />
            <StatCard icon="stats-chart" label="Aciertos" value={`${accuracy}%`} color={theme.blue} theme={theme}
              detail={user.totalAnswered === 0 ? 'Empieza a responder preguntas para ver tu acierto.' : `${user.totalCorrect} aciertos de ${user.totalAnswered} respuestas.`} />
            <StatCard icon="heart" label="Vidas" value={`${user.hearts}/${user.maxHearts}`} color={theme.wrong} theme={theme}
              detail={user.hearts >= user.maxHearts
                ? 'Tienes todas las vidas. Fallar te quita una.'
                : `Próxima vida en ${minutesToNextHeart()} min. Se regenera 1 cada 30 min.`} />
            <StatCard icon="diamond" label="Gemas" value={`${user.gems}`} color="#9C27B0" theme={theme}
              detail="Gánalas con logros y misiones diarias. Cómpralas en la tienda (próximamente)." />
          </View>

          {/* === PROGRESO POR TEMA === */}
          <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>Progreso por tema</Text>
          <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {topics.map((topic, i) => {
              const done = topic.lessons.filter(l => user.completedLessons.includes(l.id)).length;
              const total = topic.lessons.length;
              const pct = total > 0 ? done / total : 0;
              return (
                <View key={topic.id} style={[s.topicRow, i < topics.length - 1 && { borderBottomColor: theme.border, borderBottomWidth: 0.5 }]}>
                  <View style={[s.topicDot, { backgroundColor: topic.colorHex }]} />
                  <View style={{ flex: 1, gap: 3 }}>
                    <View style={s.topicRowTop}>
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

          {/* === LOGROS === */}
          <View style={s.achievementsHeader}>
            <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>
              Logros ({achievementsUnlocked}/{allAchievements.length})
            </Text>
            <TouchableOpacity onPress={onShowAllAchievements} hitSlop={6}>
              <Text style={[s.linkBtn, { color: theme.primary }]}>VER TODOS</Text>
            </TouchableOpacity>
          </View>
          <View style={s.achievementsRow}>
            {allAchievements.slice(0, 4).map(a => (
              <View
                key={a.id}
                style={[s.achievementPreview, {
                  backgroundColor: a.isUnlocked ? theme.card : theme.bg2,
                  borderColor: a.isUnlocked ? theme.border : 'transparent',
                }, SHADOWS.small]}
              >
                <Text style={[s.achEmoji, !a.isUnlocked && { opacity: 0.25 }]}>{a.emoji}</Text>
                <Text style={[s.achName, { color: a.isUnlocked ? theme.textPrimary : theme.textTertiary }]} numberOfLines={2}>
                  {a.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── STAT CARD EXPANDIBLE ─────────────────────────────────────────────

function StatCard({ icon, label, value, color, theme, detail }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
  theme: ReturnType<typeof useTheme>;
  detail: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.create(220, 'easeInEaseOut', 'opacity'));
    setExpanded(v => !v);
  };
  return (
    <TouchableOpacity
      style={[
        s.statCard,
        { backgroundColor: theme.card, borderColor: theme.border },
        expanded && s.statCardExpanded,
        SHADOWS.small,
      ]}
      onPress={toggle}
      activeOpacity={0.85}
    >
      <View style={s.statHeader}>
        <Ionicons name={icon} size={20} color={color} />
        <Text style={[s.statValue, { color: theme.textPrimary }]}>{value}</Text>
      </View>
      <Text style={[s.statLabel, { color: theme.textSecondary }]}>{label}</Text>
      {expanded && (
        <Text style={[s.statDetail, { color: theme.textSecondary }]}>{detail}</Text>
      )}
    </TouchableOpacity>
  );
}

// ─── PANTALLA TODOS LOS LOGROS ────────────────────────────────────────

function AllAchievementsScreen({ onBack }: { onBack: () => void }) {
  const theme = useTheme();
  const user = useStore(s => s.user);
  const all = getAllAchievements().map(a => ({ ...a, isUnlocked: user.achievements.includes(a.id) }));
  const unlocked = all.filter(a => a.isUnlocked);
  const locked = all.filter(a => !a.isUnlocked);
  const [openId, setOpenId] = useState<string | null>(null);

  const openA = openId ? all.find(a => a.id === openId) ?? null : null;

  return (
    <SafeAreaView style={[as.safe, { backgroundColor: theme.bg }]}>
      <View style={[as.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onBack} hitSlop={12} style={as.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[as.headerTitle, { color: theme.textPrimary }]}>Logros</Text>
        <View style={as.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={as.content}>
        <View style={[as.summaryCard, { backgroundColor: theme.primary + '14', borderColor: theme.primary + '30' }]}>
          <Ionicons name="trophy" size={28} color={theme.primary} />
          <Text style={[as.summaryNum, { color: theme.textPrimary }]}>{unlocked.length}/{all.length}</Text>
          <Text style={[as.summaryLbl, { color: theme.textSecondary }]}>logros desbloqueados</Text>
        </View>

        {unlocked.length > 0 && (
          <>
            <Text style={[as.sectionTitle, { color: theme.textSecondary }]}>DESBLOQUEADOS</Text>
            <View style={as.grid}>
              {unlocked.map(a => (
                <TouchableOpacity
                  key={a.id}
                  style={[as.card, { backgroundColor: theme.card, borderColor: theme.border }, SHADOWS.small]}
                  onPress={() => setOpenId(a.id)} activeOpacity={0.85}
                >
                  <Text style={as.emoji}>{a.emoji}</Text>
                  <Text style={[as.name, { color: theme.textPrimary }]} numberOfLines={2}>{a.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text style={[as.sectionTitle, { color: theme.textSecondary }]}>POR DESBLOQUEAR</Text>
        <View style={as.grid}>
          {locked.map(a => (
            <TouchableOpacity
              key={a.id}
              style={[as.card, { backgroundColor: theme.bg2, borderColor: 'transparent' }]}
              onPress={() => setOpenId(a.id)} activeOpacity={0.85}
            >
              <Text style={[as.emoji, { opacity: 0.3 }]}>{a.emoji}</Text>
              <Text style={[as.name, { color: theme.textTertiary }]} numberOfLines={2}>{a.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      <Modal visible={openA !== null} transparent animationType="fade" onRequestClose={() => setOpenId(null)}>
        <TouchableOpacity style={as.modalBackdrop} activeOpacity={1} onPress={() => setOpenId(null)}>
          <TouchableOpacity activeOpacity={1} style={[as.modalCard, { backgroundColor: theme.card }]}>
            {openA && (
              <>
                <Text style={[as.modalEmoji, !openA.isUnlocked && { opacity: 0.3 }]}>{openA.emoji}</Text>
                <Text style={[as.modalName, { color: theme.textPrimary }]}>{openA.name}</Text>
                <Text style={[as.modalDesc, { color: theme.textSecondary }]}>{openA.description}</Text>
                <View style={[as.modalRewardRow, { backgroundColor: theme.bg2 }]}>
                  {openA.rewardGems ? (
                    <View style={as.modalRewardItem}>
                      <Ionicons name="diamond" size={16} color="#9C27B0" />
                      <Text style={[as.modalRewardTxt, { color: theme.textPrimary }]}>+{openA.rewardGems}</Text>
                    </View>
                  ) : null}
                  {openA.rewardXP ? (
                    <View style={as.modalRewardItem}>
                      <Ionicons name="star" size={16} color={theme.yellow} />
                      <Text style={[as.modalRewardTxt, { color: theme.textPrimary }]}>+{openA.rewardXP} XP</Text>
                    </View>
                  ) : null}
                </View>
                <View style={[as.modalStatus, { backgroundColor: openA.isUnlocked ? theme.correct + '22' : theme.bg2 }]}>
                  <Ionicons
                    name={openA.isUnlocked ? 'checkmark-circle' : 'lock-closed'}
                    size={16}
                    color={openA.isUnlocked ? theme.correct : theme.textTertiary}
                  />
                  <Text style={[as.modalStatusTxt, { color: openA.isUnlocked ? theme.correct : theme.textTertiary }]}>
                    {openA.isUnlocked ? 'Desbloqueado' : 'Bloqueado'}
                  </Text>
                </View>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// ─── ESTILOS PRINCIPALES ──────────────────────────────────────────────

const s = StyleSheet.create({
  heroWrap: { paddingBottom: 24 },
  heroTopRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 8, paddingBottom: 6,
  },
  heroName: { flex: 1, fontSize: 24, fontWeight: '800', color: '#fff' },
  gearBtn: { padding: 4 },
  heroAvatarRow: { alignItems: 'center', marginTop: 8 },

  body: { paddingHorizontal: 16, paddingTop: 16, gap: 14 },

  handleSub: { fontSize: 12, fontWeight: '600' },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 24, marginTop: 4 },
  metaItem: { alignItems: 'center', gap: 2 },
  metaValue: { fontSize: 22, fontWeight: '800' },
  metaEmoji: { fontSize: 22 },
  metaLabel: { fontSize: 12, fontWeight: '600' },

  addFriendsBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, borderRadius: 14, borderWidth: 2, paddingVertical: 13, marginTop: 6,
  },
  addFriendsTxt: { fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },

  authPrompt: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, borderWidth: 1, padding: 12 },
  authPromptTitle: { fontSize: 14, fontWeight: '700' },
  authPromptSub: { fontSize: 12, marginTop: 2 },

  sectionTitle: { fontSize: 16, fontWeight: '800', marginTop: 8 },
  linkBtn: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    width: '48%', borderRadius: 14, borderWidth: 1,
    padding: 12, gap: 4,
  },
  statCardExpanded: { width: '100%' },
  statHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 12, fontWeight: '600' },
  statDetail: { fontSize: 12, lineHeight: 17, marginTop: 6 },

  card: { borderRadius: 14, overflow: 'hidden', borderWidth: 1 },
  topicRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  topicDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  topicRowTop: { flexDirection: 'row', justifyContent: 'space-between' },
  topicName: { fontSize: 13, fontWeight: '600' },
  topicPct: { fontSize: 12 },
  progBg: { height: 5, borderRadius: 3, overflow: 'hidden' },
  progFill: { height: 5, borderRadius: 3 },

  achievementsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  achievementsRow: { flexDirection: 'row', gap: 10 },
  achievementPreview: { flex: 1, borderRadius: 14, padding: 10, alignItems: 'center', gap: 4, borderWidth: 1 },
  achEmoji: { fontSize: 24 },
  achName: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
});

const as = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 8, paddingVertical: 10, borderBottomWidth: 0.5,
  },
  headerBtn: { width: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  content: { padding: 16, gap: 12 },
  summaryCard: { borderRadius: 16, borderWidth: 1, padding: 16, alignItems: 'center', gap: 4 },
  summaryNum: { fontSize: 28, fontWeight: '800' },
  summaryLbl: { fontSize: 12 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '30.5%', borderRadius: 14, borderWidth: 1, padding: 12, alignItems: 'center', gap: 4 },
  emoji: { fontSize: 28 },
  name: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', maxWidth: 340, borderRadius: 20, padding: 24, alignItems: 'center', gap: 12 },
  modalEmoji: { fontSize: 64 },
  modalName: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  modalDesc: { fontSize: 14, textAlign: 'center', lineHeight: 19 },
  modalRewardRow: { flexDirection: 'row', alignItems: 'center', gap: 18, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  modalRewardItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  modalRewardTxt: { fontSize: 14, fontWeight: '800' },
  modalStatus: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  modalStatusTxt: { fontSize: 12, fontWeight: '700' },
});
