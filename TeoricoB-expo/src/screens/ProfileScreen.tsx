import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert, Switch, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useStore, getAllAchievements, getLeagueInfo } from '../store/useStore';
import { useTheme } from '../hooks/useTheme';
import { SHADOWS } from '../theme';
import { AvatarView, AVATAR_COLORS } from '../components/AvatarView';
import LegalScreen from './LegalScreen';
import StatsScreen from './StatsScreen';
import { useSoundEffect } from '../audio/useSoundEffect';
import { useAuth } from '../auth/AuthContext';
import AuthScreen from '../auth/AuthScreen';
import { useSyncStatus, syncStatusLabel } from '../sync/useSyncStatus';

export default function ProfileScreen() {
  const [showLegal, setShowLegal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  if (showLegal) return <LegalScreen onBack={() => setShowLegal(false)} />;
  if (showStats) return <StatsScreen onBack={() => setShowStats(false)} />;
  return (
    <>
      <ProfileMain
        onShowLegal={() => setShowLegal(true)}
        onShowStats={() => setShowStats(true)}
        onShowAuth={() => setShowAuth(true)}
      />
      <Modal visible={showAuth} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAuth(false)}>
        <AuthScreen onClose={() => setShowAuth(false)} />
      </Modal>
    </>
  );
}

function ProfileMain({ onShowLegal, onShowStats, onShowAuth }: { onShowLegal: () => void; onShowStats: () => void; onShowAuth: () => void }) {
  const { user: authUser, signOut, deleteAccount } = useAuth();
  const syncStatus = useSyncStatus();
  const user = useStore(s => s.user);
  const topics = useStore(s => s.topics);
  const resetProgress = useStore(s => s.resetProgress);
  const isDarkMode = useStore(s => s.isDarkMode);
  const toggleDarkMode = useStore(s => s.toggleDarkMode);
  const soundsEnabled = useStore(s => s.soundsEnabled);
  const toggleSounds = useStore(s => s.toggleSounds);
  const notifications = useStore(s => s.notifications);
  const setNotificationsConfig = useStore(s => s.setNotificationsConfig);
  const setProfilePhoto = useStore(s => s.setProfilePhoto);
  const setAvatarColor = useStore(s => s.setAvatarColor);
  const theme = useTheme();
  const playSound = useSoundEffect();
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

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

  const confirmDeleteAccount = () => {
    // Confirmación doble por ser acción irreversible (Art. 17 RGPD)
    Alert.alert(
      'Borrar mi cuenta',
      'Se eliminarán de forma permanente tus datos en la nube: progreso, racha, logros, fallos, exámenes y amigos.\n\nTu correo quedará en cola de eliminación durante 30 días. Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '¿Confirmas el borrado?',
              'Si sigues, no podrás recuperar tu progreso. ¿Estás completamente seguro?',
              [
                { text: 'No, cancelar', style: 'cancel' },
                {
                  text: 'Sí, borrar mi cuenta',
                  style: 'destructive',
                  onPress: async () => {
                    const result = await deleteAccount();
                    if (result.ok) {
                      resetProgress();
                      Alert.alert(
                        'Cuenta eliminada',
                        'Tus datos se han borrado. Gracias por haber usado Teoric.'
                      );
                    } else {
                      Alert.alert('No se pudo borrar', result.error ?? 'Inténtalo de nuevo más tarde.');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permiso necesario', 'Para elegir foto necesitamos acceso a tu galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setProfilePhoto(result.assets[0].uri);
    }
  };

  const removePhoto = () => {
    Alert.alert('Quitar foto', '¿Volver al avatar de color?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Quitar', onPress: () => setProfilePhoto(undefined) },
    ]);
  };

  const onAvatarPress = () => {
    if (user.profilePhotoUri) {
      Alert.alert('Foto de perfil', undefined, [
        { text: 'Cambiar foto', onPress: pickPhoto },
        { text: 'Quitar foto', style: 'destructive', onPress: removePhoto },
        { text: 'Cancelar', style: 'cancel' },
      ]);
    } else {
      Alert.alert('Avatar', undefined, [
        { text: 'Elegir foto', onPress: pickPhoto },
        { text: 'Cambiar color', onPress: () => setColorPickerOpen(true) },
        { text: 'Cancelar', style: 'cancel' },
      ]);
    }
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* Avatar */}
        <View style={s.profileHeader}>
          <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.8}>
            <View style={s.avatarWrapper}>
              <AvatarView
                color={user.avatarEmoji}
                name={user.name}
                photoUri={user.profilePhotoUri}
                size={94}
                borderColor={league.color}
                borderWidth={3}
              />
              <View style={[s.editBadge, { backgroundColor: theme.primary, borderColor: theme.bg }]}>
                <Ionicons name={user.profilePhotoUri ? 'camera' : 'create'} size={13} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>
          <Text style={[s.profileName, { color: theme.textPrimary }]}>{user.name}</Text>
          <View style={[s.leagueBadge, { backgroundColor: league.color + '18' }]}>
            <Text style={{ fontSize: 14 }}>{league.emoji}</Text>
            <Text style={[s.leagueTxt, { color: league.color }]}>Liga {user.league}</Text>
          </View>
        </View>

        {/* Account section: login o info de cuenta */}
        <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border, marginBottom: 16 }]}>
          {authUser ? (
            <>
              <View style={s.accountRow}>
                <View
                  style={[
                    s.accountIcon,
                    { backgroundColor: syncIconBg(syncStatus.kind, theme) },
                  ]}
                >
                  <Ionicons
                    name={syncIconName(syncStatus.kind)}
                    size={20}
                    color={syncIconColor(syncStatus.kind, theme)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.accountTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                    {authUser.email ?? 'Sesión activa'}
                  </Text>
                  <Text style={[s.accountSub, { color: theme.textSecondary }]} numberOfLines={1}>
                    {syncStatusLabel(syncStatus, authUser.email)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert('Cerrar sesión', 'Tu progreso local seguirá disponible. ¿Cerrar sesión?', [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'Cerrar sesión', style: 'destructive', onPress: () => signOut() },
                    ]);
                  }}
                  style={s.accountAction}
                >
                  <Ionicons name="log-out-outline" size={18} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity onPress={onShowAuth} style={s.accountRow} activeOpacity={0.7}>
              <View style={[s.accountIcon, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="cloud-upload-outline" size={20} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.accountTitle, { color: theme.textPrimary }]}>
                  Iniciar sesión o crear cuenta
                </Text>
                <Text style={[s.accountSub, { color: theme.textSecondary }]}>
                  Sincroniza tu progreso entre dispositivos. Es gratis.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Color picker modal */}
        <Modal visible={colorPickerOpen} transparent animationType="fade" onRequestClose={() => setColorPickerOpen(false)}>
          <View style={s.modalBackdrop}>
            <View style={[s.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[s.modalTitle, { color: theme.textPrimary }]}>Elige tu color</Text>
              <View style={s.colorGrid}>
                {AVATAR_COLORS.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      s.colorOption, { backgroundColor: c },
                      c === user.avatarEmoji && { borderWidth: 3, borderColor: theme.textPrimary }
                    ]}
                    onPress={() => { setAvatarColor(c); setColorPickerOpen(false); }}
                  />
                ))}
              </View>
              <TouchableOpacity
                style={[s.modalClose, { borderColor: theme.border }]}
                onPress={() => setColorPickerOpen(false)}
              >
                <Text style={[s.modalCloseTxt, { color: theme.textSecondary }]}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
          <View style={[s.settingDivider, { backgroundColor: theme.border }]} />
          <View style={s.settingRow}>
            <Ionicons name="volume-low-outline" size={20} color={theme.textSecondary} />
            <Text style={[s.settingLabel, { color: theme.textPrimary }]}>Efectos de sonido</Text>
            <Switch
              value={soundsEnabled}
              onValueChange={toggleSounds}
              trackColor={{ false: theme.border, true: theme.primary + '80' }}
              thumbColor={soundsEnabled ? theme.primary : theme.textTertiary}
            />
          </View>
          <View style={[s.settingDivider, { backgroundColor: theme.border }]} />
          <View style={s.settingRow}>
            <Ionicons name="notifications-outline" size={20} color={theme.textSecondary} />
            <View style={{ flex: 1 }}>
              <Text style={[s.settingLabel, { color: theme.textPrimary }]}>Notificaciones</Text>
              <Text style={[s.settingSub, { color: theme.textSecondary }]}>
                Recordatorio diario {notifications.reminderHour.toString().padStart(2, '0')}:{notifications.reminderMinute.toString().padStart(2, '0')}
              </Text>
            </View>
            <Switch
              value={notifications.enabled}
              onValueChange={(enabled) => setNotificationsConfig({ enabled })}
              trackColor={{ false: theme.border, true: theme.primary + '80' }}
              thumbColor={notifications.enabled ? theme.primary : theme.textTertiary}
            />
          </View>
          {notifications.enabled && (
            <>
              <View style={[s.settingDivider, { backgroundColor: theme.border }]} />
              <View style={s.settingRow}>
                <Ionicons name="alarm-outline" size={20} color={theme.textSecondary} />
                <Text style={[s.settingLabel, { color: theme.textPrimary }]}>Recordatorio de estudio</Text>
                <Switch
                  value={notifications.reminderEnabled}
                  onValueChange={(reminderEnabled) => setNotificationsConfig({ reminderEnabled })}
                  trackColor={{ false: theme.border, true: theme.primary + '80' }}
                  thumbColor={notifications.reminderEnabled ? theme.primary : theme.textTertiary}
                />
              </View>
              {notifications.reminderEnabled && (
                <>
                  <View style={[s.settingDivider, { backgroundColor: theme.border }]} />
                  <View style={s.settingRow}>
                    <Ionicons name="time-outline" size={20} color={theme.textSecondary} />
                    <View style={{ flex: 1 }}>
                      <Text style={[s.settingLabel, { color: theme.textPrimary }]}>Hora del recordatorio</Text>
                      <Text style={[s.settingSub, { color: theme.textSecondary }]}>
                        Recibirás un aviso todos los días a esta hora
                      </Text>
                    </View>
                    <View style={s.timeStepper}>
                      <TouchableOpacity
                        style={[s.timeBtn, { backgroundColor: theme.bg2 }]}
                        onPress={() => setNotificationsConfig({ reminderHour: (notifications.reminderHour + 23) % 24 })}
                      >
                        <Ionicons name="remove" size={14} color={theme.textPrimary} />
                      </TouchableOpacity>
                      <Text style={[s.timeText, { color: theme.textPrimary }]}>
                        {notifications.reminderHour.toString().padStart(2, '0')}:{notifications.reminderMinute.toString().padStart(2, '0')}
                      </Text>
                      <TouchableOpacity
                        style={[s.timeBtn, { backgroundColor: theme.bg2 }]}
                        onPress={() => setNotificationsConfig({ reminderHour: (notifications.reminderHour + 1) % 24 })}
                      >
                        <Ionicons name="add" size={14} color={theme.textPrimary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
              <View style={[s.settingDivider, { backgroundColor: theme.border }]} />
              <View style={s.settingRow}>
                <Ionicons name="flame-outline" size={20} color={theme.textSecondary} />
                <Text style={[s.settingLabel, { color: theme.textPrimary }]}>Aviso de racha en riesgo</Text>
                <Switch
                  value={notifications.streakDangerEnabled}
                  onValueChange={(streakDangerEnabled) => setNotificationsConfig({ streakDangerEnabled })}
                  trackColor={{ false: theme.border, true: theme.primary + '80' }}
                  thumbColor={notifications.streakDangerEnabled ? theme.primary : theme.textTertiary}
                />
              </View>
              <View style={[s.settingDivider, { backgroundColor: theme.border }]} />
              <View style={s.settingRow}>
                <Ionicons name="heart-outline" size={20} color={theme.textSecondary} />
                <Text style={[s.settingLabel, { color: theme.textPrimary }]}>Aviso de vidas llenas</Text>
                <Switch
                  value={notifications.heartsFullEnabled}
                  onValueChange={(heartsFullEnabled) => setNotificationsConfig({ heartsFullEnabled })}
                  trackColor={{ false: theme.border, true: theme.primary + '80' }}
                  thumbColor={notifications.heartsFullEnabled ? theme.primary : theme.textTertiary}
                />
              </View>
            </>
          )}
          <View style={[s.settingDivider, { backgroundColor: theme.border }]} />
          <TouchableOpacity style={s.settingRow} onPress={() => { playSound('tap'); onShowStats(); }} activeOpacity={0.7}>
            <Ionicons name="stats-chart-outline" size={20} color={theme.textSecondary} />
            <Text style={[s.settingLabel, { color: theme.textPrimary }]}>Estadísticas detalladas</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
          </TouchableOpacity>
          <View style={[s.settingDivider, { backgroundColor: theme.border }]} />
          <TouchableOpacity style={s.settingRow} onPress={() => { playSound('tap'); onShowLegal(); }} activeOpacity={0.7}>
            <Ionicons name="shield-checkmark-outline" size={20} color={theme.textSecondary} />
            <Text style={[s.settingLabel, { color: theme.textPrimary }]}>Información legal</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Reset */}
        <TouchableOpacity
          style={[s.resetBtn, { borderColor: theme.wrong }]}
          onPress={confirmReset}
        >
          <Ionicons name="trash-outline" size={18} color={theme.wrong} />
          <Text style={[s.resetTxt, { color: theme.wrong }]}>Reiniciar progreso</Text>
        </TouchableOpacity>

        {/* Borrar cuenta (solo si autenticado) */}
        {authUser && (
          <TouchableOpacity
            onPress={confirmDeleteAccount}
            style={s.deleteAccountBtn}
          >
            <Ionicons name="warning-outline" size={14} color={theme.textTertiary} />
            <Text style={[s.deleteAccountTxt, { color: theme.textTertiary }]}>
              Borrar mi cuenta y todos mis datos
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 12 },
  profileHeader: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  avatarWrapper: { position: 'relative', ...SHADOWS.medium },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5,
  },
  profileName: { fontSize: 22, fontWeight: '800' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', maxWidth: 360, borderRadius: 20, padding: 24, borderWidth: 1, gap: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  colorOption: { width: 50, height: 50, borderRadius: 25 },
  modalClose: { borderWidth: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  modalCloseTxt: { fontSize: 14, fontWeight: '600' },
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
  settingDivider: { height: 0.5, marginHorizontal: 16 },
  settingLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  settingSub: { fontSize: 11, marginTop: 2 },
  timeStepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeBtn: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  timeText: { fontSize: 15, fontWeight: '800', minWidth: 50, textAlign: 'center' },
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, borderWidth: 1.5, padding: 14 },
  resetTxt: { fontSize: 15, fontWeight: '600' },
  deleteAccountBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, padding: 8 },
  deleteAccountTxt: { fontSize: 12, fontWeight: '500', textDecorationLine: 'underline' },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  accountIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  accountTitle: { fontSize: 14, fontWeight: '700' },
  accountSub: { fontSize: 12, marginTop: 2 },
  accountAction: { padding: 8 },
});

// ── Helpers para el indicador de sync ──────────────────────────────────
type SyncKind = 'idle' | 'pending' | 'syncing' | 'synced' | 'error';

function syncIconName(kind: SyncKind): keyof typeof Ionicons.glyphMap {
  switch (kind) {
    case 'pending':  return 'cloud-upload-outline';
    case 'syncing':  return 'sync';
    case 'error':    return 'cloud-offline-outline';
    case 'synced':
    case 'idle':
    default:         return 'cloud-done';
  }
}
function syncIconColor(kind: SyncKind, theme: ReturnType<typeof useTheme>): string {
  switch (kind) {
    case 'pending':  return theme.orange;
    case 'syncing':  return theme.blue;
    case 'error':    return theme.wrong;
    case 'synced':
    case 'idle':
    default:         return theme.correct;
  }
}
function syncIconBg(kind: SyncKind, theme: ReturnType<typeof useTheme>): string {
  return syncIconColor(kind, theme) + '20';
}
