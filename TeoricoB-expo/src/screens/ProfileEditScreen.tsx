/**
 * ProfileEditScreen — edición de los datos del perfil.
 *
 * Activos: foto / color, nombre visible (display name), @username.
 * Próximamente: contraseña, email, teléfono (requieren OTP).
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../hooks/useTheme';
import { useStore } from '../store/useStore';
import { useAuth } from '../auth/AuthContext';
import { useFriends } from '../friends/useFriends';
import { AvatarView, AVATAR_COLORS } from '../components/AvatarView';

interface Props {
  onBack: () => void;
  /** Lanzado por el modal de borrar cuenta. */
  onDeleteAccount?: () => void;
}

export default function ProfileEditScreen({ onBack, onDeleteAccount }: Props) {
  const theme = useTheme();
  const user = useStore(s => s.user);
  const setProfilePhoto = useStore(s => s.setProfilePhoto);
  const setAvatarColor = useStore(s => s.setAvatarColor);
  const setName = useStore(s => s.setUserName);
  const { user: authUser, updatePassword, reauthenticate, changeEmail, verifyEmailChange, refreshProfile } = useAuth();
  const { myUsername, usernameCooldownDays, setUsername } = useFriends();

  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [nameValue, setNameValue] = useState(user.name);
  const [usernameModalOpen, setUsernameModalOpen] = useState(false);
  const [usernameValue, setUsernameValue] = useState(myUsername ?? '');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSubmitting, setUsernameSubmitting] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permiso necesario', 'Para elegir foto necesitamos acceso a tu galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.6,
    });
    if (!result.canceled && result.assets?.[0]?.uri) setProfilePhoto(result.assets[0].uri);
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

  const commitName = () => {
    const v = nameValue.trim();
    if (v.length >= 2 && v !== user.name) setName(v);
  };

  const onSubmitUsername = async () => {
    if (usernameCooldownDays > 0 && myUsername) return;
    setUsernameSubmitting(true);
    setUsernameError(null);
    const r = await setUsername(usernameValue);
    setUsernameSubmitting(false);
    if (r.ok) {
      setUsernameModalOpen(false);
    } else {
      setUsernameError(r.error ?? 'Error desconocido');
    }
  };

  const usernameLocked = !!myUsername && usernameCooldownDays > 0;

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
        <TouchableOpacity style={s.avatarWrap} onPress={onAvatarPress} activeOpacity={0.8}>
          <AvatarView
            color={user.avatarEmoji}
            name={user.name}
            photoUri={user.profilePhotoUri}
            size={96}
          />
          <View style={[s.editBadge, { backgroundColor: theme.primary, borderColor: theme.bg }]}>
            <Ionicons name={user.profilePhotoUri ? 'camera' : 'create'} size={14} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Nombre visible */}
        <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[s.fieldLabel, { color: theme.textSecondary }]}>Nombre visible</Text>
          <TextInput
            style={[s.input, { color: theme.textPrimary, borderColor: theme.border }]}
            value={nameValue}
            onChangeText={setNameValue}
            onEndEditing={commitName}
            placeholder="Tu nombre"
            placeholderTextColor={theme.textTertiary}
            maxLength={32}
          />
        </View>

        {/* @username */}
        <TouchableOpacity
          style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => { setUsernameValue(myUsername ?? ''); setUsernameError(null); setUsernameModalOpen(true); }}
          activeOpacity={0.85}
        >
          <Text style={[s.fieldLabel, { color: theme.textSecondary }]}>@username</Text>
          <View style={s.fieldValueRow}>
            <Text style={[s.fieldValue, { color: theme.textPrimary }]}>
              {myUsername ? `@${myUsername}` : 'Sin asignar'}
            </Text>
            {usernameLocked && (
              <View style={[s.cooldownPill, { backgroundColor: theme.yellow + '20' }]}>
                <Ionicons name="time-outline" size={12} color={theme.orange} />
                <Text style={[s.cooldownTxt, { color: theme.orange }]}>
                  {usernameCooldownDays}d
                </Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
          </View>
        </TouchableOpacity>

        {/* Email */}
        {authUser ? (
          <TouchableOpacity
            style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setEmailModalOpen(true)}
            activeOpacity={0.85}
          >
            <View style={s.fieldValueRow}>
              <View style={{ flex: 1 }}>
                <Text style={[s.fieldLabel, { color: theme.textSecondary }]}>Correo electrónico</Text>
                <Text style={[s.fieldValue, { color: theme.textPrimary }]} numberOfLines={1}>{authUser.email ?? '—'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border, opacity: 0.7 }]}>
            <View style={s.fieldValueRow}>
              <View style={{ flex: 1 }}>
                <Text style={[s.fieldLabel, { color: theme.textSecondary }]}>Correo electrónico</Text>
                <Text style={[s.fieldValue, { color: theme.textPrimary }]}>Inicia sesión para gestionarlo</Text>
              </View>
            </View>
          </View>
        )}

        {/* Contraseña */}
        {authUser && (
          <TouchableOpacity
            style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setPasswordModalOpen(true)}
            activeOpacity={0.85}
          >
            <View style={s.fieldValueRow}>
              <View style={{ flex: 1 }}>
                <Text style={[s.fieldLabel, { color: theme.textSecondary }]}>Contraseña</Text>
                <Text style={[s.fieldValue, { color: theme.textPrimary }]}>••••••••</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
            </View>
          </TouchableOpacity>
        )}

        {/* Teléfono (próximamente — requiere proveedor SMS) */}
        <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border, opacity: 0.7 }]}>
          <View style={s.fieldValueRow}>
            <View style={{ flex: 1 }}>
              <Text style={[s.fieldLabel, { color: theme.textSecondary }]}>Teléfono</Text>
              <Text style={[s.fieldValue, { color: theme.textPrimary }]}>—</Text>
            </View>
            <View style={[s.soonPill, { backgroundColor: theme.bg2 }]}>
              <Text style={[s.soonPillTxt, { color: theme.textTertiary }]}>Próximamente</Text>
            </View>
          </View>
        </View>

        {/* Borrar cuenta */}
        {authUser && onDeleteAccount && (
          <TouchableOpacity onPress={onDeleteAccount} style={[s.dangerBtn, { borderColor: theme.wrong + '60' }]}>
            <Ionicons name="warning-outline" size={16} color={theme.wrong} />
            <Text style={[s.dangerTxt, { color: theme.wrong }]}>Borrar mi cuenta y todos mis datos</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Color picker */}
      <Modal visible={colorPickerOpen} transparent animationType="fade" onRequestClose={() => setColorPickerOpen(false)}>
        <View style={s.modalBackdrop}>
          <View style={[s.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[s.modalTitle, { color: theme.textPrimary }]}>Elige tu color</Text>
            <View style={s.colorGrid}>
              {AVATAR_COLORS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[s.colorOption, { backgroundColor: c },
                    c === user.avatarEmoji && { borderWidth: 3, borderColor: theme.textPrimary }]}
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

      {/* Username chooser */}
      <Modal visible={usernameModalOpen} transparent animationType="fade" onRequestClose={() => setUsernameModalOpen(false)}>
        <View style={s.modalBackdrop}>
          <View style={[s.modalCard, { backgroundColor: theme.card, borderColor: theme.border, gap: 12 }]}>
            <Text style={[s.modalTitle, { color: theme.textPrimary }]}>
              {myUsername ? 'Cambiar @username' : 'Elige tu @username'}
            </Text>
            <Text style={[s.fieldLabel, { color: theme.textSecondary }]}>
              3 a 20 caracteres. Letras minúsculas, números y guion bajo.
            </Text>
            {usernameLocked && (
              <View style={[s.cooldownBanner, { backgroundColor: theme.yellow + '20', borderColor: theme.yellow + '40' }]}>
                <Ionicons name="time-outline" size={14} color={theme.orange} />
                <Text style={[s.cooldownBannerTxt, { color: theme.textPrimary }]}>
                  Podrás cambiarlo en {usernameCooldownDays} día{usernameCooldownDays === 1 ? '' : 's'}.
                </Text>
              </View>
            )}
            <View style={[s.inputWrap, { borderColor: theme.border, backgroundColor: theme.bg2, opacity: usernameLocked ? 0.6 : 1 }]}>
              <Text style={[s.at, { color: theme.textTertiary }]}>@</Text>
              <TextInput
                style={[s.input2, { color: theme.textPrimary }]}
                value={usernameValue}
                onChangeText={t => { setUsernameValue(t.toLowerCase()); setUsernameError(null); }}
                placeholder="tu_nombre"
                placeholderTextColor={theme.textTertiary}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={20}
                editable={!usernameLocked}
                autoFocus={!usernameLocked}
                onSubmitEditing={onSubmitUsername}
              />
            </View>
            {usernameError && (
              <View style={s.errorRow}>
                <Ionicons name="alert-circle" size={14} color={theme.wrong} />
                <Text style={[s.errorTxt, { color: theme.wrong }]}>{usernameError}</Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                style={[s.modalClose, { borderColor: theme.border, flex: 1 }]}
                onPress={() => setUsernameModalOpen(false)}
              >
                <Text style={[s.modalCloseTxt, { color: theme.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalSave, { backgroundColor: !usernameLocked && usernameValue.length >= 3 && !usernameSubmitting ? theme.primary : theme.border, flex: 1 }]}
                disabled={usernameLocked || usernameValue.length < 3 || usernameSubmitting}
                onPress={onSubmitUsername}
              >
                {usernameSubmitting
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={s.modalSaveTxt}>Guardar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <PasswordChangeModal
        visible={passwordModalOpen}
        theme={theme}
        onClose={() => setPasswordModalOpen(false)}
        reauthenticate={reauthenticate}
        updatePassword={updatePassword}
      />

      <EmailChangeModal
        visible={emailModalOpen}
        theme={theme}
        currentEmail={authUser?.email ?? ''}
        onClose={() => setEmailModalOpen(false)}
        reauthenticate={reauthenticate}
        changeEmail={changeEmail}
        verifyEmailChange={verifyEmailChange}
        refreshProfile={refreshProfile}
      />
    </SafeAreaView>
  );
}

type AuthResult = { ok: boolean; error?: string };

function PasswordChangeModal({
  visible, theme, onClose, reauthenticate, updatePassword,
}: {
  visible: boolean;
  theme: ReturnType<typeof useTheme>;
  onClose: () => void;
  reauthenticate: (p: string) => Promise<AuthResult>;
  updatePassword: (p: string) => Promise<AuthResult>;
}) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [repeat, setRepeat] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) { setCurrent(''); setNext(''); setRepeat(''); setError(null); }
  }, [visible]);

  if (!visible) return null;

  const valid = current.length >= 1 && next.length >= 8 && next === repeat;

  const onSubmit = async () => {
    if (next.length < 8) { setError('La nueva contraseña debe tener al menos 8 caracteres.'); return; }
    if (next !== repeat) { setError('Las contraseñas no coinciden.'); return; }
    setSubmitting(true);
    setError(null);
    const re = await reauthenticate(current);
    if (!re.ok) { setSubmitting(false); setError(re.error ?? 'Contraseña actual incorrecta.'); return; }
    const up = await updatePassword(next);
    setSubmitting(false);
    if (up.ok) { Alert.alert('Listo', 'Tu contraseña se ha cambiado.'); onClose(); }
    else setError(up.error ?? 'No se pudo cambiar la contraseña.');
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.modalBackdrop}>
        <View style={[s.modalCard, { backgroundColor: theme.card, borderColor: theme.border, gap: 12 }]}>
          <Text style={[s.modalTitle, { color: theme.textPrimary }]}>Cambiar contraseña</Text>
          <PwInput value={current} onChange={t => { setCurrent(t); setError(null); }} placeholder="Contraseña actual" theme={theme} autoFocus />
          <PwInput value={next} onChange={t => { setNext(t); setError(null); }} placeholder="Nueva contraseña (mín. 8)" theme={theme} />
          <PwInput value={repeat} onChange={t => { setRepeat(t); setError(null); }} placeholder="Repite la nueva" theme={theme} />
          {error && (
            <View style={s.errorRow}>
              <Ionicons name="alert-circle" size={14} color={theme.wrong} />
              <Text style={[s.errorTxt, { color: theme.wrong }]}>{error}</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={[s.modalClose, { borderColor: theme.border, flex: 1 }]} onPress={onClose}>
              <Text style={[s.modalCloseTxt, { color: theme.textSecondary }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.modalSave, { backgroundColor: valid && !submitting ? theme.primary : theme.border, flex: 1 }]}
              disabled={!valid || submitting}
              onPress={onSubmit}
            >
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={s.modalSaveTxt}>Guardar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function EmailChangeModal({
  visible, theme, currentEmail, onClose, reauthenticate, changeEmail, verifyEmailChange, refreshProfile,
}: {
  visible: boolean;
  theme: ReturnType<typeof useTheme>;
  currentEmail: string;
  onClose: () => void;
  reauthenticate: (p: string) => Promise<AuthResult>;
  changeEmail: (e: string) => Promise<AuthResult>;
  verifyEmailChange: (e: string, t: string) => Promise<AuthResult>;
  refreshProfile: () => Promise<void>;
}) {
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) { setStep('request'); setNewEmail(''); setPassword(''); setCode(''); setError(null); }
  }, [visible]);

  if (!visible) return null;

  const onRequest = async () => {
    setSubmitting(true);
    setError(null);
    const re = await reauthenticate(password);
    if (!re.ok) { setSubmitting(false); setError(re.error ?? 'Contraseña incorrecta.'); return; }
    const ch = await changeEmail(newEmail);
    setSubmitting(false);
    if (ch.ok) setStep('verify');
    else setError(ch.error ?? 'No se pudo iniciar el cambio.');
  };

  const onVerify = async () => {
    setSubmitting(true);
    setError(null);
    const v = await verifyEmailChange(newEmail, code);
    setSubmitting(false);
    if (v.ok) {
      await refreshProfile();
      Alert.alert('Email actualizado', `Tu correo ahora es ${newEmail.trim().toLowerCase()}.`);
      onClose();
    } else {
      setError(v.error ?? 'Código incorrecto.');
    }
  };

  const requestValid = newEmail.includes('@') && password.length >= 1;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.modalBackdrop}>
        <View style={[s.modalCard, { backgroundColor: theme.card, borderColor: theme.border, gap: 12 }]}>
          <Text style={[s.modalTitle, { color: theme.textPrimary }]}>Cambiar email</Text>

          {step === 'request' ? (
            <>
              <Text style={[s.fieldLabel, { color: theme.textSecondary }]}>
                Actual: {currentEmail || '—'}. Te enviaremos un código al nuevo correo.
              </Text>
              <View style={[s.inputWrap, { borderColor: theme.border, backgroundColor: theme.bg2 }]}>
                <TextInput
                  style={[s.input2, { color: theme.textPrimary }]}
                  value={newEmail}
                  onChangeText={t => { setNewEmail(t); setError(null); }}
                  placeholder="nuevo@email.com"
                  placeholderTextColor={theme.textTertiary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  autoFocus
                />
              </View>
              <PwInput value={password} onChange={t => { setPassword(t); setError(null); }} placeholder="Tu contraseña" theme={theme} />
            </>
          ) : (
            <>
              <Text style={[s.fieldLabel, { color: theme.textSecondary }]}>
                Introduce el código de 6 dígitos que enviamos a {newEmail.trim().toLowerCase()}.
              </Text>
              <View style={[s.inputWrap, { borderColor: theme.border, backgroundColor: theme.bg2 }]}>
                <TextInput
                  style={[s.input2, { color: theme.textPrimary, letterSpacing: 6, textAlign: 'center' }]}
                  value={code}
                  onChangeText={t => { setCode(t.replace(/\D/g, '').slice(0, 6)); setError(null); }}
                  placeholder="000000"
                  placeholderTextColor={theme.textTertiary}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
              </View>
              <TouchableOpacity onPress={onRequest} hitSlop={6}>
                <Text style={[s.resendTxt, { color: theme.primary }]}>Reenviar código</Text>
              </TouchableOpacity>
            </>
          )}

          {error && (
            <View style={s.errorRow}>
              <Ionicons name="alert-circle" size={14} color={theme.wrong} />
              <Text style={[s.errorTxt, { color: theme.wrong }]}>{error}</Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={[s.modalClose, { borderColor: theme.border, flex: 1 }]} onPress={onClose}>
              <Text style={[s.modalCloseTxt, { color: theme.textSecondary }]}>Cancelar</Text>
            </TouchableOpacity>
            {step === 'request' ? (
              <TouchableOpacity
                style={[s.modalSave, { backgroundColor: requestValid && !submitting ? theme.primary : theme.border, flex: 1 }]}
                disabled={!requestValid || submitting}
                onPress={onRequest}
              >
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={s.modalSaveTxt}>Enviar código</Text>}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[s.modalSave, { backgroundColor: code.length === 6 && !submitting ? theme.primary : theme.border, flex: 1 }]}
                disabled={code.length !== 6 || submitting}
                onPress={onVerify}
              >
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={s.modalSaveTxt}>Confirmar</Text>}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function PwInput({ value, onChange, placeholder, theme, autoFocus }: {
  value: string;
  onChange: (t: string) => void;
  placeholder: string;
  theme: ReturnType<typeof useTheme>;
  autoFocus?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <View style={[s.inputWrap, { borderColor: theme.border, backgroundColor: theme.bg2 }]}>
      <TextInput
        style={[s.input2, { color: theme.textPrimary }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.textTertiary}
        secureTextEntry={!show}
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
      />
      <TouchableOpacity onPress={() => setShow(v => !v)} hitSlop={8}>
        <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={18} color={theme.textTertiary} />
      </TouchableOpacity>
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
  content: { padding: 16, gap: 12 },
  avatarWrap: { alignSelf: 'center', position: 'relative', marginVertical: 8 },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3,
  },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 6 },
  fieldLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  fieldValueRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  fieldValue: { flex: 1, fontSize: 15, fontWeight: '600' },
  input: { fontSize: 15, fontWeight: '600', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  cooldownPill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  cooldownTxt: { fontSize: 11, fontWeight: '800' },
  soonPill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  soonPillTxt: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  dangerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 14, borderWidth: 1.5, padding: 13, marginTop: 12,
  },
  dangerTxt: { fontSize: 14, fontWeight: '700' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', maxWidth: 380, borderRadius: 20, padding: 20, borderWidth: 1, gap: 14 },
  modalTitle: { fontSize: 17, fontWeight: '800', textAlign: 'center' },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  colorOption: { width: 50, height: 50, borderRadius: 25 },
  modalClose: { borderWidth: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  modalCloseTxt: { fontSize: 14, fontWeight: '600' },
  modalSave: { borderRadius: 12, padding: 12, alignItems: 'center' },
  modalSaveTxt: { color: '#fff', fontSize: 14, fontWeight: '800' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12 },
  at: { fontSize: 18, fontWeight: '700' },
  input2: { flex: 1, fontSize: 16, fontWeight: '600', paddingVertical: 11 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  errorTxt: { fontSize: 12 },
  cooldownBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, borderWidth: 1, padding: 10 },
  cooldownBannerTxt: { fontSize: 12, flex: 1 },
  resendTxt: { fontSize: 13, fontWeight: '700', alignSelf: 'flex-start' },
});
