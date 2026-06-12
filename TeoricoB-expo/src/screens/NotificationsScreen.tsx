/**
 * NotificationsScreen — toggles de notificaciones locales.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useStore } from '../store/useStore';

interface Props { onBack: () => void; }

export default function NotificationsScreen({ onBack }: Props) {
  const theme = useTheme();
  const notifications = useStore(s => s.notifications);
  const setNotificationsConfig = useStore(s => s.setNotificationsConfig);

  const stepHour = (delta: number) =>
    setNotificationsConfig({ reminderHour: (notifications.reminderHour + delta + 24) % 24 });

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <View style={[s.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onBack} hitSlop={12} style={s.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: theme.textPrimary }]}>Notificaciones</Text>
        <View style={s.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={s.row}>
            <Ionicons name="notifications-outline" size={20} color={theme.textSecondary} />
            <View style={{ flex: 1 }}>
              <Text style={[s.label, { color: theme.textPrimary }]}>Activar notificaciones</Text>
              <Text style={[s.sub, { color: theme.textSecondary }]}>
                Recordatorios, racha, vidas
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
              <View style={[s.divider, { backgroundColor: theme.border }]} />
              <View style={s.row}>
                <Ionicons name="alarm-outline" size={20} color={theme.textSecondary} />
                <Text style={[s.label, { color: theme.textPrimary }]}>Recordatorio de estudio</Text>
                <Switch
                  value={notifications.reminderEnabled}
                  onValueChange={(reminderEnabled) => setNotificationsConfig({ reminderEnabled })}
                  trackColor={{ false: theme.border, true: theme.primary + '80' }}
                  thumbColor={notifications.reminderEnabled ? theme.primary : theme.textTertiary}
                />
              </View>
              {notifications.reminderEnabled && (
                <>
                  <View style={[s.divider, { backgroundColor: theme.border }]} />
                  <View style={s.row}>
                    <Ionicons name="time-outline" size={20} color={theme.textSecondary} />
                    <View style={{ flex: 1 }}>
                      <Text style={[s.label, { color: theme.textPrimary }]}>Hora</Text>
                      <Text style={[s.sub, { color: theme.textSecondary }]}>
                        Te avisamos todos los días
                      </Text>
                    </View>
                    <View style={s.stepper}>
                      <TouchableOpacity style={[s.stepBtn, { backgroundColor: theme.bg2 }]} onPress={() => stepHour(-1)}>
                        <Ionicons name="remove" size={14} color={theme.textPrimary} />
                      </TouchableOpacity>
                      <Text style={[s.stepTxt, { color: theme.textPrimary }]}>
                        {notifications.reminderHour.toString().padStart(2, '0')}:{notifications.reminderMinute.toString().padStart(2, '0')}
                      </Text>
                      <TouchableOpacity style={[s.stepBtn, { backgroundColor: theme.bg2 }]} onPress={() => stepHour(1)}>
                        <Ionicons name="add" size={14} color={theme.textPrimary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
              <View style={[s.divider, { backgroundColor: theme.border }]} />
              <View style={s.row}>
                <Ionicons name="flame-outline" size={20} color={theme.textSecondary} />
                <Text style={[s.label, { color: theme.textPrimary }]}>Racha en riesgo</Text>
                <Switch
                  value={notifications.streakDangerEnabled}
                  onValueChange={(streakDangerEnabled) => setNotificationsConfig({ streakDangerEnabled })}
                  trackColor={{ false: theme.border, true: theme.primary + '80' }}
                  thumbColor={notifications.streakDangerEnabled ? theme.primary : theme.textTertiary}
                />
              </View>
              <View style={[s.divider, { backgroundColor: theme.border }]} />
              <View style={s.row}>
                <Ionicons name="heart-outline" size={20} color={theme.textSecondary} />
                <Text style={[s.label, { color: theme.textPrimary }]}>Vidas llenas</Text>
                <Switch
                  value={notifications.heartsFullEnabled}
                  onValueChange={(heartsFullEnabled) => setNotificationsConfig({ heartsFullEnabled })}
                  trackColor={{ false: theme.border, true: theme.primary + '80' }}
                  thumbColor={notifications.heartsFullEnabled ? theme.primary : theme.textTertiary}
                />
              </View>
            </>
          )}
        </View>

        {/* Sociales */}
        {notifications.enabled && (
          <>
            <Text style={[s.sectionLabel, { color: theme.textSecondary }]}>Amigos</Text>
            <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={s.row}>
                <Ionicons name="person-add-outline" size={20} color={theme.textSecondary} />
                <Text style={[s.label, { color: theme.textPrimary }]}>Nuevas solicitudes</Text>
                <Switch
                  value={notifications.friendRequestEnabled}
                  onValueChange={(friendRequestEnabled) => setNotificationsConfig({ friendRequestEnabled })}
                  trackColor={{ false: theme.border, true: theme.primary + '80' }}
                  thumbColor={notifications.friendRequestEnabled ? theme.primary : theme.textTertiary}
                />
              </View>
              <View style={[s.divider, { backgroundColor: theme.border }]} />
              <View style={s.row}>
                <Ionicons name="flame-outline" size={20} color={theme.textSecondary} />
                <Text style={[s.label, { color: theme.textPrimary }]}>Racha de amistad en peligro</Text>
                <Switch
                  value={notifications.friendStreakDangerEnabled}
                  onValueChange={(friendStreakDangerEnabled) => setNotificationsConfig({ friendStreakDangerEnabled })}
                  trackColor={{ false: theme.border, true: theme.primary + '80' }}
                  thumbColor={notifications.friendStreakDangerEnabled ? theme.primary : theme.textTertiary}
                />
              </View>
              <View style={[s.divider, { backgroundColor: theme.border }]} />
              <View style={s.row}>
                <Ionicons name="trending-up-outline" size={20} color={theme.textSecondary} />
                <Text style={[s.label, { color: theme.textPrimary }]}>Un amigo te supera</Text>
                <Switch
                  value={notifications.friendPassedEnabled}
                  onValueChange={(friendPassedEnabled) => setNotificationsConfig({ friendPassedEnabled })}
                  trackColor={{ false: theme.border, true: theme.primary + '80' }}
                  thumbColor={notifications.friendPassedEnabled ? theme.primary : theme.textTertiary}
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 8, paddingVertical: 10, borderBottomWidth: 0.5,
  },
  headerBtn: { width: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  content: { padding: 16, gap: 16 },
  card: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  label: { flex: 1, fontSize: 15, fontWeight: '500' },
  sub: { fontSize: 11, marginTop: 2 },
  divider: { height: 0.5, marginHorizontal: 16 },
  sectionLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4, marginLeft: 4 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBtn: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  stepTxt: { fontSize: 15, fontWeight: '800', minWidth: 50, textAlign: 'center' },
});
