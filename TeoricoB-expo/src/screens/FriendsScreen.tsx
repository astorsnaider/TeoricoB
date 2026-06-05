/**
 * FriendsScreen — gestión completa de amistades.
 *
 * Estructura:
 * 1. Mi código (botón compartir)
 * 2. Input para añadir por código
 * 3. Solicitudes recibidas (con aceptar/rechazar)
 * 4. Lista de amigos
 * 5. Solicitudes enviadas (pendientes)
 *
 * Se invoca como Modal desde LeagueScreen.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput,
  Alert, Share, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { SHADOWS } from '../theme';
import { AvatarView } from '../components/AvatarView';
import { useFriends, FriendEntry } from '../friends/useFriends';
import { getLeagueInfo } from '../store/useStore';

interface Props {
  onClose: () => void;
}

export default function FriendsScreen({ onClose }: Props) {
  const theme = useTheme();
  const {
    available, loading, myCode, friends, incoming, outgoing,
    addFriendByCode, acceptFriend, rejectFriend, refresh,
  } = useFriends();

  const [codeInput, setCodeInput] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  if (!available) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
        <Header onClose={onClose} title="Amigos" theme={theme} />
        <View style={s.unauthBox}>
          <Ionicons name="lock-closed-outline" size={36} color={theme.textTertiary} />
          <Text style={[s.unauthTxt, { color: theme.textSecondary }]}>
            Inicia sesión para gestionar amigos reales.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const onShareCode = async () => {
    if (!myCode) return;
    try {
      await Share.share({
        message: `Añádeme en Teoric con mi código: ${myCode}`,
      });
    } catch {
      // Share cancelado; sin acción
    }
  };

  const onAdd = async () => {
    const code = codeInput.trim().toUpperCase();
    if (!code) return;
    setAdding(true);
    setAddError(null);
    setAddSuccess(null);
    const result = await addFriendByCode(code);
    setAdding(false);
    if (result.ok) {
      setCodeInput('');
      if (result.status === 'accepted') {
        setAddSuccess('¡Ya sois amigos!');
      } else {
        setAddSuccess('Solicitud enviada.');
      }
    } else {
      setAddError(result.error ?? 'Error desconocido');
    }
  };

  const onAccept = async (entry: FriendEntry) => {
    const r = await acceptFriend(entry.userId);
    if (!r.ok) Alert.alert('Error', r.error ?? 'No se pudo aceptar.');
  };

  const onReject = (entry: FriendEntry) => {
    Alert.alert(
      'Rechazar solicitud',
      `¿Rechazar la solicitud de ${entry.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            const r = await rejectFriend(entry.userId);
            if (!r.ok) Alert.alert('Error', r.error ?? 'No se pudo rechazar.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <Header onClose={onClose} title="Amigos" theme={theme} onRefresh={refresh} />

      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

        {/* Mi código */}
        <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[s.cardLabel, { color: theme.textSecondary }]}>Tu código</Text>
          <View style={s.codeRow}>
            <Text style={[s.codeBig, { color: theme.textPrimary }]}>
              {myCode ?? '— — — —'}
            </Text>
            <TouchableOpacity onPress={onShareCode} style={[s.shareBtn, { backgroundColor: theme.primary }]}>
              <Ionicons name="share-outline" size={16} color="#fff" />
              <Text style={s.shareBtnTxt}>Compartir</Text>
            </TouchableOpacity>
          </View>
          <Text style={[s.cardHint, { color: theme.textTertiary }]}>
            Comparte este código para que otra persona te añada como amigo.
          </Text>
        </View>

        {/* Añadir por código */}
        <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[s.cardLabel, { color: theme.textSecondary }]}>Añadir amigo</Text>
          <View style={s.addRow}>
            <TextInput
              style={[s.codeInput, { color: theme.textPrimary, borderColor: theme.border }]}
              value={codeInput}
              onChangeText={t => {
                setCodeInput(t.toUpperCase());
                setAddError(null);
                setAddSuccess(null);
              }}
              placeholder="ABCD-1234"
              placeholderTextColor={theme.textTertiary}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={9}
              editable={!adding}
              onSubmitEditing={onAdd}
            />
            <TouchableOpacity
              style={[s.addBtn, { backgroundColor: codeInput.length >= 4 && !adding ? theme.primary : theme.border }]}
              onPress={onAdd}
              disabled={codeInput.length < 4 || adding}
            >
              {adding
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.addBtnTxt}>Añadir</Text>}
            </TouchableOpacity>
          </View>
          {addError && (
            <View style={s.feedbackRow}>
              <Ionicons name="alert-circle" size={14} color={theme.wrong} />
              <Text style={[s.feedbackTxt, { color: theme.wrong }]}>{addError}</Text>
            </View>
          )}
          {addSuccess && (
            <View style={s.feedbackRow}>
              <Ionicons name="checkmark-circle" size={14} color={theme.correct} />
              <Text style={[s.feedbackTxt, { color: theme.correct }]}>{addSuccess}</Text>
            </View>
          )}
        </View>

        {/* Solicitudes recibidas */}
        {incoming.length > 0 && (
          <>
            <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>
              Solicitudes recibidas ({incoming.length})
            </Text>
            <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border, padding: 0 }]}>
              {incoming.map((entry, i) => (
                <View
                  key={entry.userId}
                  style={[s.entryRow, { borderBottomColor: theme.border }, i < incoming.length - 1 && s.entryDivider]}
                >
                  <AvatarView
                    color={entry.avatarEmoji.startsWith('#') ? entry.avatarEmoji : getLeagueInfo(entry.league).color}
                    name={entry.name}
                    size={36}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.entryName, { color: theme.textPrimary }]} numberOfLines={1}>{entry.name}</Text>
                    <Text style={[s.entryMeta, { color: theme.textSecondary }]}>
                      {getLeagueInfo(entry.league).emoji} {entry.league}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => onAccept(entry)} style={[s.iconBtn, { backgroundColor: theme.correct }]}>
                    <Ionicons name="checkmark" size={18} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onReject(entry)} style={[s.iconBtn, { backgroundColor: theme.bg2 }]}>
                    <Ionicons name="close" size={18} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Amigos aceptados */}
        <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>
          Tus amigos {friends.length > 0 ? `(${friends.length})` : ''}
        </Text>
        {loading && friends.length === 0 ? (
          <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border, alignItems: 'center' }]}>
            <ActivityIndicator color={theme.primary} />
          </View>
        ) : friends.length === 0 ? (
          <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border, alignItems: 'center', gap: 6 }]}>
            <Ionicons name="people-outline" size={28} color={theme.textTertiary} />
            <Text style={[s.cardHint, { color: theme.textSecondary, textAlign: 'center' }]}>
              Cuando aceptes una solicitud o el otro acepte la tuya, aparecerán aquí.
            </Text>
          </View>
        ) : (
          <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border, padding: 0 }]}>
            {friends.map((entry, i) => (
              <View
                key={entry.userId}
                style={[s.entryRow, { borderBottomColor: theme.border }, i < friends.length - 1 && s.entryDivider]}
              >
                <AvatarView
                  color={entry.avatarEmoji.startsWith('#') ? entry.avatarEmoji : getLeagueInfo(entry.league).color}
                  name={entry.name}
                  size={36}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[s.entryName, { color: theme.textPrimary }]} numberOfLines={1}>{entry.name}</Text>
                  <View style={s.entryMetaRow}>
                    <Text style={[s.entryMeta, { color: theme.textSecondary }]}>
                      {getLeagueInfo(entry.league).emoji} {entry.league}
                    </Text>
                    <Ionicons name="flame" size={12} color={theme.orange} />
                    <Text style={[s.entryMeta, { color: theme.textSecondary }]}>{entry.streak}</Text>
                  </View>
                </View>
                <Text style={[s.entryXP, { color: theme.textSecondary }]}>{entry.weeklyXP} XP</Text>
              </View>
            ))}
          </View>
        )}

        {/* Solicitudes enviadas */}
        {outgoing.length > 0 && (
          <>
            <Text style={[s.sectionTitle, { color: theme.textTertiary }]}>
              Pendientes de respuesta ({outgoing.length})
            </Text>
            <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border, padding: 0 }]}>
              {outgoing.map((entry, i) => (
                <View
                  key={entry.userId}
                  style={[s.entryRow, { borderBottomColor: theme.border, opacity: 0.7 }, i < outgoing.length - 1 && s.entryDivider]}
                >
                  <AvatarView
                    color={entry.avatarEmoji.startsWith('#') ? entry.avatarEmoji : getLeagueInfo(entry.league).color}
                    name={entry.name}
                    size={36}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.entryName, { color: theme.textPrimary }]} numberOfLines={1}>{entry.name}</Text>
                    <Text style={[s.entryMeta, { color: theme.textTertiary }]}>Esperando respuesta…</Text>
                  </View>
                  <TouchableOpacity onPress={() => onReject(entry)} style={[s.iconBtn, { backgroundColor: theme.bg2 }]}>
                    <Ionicons name="close" size={18} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ onClose, title, theme, onRefresh }: { onClose: () => void; title: string; theme: ReturnType<typeof useTheme>; onRefresh?: () => void }) {
  return (
    <View style={[s.header, { borderBottomColor: theme.border }]}>
      <TouchableOpacity onPress={onClose} style={s.headerBtn} hitSlop={10}>
        <Ionicons name="close" size={24} color={theme.textSecondary} />
      </TouchableOpacity>
      <Text style={[s.headerTitle, { color: theme.textPrimary }]}>{title}</Text>
      {onRefresh ? (
        <TouchableOpacity onPress={onRefresh} style={s.headerBtn} hitSlop={10}>
          <Ionicons name="refresh" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      ) : (
        <View style={s.headerBtn} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 0.5,
  },
  headerBtn: { width: 36, alignItems: 'center', justifyContent: 'center', padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  content: { padding: 16, gap: 14 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 8 },
  cardLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  cardHint: { fontSize: 12, lineHeight: 16 },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  codeBig: { flex: 1, fontSize: 24, fontWeight: '800', letterSpacing: 4, fontFamily: 'Menlo' },
  shareBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, ...SHADOWS.small },
  shareBtnTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  codeInput: { flex: 1, fontSize: 16, fontWeight: '600', letterSpacing: 2, fontFamily: 'Menlo', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  addBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, ...SHADOWS.small },
  addBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
  feedbackRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  feedbackTxt: { fontSize: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginTop: 4 },
  entryRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 11 },
  entryDivider: { borderBottomWidth: 0.5 },
  entryName: { fontSize: 14, fontWeight: '600' },
  entryMeta: { fontSize: 11 },
  entryMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  entryXP: { fontSize: 12, fontWeight: '700' },
  iconBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  unauthBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 14 },
  unauthTxt: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
