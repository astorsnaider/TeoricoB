/**
 * FriendProfileScreen — perfil de un amigo aceptado.
 *
 * Muestra avatar grande, nombre, @username, liga, racha individual,
 * racha de amistad compartida (fase 2), XP semanal y total. Permite
 * eliminar la amistad.
 *
 * Se monta como SubPage desde FriendsScreen.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { SHADOWS } from '../theme';
import { AvatarView } from '../components/AvatarView';
import { getLeagueInfo } from '../store/useStore';
import { FriendEntry } from '../friends/useFriends';

interface Props {
  friend: FriendEntry;
  onBack: () => void;
  onRemove: (otherUserId: string) => Promise<{ ok: boolean; error?: string }>;
}

export default function FriendProfileScreen({ friend, onBack, onRemove }: Props) {
  const theme = useTheme();
  const [removing, setRemoving] = useState(false);
  const li = getLeagueInfo(friend.league);
  const avatarColor = friend.avatarEmoji.startsWith('#') ? friend.avatarEmoji : li.color;

  const confirmRemove = () => {
    Alert.alert(
      'Eliminar amigo',
      `¿Seguro que quieres eliminar a ${friend.name} de tu lista de amigos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setRemoving(true);
            const r = await onRemove(friend.userId);
            setRemoving(false);
            if (r.ok) onBack();
            else Alert.alert('Error', r.error ?? 'No se pudo eliminar.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <View style={[s.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onBack} hitSlop={12} style={s.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: theme.textPrimary }]}>Perfil</Text>
        <View style={s.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {/* Avatar + nombre */}
        <View style={s.hero}>
          <AvatarView
            color={friend.avatarEmoji}
            name={friend.name}
            photoUri={friend.profilePhotoUrl ?? undefined}
            size={104}
            borderColor={li.color}
            borderWidth={3}
          />
          <Text style={[s.name, { color: theme.textPrimary }]}>{friend.name}</Text>
          {friend.username && (
            <Text style={[s.handle, { color: theme.textSecondary }]}>@{friend.username}</Text>
          )}
          <View style={[s.leagueBadge, { backgroundColor: li.color + '18' }]}>
            <Text style={{ fontSize: 14 }}>{li.emoji}</Text>
            <Text style={[s.leagueTxt, { color: li.color }]}>Liga {friend.league}</Text>
          </View>
        </View>

        {/* Racha de amistad compartida */}
        {friend.friendStreak > 0 && (
          <View style={[s.streakCard, {
            backgroundColor: (friend.streakAtRisk ? theme.orange : theme.primary) + '14',
            borderColor: (friend.streakAtRisk ? theme.orange : theme.primary) + '40',
          }]}>
            <Ionicons name="flame" size={26} color={friend.streakAtRisk ? theme.orange : theme.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[s.streakValue, { color: theme.textPrimary }]}>
                {friend.friendStreak} día{friend.friendStreak === 1 ? '' : 's'} de racha juntos
              </Text>
              <Text style={[s.streakSub, { color: theme.textSecondary }]}>
                {friend.streakAtRisk
                  ? '¡En peligro! Estudiad hoy los dos para mantenerla.'
                  : 'Seguid estudiando cada día para que crezca.'}
              </Text>
            </View>
          </View>
        )}

        {/* Stats */}
        <View style={s.statsGrid}>
          <Stat icon="flame" label="Racha" value={`${friend.streak}`} color={theme.orange} theme={theme} />
          <Stat icon="trophy" label="XP semanal" value={`${friend.weeklyXP}`} color={li.color} theme={theme} />
          <Stat icon="star" label="XP total" value={`${friend.xp}`} color={theme.yellow} theme={theme} />
        </View>

        {/* Eliminar */}
        <TouchableOpacity
          style={[s.removeBtn, { borderColor: theme.wrong + '60' }]}
          onPress={confirmRemove}
          disabled={removing}
        >
          {removing
            ? <ActivityIndicator color={theme.wrong} />
            : <>
                <Ionicons name="person-remove-outline" size={18} color={theme.wrong} />
                <Text style={[s.removeTxt, { color: theme.wrong }]}>Eliminar amigo</Text>
              </>}
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ icon, label, value, color, theme }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={[s.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[s.statValue, { color: theme.textPrimary }]}>{value}</Text>
      <Text style={[s.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
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
  hero: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  name: { fontSize: 22, fontWeight: '800' },
  handle: { fontSize: 14, marginTop: -2 },
  leagueBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, marginTop: 4 },
  leagueTxt: { fontSize: 14, fontWeight: '700' },
  streakCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, borderWidth: 1, padding: 14 },
  streakValue: { fontSize: 15, fontWeight: '800' },
  streakSub: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  statsGrid: { flexDirection: 'row', gap: 10 },
  statBox: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1 },
  statValue: { fontSize: 18, fontWeight: '900' },
  statLabel: { fontSize: 10, textAlign: 'center' },
  removeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 14, borderWidth: 1.5, padding: 14, marginTop: 4,
  },
  removeTxt: { fontSize: 15, fontWeight: '700' },
});
