/**
 * FriendsScreen — gestión moderna de amistades (estilo Duolingo).
 *
 * Estructura:
 * 1. Mi @username (botón compartir teoric://u/<username>).
 *    Si no tiene username, banner para escogerlo.
 * 2. Buscador por @username con autocompletado.
 * 3. Solicitudes recibidas (aceptar/rechazar).
 * 4. Lista de amigos.
 * 5. Solicitudes enviadas (pendientes).
 *
 * Se invoca como Modal desde LeagueScreen.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Alert, Share, ActivityIndicator, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { SHADOWS } from '../theme';
import { AvatarView } from '../components/AvatarView';
import { useFriends, FriendEntry, UserSearchResult } from '../friends/useFriends';
import { getLeagueInfo } from '../store/useStore';
import {
  getContactsPermission, requestContactsPermission,
  findFriendsInContacts, ContactMatch,
} from '../friends/contacts';
import SubPage from '../components/SubPage';
import FriendProfileScreen from './FriendProfileScreen';
import QRFriendScreen from './QRFriendScreen';

interface Props {
  onClose: () => void;
  /** Si llega un username via deep link, lo precargamos en el buscador. */
  prefillUsername?: string;
}

const SHARE_BASE = 'teoric://u/';

export default function FriendsScreen({ onClose, prefillUsername }: Props) {
  const theme = useTheme();
  const {
    available, loading, myUsername, usernameCooldownDays,
    friends, incoming, outgoing,
    setUsername, searchUsers, addFriendByUsername, acceptFriend, rejectFriend, removeFriend, refresh,
  } = useFriends();

  // Amigo cuyo perfil se está viendo (overlay SubPage).
  const [profileFriend, setProfileFriend] = useState<FriendEntry | null>(null);
  // Pantalla QR (mi código + escanear) como overlay SubPage.
  const [qrOpen, setQrOpen] = useState(false);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Record<string, 'pending' | 'accepted'>>({});

  // Username chooser
  const [chooserOpen, setChooserOpen] = useState(false);

  // Contactos del móvil (fase 2)
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsMatches, setContactsMatches] = useState<ContactMatch[] | null>(null);
  const [contactsError, setContactsError] = useState<string | null>(null);
  const [contactsHidden, setContactsHidden] = useState(false);

  // Si llega un deep link teoric://u/<username>, precarga buscador
  useEffect(() => {
    if (prefillUsername) setQuery(prefillUsername);
  }, [prefillUsername]);

  // Búsqueda con debounce
  useEffect(() => {
    const clean = query.trim();
    if (clean.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      const found = await searchUsers(clean);
      setResults(found);
      setSearching(false);
    }, 220);
    return () => clearTimeout(t);
  }, [query, searchUsers]);

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

  const shareLink = myUsername ? `${SHARE_BASE}${myUsername}` : null;

  const onShare = async () => {
    if (!myUsername || !shareLink) return;
    try {
      await Share.share({
        message: `Soy @${myUsername} en Teoric. Añádeme como amigo: ${shareLink}`,
      });
    } catch { /* cancelado */ }
  };

  const onAdd = async (uname: string) => {
    setAdding(uname);
    const r = await addFriendByUsername(uname);
    setAdding(null);
    if (r.ok && r.status) {
      setAddedIds(prev => ({ ...prev, [uname]: r.status! }));
    } else if (!r.ok) {
      Alert.alert('No se pudo añadir', r.error ?? 'Error desconocido');
    }
  };

  const onAccept = async (entry: FriendEntry) => {
    const r = await acceptFriend(entry.userId);
    if (!r.ok) Alert.alert('Error', r.error ?? 'No se pudo aceptar.');
  };

  const runContactsImport = async () => {
    setContactsLoading(true);
    setContactsError(null);
    try {
      let permission = await getContactsPermission();
      if (permission !== 'granted') {
        permission = await requestContactsPermission();
      }
      if (permission !== 'granted') {
        setContactsError('Permiso denegado. Habilítalo en Ajustes para encontrar amigos.');
        return;
      }
      const matches = await findFriendsInContacts();
      setContactsMatches(matches);
      if (matches.length === 0) {
        setContactsError('Ninguno de tus contactos usa Teoric todavía.');
      }
    } catch (e) {
      setContactsError(e instanceof Error ? e.message : 'No se pudo importar.');
    } finally {
      setContactsLoading(false);
    }
  };

  const onReject = (entry: FriendEntry) => {
    Alert.alert(
      'Rechazar solicitud', `¿Rechazar la solicitud de ${entry.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Rechazar', style: 'destructive', onPress: async () => {
            const r = await rejectFriend(entry.userId);
            if (!r.ok) Alert.alert('Error', r.error ?? 'No se pudo rechazar.');
        } },
      ]
    );
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <Header onClose={onClose} title="Amigos" theme={theme} onRefresh={refresh} />

      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

        {/* Mi @username */}
        {myUsername ? (
          <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[s.cardLabel, { color: theme.textSecondary }]}>Tu nombre de usuario</Text>
            <View style={s.handleRow}>
              <Text style={[s.handleBig, { color: theme.textPrimary }]}>@{myUsername}</Text>
              <TouchableOpacity onPress={() => setChooserOpen(true)} hitSlop={10}>
                <Ionicons name="pencil" size={16} color={theme.textTertiary} />
              </TouchableOpacity>
            </View>
            <View style={s.shareRow}>
              <TouchableOpacity onPress={onShare} style={[s.shareBtn, { backgroundColor: theme.primary, flex: 1 }]}>
                <Ionicons name="share-outline" size={16} color="#fff" />
                <Text style={s.shareBtnTxt}>Compartir enlace</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setQrOpen(true)} style={[s.qrBtn, { backgroundColor: theme.bg2, borderColor: theme.border }]}>
                <Ionicons name="qr-code-outline" size={20} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={[s.cardHint, { color: theme.textTertiary }]}>
              Cualquiera con el enlace abrirá Teoric con tu solicitud lista para enviar.
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[s.bannerCard, { backgroundColor: theme.primary + '18', borderColor: theme.primary + '40' }]}
            onPress={() => setChooserOpen(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="at-circle" size={26} color={theme.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[s.bannerTitle, { color: theme.textPrimary }]}>Elige tu @username</Text>
              <Text style={[s.bannerSub, { color: theme.textSecondary }]}>
                Para que otros te encuentren al buscarte.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.primary} />
          </TouchableOpacity>
        )}

        {/* Escanear QR (siempre disponible) */}
        <TouchableOpacity
          style={[s.scanQrRow, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => setQrOpen(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="scan-outline" size={20} color={theme.primary} />
          <Text style={[s.scanQrTxt, { color: theme.textPrimary }]}>Escanear código QR de un amigo</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
        </TouchableOpacity>

        {/* Buscador */}
        <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[s.cardLabel, { color: theme.textSecondary }]}>Buscar amigos</Text>
          <View style={[s.searchRow, { borderColor: theme.border, backgroundColor: theme.bg2 }]}>
            <Ionicons name="search" size={16} color={theme.textTertiary} />
            <TextInput
              style={[s.searchInput, { color: theme.textPrimary }]}
              value={query}
              onChangeText={setQuery}
              placeholder="@username"
              placeholderTextColor={theme.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={10}>
                <Ionicons name="close-circle" size={16} color={theme.textTertiary} />
              </TouchableOpacity>
            )}
          </View>

          {query.trim().length >= 2 && (
            <View style={{ gap: 8, marginTop: 6 }}>
              {searching && (
                <View style={s.searchStatus}>
                  <ActivityIndicator size="small" color={theme.textTertiary} />
                  <Text style={[s.searchStatusTxt, { color: theme.textTertiary }]}>Buscando…</Text>
                </View>
              )}
              {!searching && results.length === 0 && (
                <Text style={[s.searchStatusTxt, { color: theme.textTertiary, paddingVertical: 4 }]}>
                  Sin resultados para «{query.trim()}»
                </Text>
              )}
              {!searching && results.map(r => {
                const added = addedIds[r.username];
                return (
                  <View key={r.userId} style={s.resultRow}>
                    <AvatarView
                      color={r.avatarEmoji.startsWith('#') ? r.avatarEmoji : getLeagueInfo(r.league).color}
                      name={r.name}
                      size={36}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[s.resultName, { color: theme.textPrimary }]} numberOfLines={1}>{r.name}</Text>
                      <Text style={[s.resultHandle, { color: theme.textSecondary }]} numberOfLines={1}>@{r.username}</Text>
                    </View>
                    {added === 'accepted' ? (
                      <View style={[s.addedPill, { backgroundColor: theme.correct + '22' }]}>
                        <Ionicons name="checkmark" size={14} color={theme.correct} />
                        <Text style={[s.addedPillTxt, { color: theme.correct }]}>Amigos</Text>
                      </View>
                    ) : added === 'pending' ? (
                      <View style={[s.addedPill, { backgroundColor: theme.bg2 }]}>
                        <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
                        <Text style={[s.addedPillTxt, { color: theme.textSecondary }]}>Enviada</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[s.addBtnSmall, { backgroundColor: theme.primary }]}
                        onPress={() => onAdd(r.username)}
                        disabled={adding === r.username}
                      >
                        {adding === r.username
                          ? <ActivityIndicator color="#fff" size="small" />
                          : <Text style={s.addBtnSmallTxt}>Añadir</Text>}
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Contactos del móvil */}
        {!contactsHidden && (
          <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[s.cardLabel, { color: theme.textSecondary }]}>Encuentra a tus contactos</Text>
            {contactsMatches === null ? (
              <>
                <Text style={[s.cardHint, { color: theme.textSecondary }]}>
                  Te mostraremos qué contactos de tu móvil ya usan Teoric. Solo procesamos los emails con un hash; no guardamos tu libreta.
                </Text>
                <View style={s.contactsBtnRow}>
                  <TouchableOpacity
                    style={[s.contactsBtn, { backgroundColor: theme.primary }]}
                    onPress={runContactsImport}
                    disabled={contactsLoading}
                  >
                    {contactsLoading
                      ? <ActivityIndicator color="#fff" />
                      : <>
                          <Ionicons name="people" size={16} color="#fff" />
                          <Text style={s.contactsBtnTxt}>Importar contactos</Text>
                        </>}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setContactsHidden(true)} hitSlop={10}>
                    <Text style={[s.contactsDismiss, { color: theme.textTertiary }]}>Ahora no</Text>
                  </TouchableOpacity>
                </View>
                {contactsError && (
                  <View style={s.feedbackRow}>
                    <Ionicons name="alert-circle" size={14} color={theme.wrong} />
                    <Text style={[s.feedbackTxt, { color: theme.wrong }]}>{contactsError}</Text>
                  </View>
                )}
                {contactsError?.includes('Ajustes') && (
                  <TouchableOpacity onPress={() => Linking.openSettings()} hitSlop={6}>
                    <Text style={[s.contactsDismiss, { color: theme.primary }]}>Abrir Ajustes</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <>
                <View style={s.contactsHeaderRow}>
                  <Text style={[s.cardHint, { color: theme.textSecondary, flex: 1 }]}>
                    {contactsMatches.length === 0
                      ? 'Ninguno de tus contactos está en Teoric todavía.'
                      : `Encontrados ${contactsMatches.length} contacto${contactsMatches.length === 1 ? '' : 's'} en Teoric.`}
                  </Text>
                  <TouchableOpacity onPress={runContactsImport} hitSlop={6}>
                    <Ionicons name="refresh" size={16} color={theme.textTertiary} />
                  </TouchableOpacity>
                </View>
                {contactsMatches.map(m => {
                  const added = m.username ? addedIds[m.username] : undefined;
                  return (
                    <View key={m.userId} style={s.resultRow}>
                      <AvatarView
                        color={m.avatarEmoji.startsWith('#') ? m.avatarEmoji : getLeagueInfo(m.league).color}
                        name={m.name}
                        size={36}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={[s.resultName, { color: theme.textPrimary }]} numberOfLines={1}>{m.name}</Text>
                        {m.username && (
                          <Text style={[s.resultHandle, { color: theme.textSecondary }]} numberOfLines={1}>@{m.username}</Text>
                        )}
                      </View>
                      {!m.username ? (
                        <View style={[s.addedPill, { backgroundColor: theme.bg2 }]}>
                          <Text style={[s.addedPillTxt, { color: theme.textTertiary }]}>Sin @</Text>
                        </View>
                      ) : added === 'accepted' ? (
                        <View style={[s.addedPill, { backgroundColor: theme.correct + '22' }]}>
                          <Ionicons name="checkmark" size={14} color={theme.correct} />
                          <Text style={[s.addedPillTxt, { color: theme.correct }]}>Amigos</Text>
                        </View>
                      ) : added === 'pending' ? (
                        <View style={[s.addedPill, { backgroundColor: theme.bg2 }]}>
                          <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
                          <Text style={[s.addedPillTxt, { color: theme.textSecondary }]}>Enviada</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={[s.addBtnSmall, { backgroundColor: theme.primary }]}
                          onPress={() => onAdd(m.username!)}
                          disabled={adding === m.username}
                        >
                          {adding === m.username
                            ? <ActivityIndicator color="#fff" size="small" />
                            : <Text style={s.addBtnSmallTxt}>Añadir</Text>}
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </>
            )}
          </View>
        )}

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
                    name={entry.name} size={36}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.entryName, { color: theme.textPrimary }]} numberOfLines={1}>{entry.name}</Text>
                    <Text style={[s.entryMeta, { color: theme.textSecondary }]}>
                      {entry.username ? `@${entry.username} · ` : ''}{getLeagueInfo(entry.league).emoji} {entry.league}
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
              Busca a tus amigos por @username o comparte tu enlace para que te añadan.
            </Text>
          </View>
        ) : (
          <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border, padding: 0 }]}>
            {friends.map((entry, i) => (
              <TouchableOpacity
                key={entry.userId}
                style={[s.entryRow, { borderBottomColor: theme.border }, i < friends.length - 1 && s.entryDivider]}
                onPress={() => setProfileFriend(entry)}
                activeOpacity={0.6}
              >
                <AvatarView
                  color={entry.avatarEmoji.startsWith('#') ? entry.avatarEmoji : getLeagueInfo(entry.league).color}
                  name={entry.name} size={36}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[s.entryName, { color: theme.textPrimary }]} numberOfLines={1}>{entry.name}</Text>
                  <View style={s.entryMetaRow}>
                    {entry.username && <Text style={[s.entryMeta, { color: theme.textTertiary }]}>@{entry.username}</Text>}
                    <Text style={[s.entryMeta, { color: theme.textSecondary }]}>
                      {getLeagueInfo(entry.league).emoji} {entry.league}
                    </Text>
                    {entry.friendStreak > 0 && (
                      <>
                        <Ionicons name="flame" size={12} color={entry.streakAtRisk ? theme.orange : theme.primary} />
                        <Text style={[s.entryMeta, { color: entry.streakAtRisk ? theme.orange : theme.primary, fontWeight: '700' }]}>
                          {entry.friendStreak}
                        </Text>
                      </>
                    )}
                  </View>
                </View>
                <Text style={[s.entryXP, { color: theme.textSecondary }]}>{entry.weeklyXP} XP</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
              </TouchableOpacity>
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
                    name={entry.name} size={36}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.entryName, { color: theme.textPrimary }]} numberOfLines={1}>{entry.name}</Text>
                    <Text style={[s.entryMeta, { color: theme.textTertiary }]}>
                      {entry.username ? `@${entry.username} · ` : ''}Esperando respuesta…
                    </Text>
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

      <UsernameChooserModal
        visible={chooserOpen}
        currentUsername={myUsername}
        cooldownDays={usernameCooldownDays}
        onClose={() => setChooserOpen(false)}
        onSubmit={setUsername}
      />

      {profileFriend && (
        <SubPage onBack={() => setProfileFriend(null)}>
          <FriendProfileScreen
            friend={profileFriend}
            onBack={() => setProfileFriend(null)}
            onRemove={removeFriend}
          />
        </SubPage>
      )}

      {qrOpen && (
        <SubPage onBack={() => setQrOpen(false)}>
          <QRFriendScreen
            onBack={() => setQrOpen(false)}
            myUsername={myUsername}
            onEditUsername={() => { setQrOpen(false); setChooserOpen(true); }}
            onAddFriend={addFriendByUsername}
          />
        </SubPage>
      )}
    </SafeAreaView>
  );
}

function UsernameChooserModal({
  visible, currentUsername, cooldownDays, onClose, onSubmit,
}: {
  visible: boolean;
  currentUsername: string | null;
  cooldownDays: number;
  onClose: () => void;
  onSubmit: (u: string) => Promise<{ ok: boolean; username?: string; error?: string }>;
}) {
  const theme = useTheme();
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locked = !!currentUsername && cooldownDays > 0;

  useEffect(() => {
    if (visible) {
      setValue(currentUsername ?? '');
      setError(null);
    }
  }, [visible, currentUsername]);

  if (!visible) return null;

  const onConfirm = async () => {
    if (locked) return;
    setSubmitting(true);
    setError(null);
    const r = await onSubmit(value);
    setSubmitting(false);
    if (r.ok) {
      onClose();
    } else {
      setError(r.error ?? 'Error desconocido');
    }
  };

  return (
    <View style={[s.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
      <View style={[s.modalSheet, { backgroundColor: theme.card }]}>
        <View style={s.modalHeader}>
          <Text style={[s.modalTitle, { color: theme.textPrimary }]}>
            {currentUsername ? 'Cambiar @username' : 'Elige tu @username'}
          </Text>
          <TouchableOpacity onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={22} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
        <Text style={[s.modalHint, { color: theme.textSecondary }]}>
          3 a 20 caracteres. Letras minúsculas, números y guion bajo.
        </Text>
        {locked && (
          <View style={[s.lockBanner, { backgroundColor: theme.yellow + '18', borderColor: theme.yellow + '40' }]}>
            <Ionicons name="time-outline" size={14} color={theme.orange} />
            <Text style={[s.lockBannerTxt, { color: theme.textPrimary }]}>
              Podrás cambiarlo en {cooldownDays} día{cooldownDays === 1 ? '' : 's'}.
            </Text>
          </View>
        )}
        <View style={[s.modalInputWrap, {
          backgroundColor: locked ? theme.bg : theme.bg2,
          borderColor: theme.border, opacity: locked ? 0.6 : 1,
        }]}>
          <Text style={[s.modalAt, { color: theme.textTertiary }]}>@</Text>
          <TextInput
            style={[s.modalInput, { color: theme.textPrimary }]}
            value={value}
            onChangeText={t => { setValue(t.toLowerCase()); setError(null); }}
            placeholder="tu_nombre"
            placeholderTextColor={theme.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
            editable={!locked}
            autoFocus={!locked}
            onSubmitEditing={onConfirm}
          />
        </View>
        {error && (
          <View style={s.feedbackRow}>
            <Ionicons name="alert-circle" size={14} color={theme.wrong} />
            <Text style={[s.feedbackTxt, { color: theme.wrong }]}>{error}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[s.modalBtn, { backgroundColor: !locked && value.length >= 3 && !submitting ? theme.primary : theme.border }]}
          onPress={onConfirm}
          disabled={locked || value.length < 3 || submitting}
        >
          {submitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.modalBtnTxt}>Guardar</Text>}
        </TouchableOpacity>
      </View>
    </View>
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
      ) : <View style={s.headerBtn} />}
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
  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  cardLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  cardHint: { fontSize: 12, lineHeight: 16 },

  handleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  handleBig: { flex: 1, fontSize: 22, fontWeight: '800' },
  shareRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 11, borderRadius: 10, ...SHADOWS.small },
  shareBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
  qrBtn: { width: 44, height: 44, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

  scanQrRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, borderWidth: 1, padding: 14 },
  scanQrTxt: { flex: 1, fontSize: 14, fontWeight: '600' },

  bannerCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, borderWidth: 1, padding: 14 },
  bannerTitle: { fontSize: 14, fontWeight: '700' },
  bannerSub: { fontSize: 12, marginTop: 2 },

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 0 },
  searchStatus: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  searchStatusTxt: { fontSize: 12 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  resultName: { fontSize: 14, fontWeight: '600' },
  resultHandle: { fontSize: 12, marginTop: 1 },
  addBtnSmall: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addBtnSmallTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },
  addedPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  addedPillTxt: { fontSize: 12, fontWeight: '700' },

  feedbackRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  feedbackTxt: { fontSize: 12 },

  sectionTitle: { fontSize: 15, fontWeight: '700', marginTop: 4 },
  entryRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 11 },
  entryDivider: { borderBottomWidth: 0.5 },
  entryName: { fontSize: 14, fontWeight: '600' },
  entryMeta: { fontSize: 11 },
  entryMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  entryXP: { fontSize: 12, fontWeight: '700' },
  iconBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },

  unauthBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 14 },
  unauthTxt: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  modalOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  modalSheet: { width: '100%', borderRadius: 18, padding: 20, gap: 12, ...SHADOWS.small },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { fontSize: 17, fontWeight: '800' },
  modalHint: { fontSize: 12, lineHeight: 17 },
  modalInputWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12 },
  modalAt: { fontSize: 18, fontWeight: '700' },
  modalInput: { flex: 1, fontSize: 17, fontWeight: '600', paddingVertical: 12 },
  modalBtn: { padding: 13, borderRadius: 12, alignItems: 'center', ...SHADOWS.small },
  modalBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
  lockBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, borderWidth: 1, padding: 10 },
  lockBannerTxt: { fontSize: 12, flex: 1 },

  contactsBtnRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 2 },
  contactsBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 12, ...SHADOWS.small },
  contactsBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
  contactsDismiss: { fontSize: 13, fontWeight: '600' },
  contactsHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
