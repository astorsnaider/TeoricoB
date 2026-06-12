/**
 * QRFriendScreen — añadir amigos por código QR.
 *
 * Dos modos:
 *  - "Mi código": muestra mi QR (codifica https://teoric.app/u/<username>).
 *    Cualquiera lo escanea con la cámara nativa (abre la app / store) o con
 *    el escáner de esta pantalla.
 *  - "Escanear": cámara que lee un QR de Teoric, extrae el @username y envía
 *    la solicitud de amistad.
 *
 * Se monta como SubPage desde FriendsScreen.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTheme } from '../hooks/useTheme';

interface Props {
  onBack: () => void;
  myUsername: string | null;
  onEditUsername: () => void;
  onAddFriend: (username: string) => Promise<{ ok: boolean; status?: 'pending' | 'accepted'; error?: string }>;
}

// Mismo formato que el deep link handler de App.tsx.
const LINK_RE = /(?:teoric:\/\/u\/|teoric\.app\/u\/)([a-z0-9_]+)/i;
const SHARE_URL = (u: string) => `https://teoric.app/u/${u}`;

type Mode = 'code' | 'scan';

export default function QRFriendScreen({ onBack, myUsername, onEditUsername, onAddFriend }: Props) {
  const theme = useTheme();
  const [mode, setMode] = useState<Mode>('code');

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <View style={[s.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onBack} hitSlop={12} style={s.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: theme.textPrimary }]}>Código QR</Text>
        <View style={s.headerBtn} />
      </View>

      {/* Segmented control */}
      <View style={[s.segment, { backgroundColor: theme.bg2 }]}>
        <Segment label="Mi código" active={mode === 'code'} onPress={() => setMode('code')} theme={theme} />
        <Segment label="Escanear" active={mode === 'scan'} onPress={() => setMode('scan')} theme={theme} />
      </View>

      {mode === 'code'
        ? <MyCode theme={theme} username={myUsername} onEditUsername={onEditUsername} />
        : <Scanner theme={theme} onAddFriend={onAddFriend} />}
    </SafeAreaView>
  );
}

function Segment({ label, active, onPress, theme }: {
  label: string; active: boolean; onPress: () => void; theme: ReturnType<typeof useTheme>;
}) {
  return (
    <TouchableOpacity
      style={[s.segmentBtn, active && { backgroundColor: theme.card, ...shadow }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[s.segmentTxt, { color: active ? theme.textPrimary : theme.textSecondary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function MyCode({ theme, username, onEditUsername }: {
  theme: ReturnType<typeof useTheme>; username: string | null; onEditUsername: () => void;
}) {
  if (!username) {
    return (
      <View style={s.center}>
        <Ionicons name="at-circle-outline" size={48} color={theme.textTertiary} />
        <Text style={[s.bigHint, { color: theme.textPrimary }]}>Escoge tu @username</Text>
        <Text style={[s.smallHint, { color: theme.textSecondary }]}>
          Necesitas un nombre de usuario para generar tu código.
        </Text>
        <TouchableOpacity style={[s.primaryBtn, { backgroundColor: theme.primary }]} onPress={onEditUsername}>
          <Text style={s.primaryBtnTxt}>Elegir @username</Text>
        </TouchableOpacity>
      </View>
    );
  }
  const size = Math.min(Dimensions.get('window').width - 96, 260);
  return (
    <View style={s.center}>
      <View style={[s.qrCard, { backgroundColor: '#fff' }]}>
        <QRCode value={SHARE_URL(username)} size={size} backgroundColor="#fff" color="#1A1A1A" />
      </View>
      <Text style={[s.handle, { color: theme.textPrimary }]}>@{username}</Text>
      <Text style={[s.smallHint, { color: theme.textSecondary }]}>
        Pídele a tu amigo que escanee este código para añadirte.
      </Text>
    </View>
  );
}

function Scanner({ theme, onAddFriend }: {
  theme: ReturnType<typeof useTheme>;
  onAddFriend: (username: string) => Promise<{ ok: boolean; status?: 'pending' | 'accepted'; error?: string }>;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  if (Platform.OS === 'web') {
    return (
      <View style={s.center}>
        <Ionicons name="camera-outline" size={48} color={theme.textTertiary} />
        <Text style={[s.smallHint, { color: theme.textSecondary }]}>
          El escáner solo está disponible en la app móvil.
        </Text>
      </View>
    );
  }

  if (!permission) {
    return <View style={s.center}><ActivityIndicator color={theme.primary} /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={s.center}>
        <Ionicons name="camera-outline" size={48} color={theme.textTertiary} />
        <Text style={[s.bigHint, { color: theme.textPrimary }]}>Permiso de cámara</Text>
        <Text style={[s.smallHint, { color: theme.textSecondary }]}>
          Necesitamos la cámara para escanear el código QR de tu amigo.
        </Text>
        <TouchableOpacity style={[s.primaryBtn, { backgroundColor: theme.primary }]} onPress={requestPermission}>
          <Text style={s.primaryBtnTxt}>Permitir cámara</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const onScanned = async ({ data }: { data: string }) => {
    if (busy || result) return;
    const m = data.match(LINK_RE);
    if (!m) {
      setResult({ ok: false, msg: 'Ese QR no es de Teoric.' });
      return;
    }
    setBusy(true);
    const r = await onAddFriend(m[1].toLowerCase());
    setBusy(false);
    if (r.ok) {
      setResult({ ok: true, msg: r.status === 'accepted' ? `¡Ya sois amigos! @${m[1]}` : `Solicitud enviada a @${m[1]}` });
    } else {
      setResult({ ok: false, msg: r.error ?? 'No se pudo añadir.' });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={s.cameraWrap}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={result ? undefined : onScanned}
        />
        {/* Marco guía */}
        <View style={s.frame} pointerEvents="none">
          <View style={[s.frameBox, { borderColor: '#fff' }]} />
        </View>
      </View>

      <View style={s.scanFooter}>
        {busy ? (
          <View style={s.resultRow}>
            <ActivityIndicator color={theme.primary} />
            <Text style={[s.resultTxt, { color: theme.textSecondary }]}>Añadiendo…</Text>
          </View>
        ) : result ? (
          <View style={{ gap: 10, alignItems: 'center' }}>
            <View style={s.resultRow}>
              <Ionicons
                name={result.ok ? 'checkmark-circle' : 'alert-circle'}
                size={20}
                color={result.ok ? theme.correct : theme.wrong}
              />
              <Text style={[s.resultTxt, { color: result.ok ? theme.correct : theme.wrong }]}>{result.msg}</Text>
            </View>
            <TouchableOpacity style={[s.primaryBtn, { backgroundColor: theme.primary }]} onPress={() => setResult(null)}>
              <Text style={s.primaryBtnTxt}>Escanear otro</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={[s.smallHint, { color: theme.textSecondary, textAlign: 'center' }]}>
            Apunta al código QR de tu amigo.
          </Text>
        )}
      </View>
    </View>
  );
}

const shadow = Platform.select({
  ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  android: { elevation: 2 },
  default: {},
}) as object;

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 8, paddingVertical: 10, borderBottomWidth: 0.5,
  },
  headerBtn: { width: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  segment: { flexDirection: 'row', margin: 16, borderRadius: 12, padding: 4, gap: 4 },
  segmentBtn: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  segmentTxt: { fontSize: 14, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  qrCard: { padding: 20, borderRadius: 24, ...shadow },
  handle: { fontSize: 22, fontWeight: '800', marginTop: 6 },
  bigHint: { fontSize: 17, fontWeight: '800', textAlign: 'center' },
  smallHint: { fontSize: 13, textAlign: 'center', lineHeight: 19, paddingHorizontal: 12 },
  primaryBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 6 },
  primaryBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
  cameraWrap: { flex: 1, margin: 16, marginTop: 0, borderRadius: 20, overflow: 'hidden', backgroundColor: '#000' },
  frame: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  frameBox: { width: '62%', aspectRatio: 1, borderWidth: 3, borderRadius: 24, opacity: 0.9 },
  scanFooter: { padding: 20, paddingTop: 6, minHeight: 96, justifyContent: 'center' },
  resultRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  resultTxt: { fontSize: 14, fontWeight: '700' },
});
