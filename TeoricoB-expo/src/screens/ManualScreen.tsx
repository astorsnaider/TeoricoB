/**
 * Manual del Conductor — TeoricoB
 *
 * Estructura:
 *  - Home: 18 capítulos del manual + acceso al catálogo de señales + recursos oficiales
 *  - ChapterView: renderiza un capítulo con bloques de contenido variados
 *  - SignCatalogView: renderiza un grupo de señales (existente)
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Linking, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { useStore } from '../store/useStore';
import { TrafficSign } from '../components/TrafficSign';
import { ALL_SIGN_GROUPS, CatalogSign, SignType } from '../data/signCatalog';
import { MANUAL_CHAPTERS, ManualChapter, ContentBlock } from '../data/manualContent';
import { LEGAL } from '../legal/config';

// ─── RENDERIZADOR DE BLOQUES ─────────────────────────────────────

function ContentBlockRenderer({ block, theme }: { block: ContentBlock; theme: ReturnType<typeof useTheme> }) {
  switch (block.type) {
    case 'text':
      return <Text style={[cb.text, { color: theme.textPrimary }]}>{block.content}</Text>;

    case 'subsection':
      return (
        <View style={cb.subsectionRow}>
          <View style={[cb.subsectionBar, { backgroundColor: theme.primary }]} />
          <Text style={[cb.subsection, { color: theme.textPrimary }]}>{block.title}</Text>
        </View>
      );

    case 'list':
      return (
        <View style={{ gap: 7 }}>
          {block.items.map((item, i) => (
            <View key={i} style={cb.listRow}>
              {block.ordered ? (
                <Text style={[cb.listNum, { color: theme.primary }]}>{i + 1}.</Text>
              ) : (
                <View style={[cb.listDot, { backgroundColor: item.emphasis ? theme.primary : theme.textSecondary }]} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={[cb.listText, { color: theme.textPrimary, fontWeight: item.emphasis ? '700' : '500' }]}>
                  {item.text}
                </Text>
                {item.detail && (
                  <Text style={[cb.listDetail, { color: theme.textSecondary }]}>{item.detail}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      );

    case 'quote':
      return (
        <View style={[cb.quoteBox, { backgroundColor: theme.bg2, borderLeftColor: theme.blue }]}>
          <Text style={[cb.quoteText, { color: theme.textPrimary }]}>«{block.text}»</Text>
          <Text style={[cb.quoteSource, { color: theme.blue }]}>— {block.source}</Text>
        </View>
      );

    case 'tip':
      return (
        <View style={[cb.calloutBox, { backgroundColor: theme.yellow + '20', borderLeftColor: theme.yellow }]}>
          <Ionicons name="bulb" size={16} color={theme.orange} />
          <Text style={[cb.calloutText, { color: theme.textPrimary }]}>{block.text}</Text>
        </View>
      );

    case 'warning':
      return (
        <View style={[cb.calloutBox, { backgroundColor: theme.wrong + '15', borderLeftColor: theme.wrong }]}>
          <Ionicons name="warning" size={16} color={theme.wrong} />
          <Text style={[cb.calloutText, { color: theme.textPrimary, fontWeight: '600' }]}>{block.text}</Text>
        </View>
      );

    case 'table':
      return (
        <View style={[cb.tableBox, { borderColor: theme.border }]}>
          {block.headers && (
            <View style={[cb.tableRow, { backgroundColor: theme.bg2 }]}>
              <Text style={[cb.tableHeader, { color: theme.textPrimary }]}>{block.headers[0]}</Text>
              <Text style={[cb.tableHeader, { color: theme.textPrimary }]}>{block.headers[1]}</Text>
            </View>
          )}
          {block.rows.map((row, i) => (
            <View key={i} style={[cb.tableRow, i < block.rows.length - 1 && { borderBottomColor: theme.border, borderBottomWidth: 0.5 }]}>
              <Text style={[cb.tableCell, { color: theme.textSecondary }]}>{row[0]}</Text>
              <Text style={[cb.tableCell, { color: theme.textPrimary, fontWeight: '600' }]}>{row[1]}</Text>
            </View>
          ))}
        </View>
      );

    case 'definition':
      return (
        <View style={[cb.defBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[cb.defTerm, { color: theme.primary }]}>{block.term}</Text>
          <Text style={[cb.defText, { color: theme.textPrimary }]}>{block.definition}</Text>
        </View>
      );

    case 'signsRow':
      return (
        <View style={{ gap: 6 }}>
          {block.caption && (
            <Text style={[cb.signsCaption, { color: theme.textSecondary }]}>{block.caption}</Text>
          )}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={cb.signsRow}>
              {block.signIds.map((id, i) => (
                <View key={i} style={[cb.signBox, { backgroundColor: theme.bg2 }]}>
                  <TrafficSign signId={id} size={64} />
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      );

    case 'signCard':
      return (
        <View style={[cb.signCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[cb.signCardImg, { backgroundColor: theme.bg2 }]}>
            <TrafficSign signId={block.signId} size={64} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={[cb.signCardName, { color: theme.textPrimary }]}>{block.name}</Text>
            <Text style={[cb.signCardDesc, { color: theme.textSecondary }]}>{block.description}</Text>
            {block.action && (
              <Text style={[cb.signCardAction, { color: theme.primary }]}>→ {block.action}</Text>
            )}
          </View>
        </View>
      );

    default:
      return null;
  }
}

// ─── VISTA DE UN CAPÍTULO ────────────────────────────────────────

function ChapterView({ chapter, theme, onBack }: {
  chapter: ManualChapter;
  theme: ReturnType<typeof useTheme>;
  onBack: () => void;
}) {
  const openBoe = () => Linking.openURL(LEGAL.OFFICIAL_URLS.BOE_RGC)
    .catch(() => Alert.alert('Error', 'No se pudo abrir el enlace.'));

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Ionicons name="arrow-back" size={16} color={theme.primary} />
          <Text style={[s.backTxt, { color: theme.primary }]}>Manual</Text>
        </TouchableOpacity>

        {/* Chapter header */}
        <LinearGradient colors={[chapter.color + '24', chapter.color + '04']} style={s.chapterHeader}>
          <View style={[s.chapterNumber, { backgroundColor: chapter.color }]}>
            <Text style={s.chapterNumberTxt}>{chapter.number}</Text>
          </View>
          <Text style={[s.chapterTitle, { color: theme.textPrimary }]}>{chapter.title}</Text>
          <Text style={[s.chapterDesc, { color: theme.textSecondary }]}>{chapter.shortDesc}</Text>
          {chapter.legalRefs.length > 0 && (
            <View style={s.legalRefsRow}>
              {chapter.legalRefs.map((ref, i) => (
                <View key={i} style={[s.legalRefBadge, { backgroundColor: chapter.color + '15' }]}>
                  <Text style={[s.legalRefTxt, { color: chapter.color }]}>{ref}</Text>
                </View>
              ))}
            </View>
          )}
        </LinearGradient>

        {/* Sections */}
        {chapter.sections.map((section, si) => (
          <View key={section.id} style={[s.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={s.sectionHeader}>
              <View style={[s.sectionIndex, { backgroundColor: chapter.color + '18' }]}>
                <Text style={[s.sectionIndexTxt, { color: chapter.color }]}>{chapter.number}.{si + 1}</Text>
              </View>
              <Text style={[s.sectionInnerTitle, { color: theme.textPrimary }]}>{section.title}</Text>
            </View>
            <View style={[s.sectionDivider, { backgroundColor: theme.border }]} />
            <View style={s.sectionBody}>
              {section.blocks.map((block, bi) => (
                <ContentBlockRenderer key={bi} block={block} theme={theme} />
              ))}
            </View>
          </View>
        ))}

        {/* Verify in BOE */}
        <TouchableOpacity style={[s.officialBtn, { backgroundColor: '#1A237E' }]} onPress={openBoe}>
          <Ionicons name="open-outline" size={15} color="#fff" />
          <Text style={s.officialBtnTxt}>Verificar en el BOE</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── VISTA DE UN GRUPO DE SEÑALES (catálogo) ─────────────────────

function SignGroupView({ group, theme, onBack }: {
  group: typeof ALL_SIGN_GROUPS[0];
  theme: ReturnType<typeof useTheme>;
  onBack: () => void;
}) {
  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Ionicons name="arrow-back" size={16} color={theme.primary} />
          <Text style={[s.backTxt, { color: theme.primary }]}>Señales</Text>
        </TouchableOpacity>

        <LinearGradient colors={[group.color + '22', group.color + '04']} style={s.chapterHeader}>
          <View style={[s.groupIconBg, { backgroundColor: group.color + '20' }]}>
            <Ionicons name="warning-outline" size={32} color={group.color} />
          </View>
          <Text style={[s.chapterTitle, { color: theme.textPrimary }]}>{group.title}</Text>
          <Text style={[s.chapterDesc, { color: theme.textSecondary }]}>{group.subtitle}</Text>
          <Text style={[s.legalRefTxt, { color: group.color, fontWeight: '700' }]}>{group.signs.length} señales</Text>
        </LinearGradient>

        <Text style={[sg.hint, { color: theme.textTertiary }]}>
          Pulsa sobre una señal para ver su significado completo
        </Text>

        {group.signs.map((sign, i) => (
          <SignCard key={`${sign.code}-${i}`} sign={sign} theme={theme} />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SignCard({ sign, theme }: { sign: CatalogSign; theme: ReturnType<typeof useTheme> }) {
  const [expanded, setExpanded] = useState(false);
  const typeColors: Record<SignType, string> = {
    peligro: '#E63946', prohibicion: '#C62828', obligacion: '#1565C0',
    indicacion: '#006633',
  };
  const color = typeColors[sign.type];

  return (
    <TouchableOpacity
      style={[sg.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => setExpanded(e => !e)}
      activeOpacity={0.85}
    >
      <View style={sg.main}>
        <View style={[sg.signBox, { backgroundColor: theme.bg2 }]}>
          <TrafficSign signId={sign.signId} size={72} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <View style={[sg.codeBadge, { backgroundColor: color + '18' }]}>
            <Text style={[sg.code, { color }]}>{sign.code}</Text>
          </View>
          <Text style={[sg.name, { color: theme.textPrimary }]}>{sign.name}</Text>
          {sign.legalRef && <Text style={[sg.legal, { color: theme.textTertiary }]}>{sign.legalRef}</Text>}
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={theme.textTertiary} />
      </View>
      {expanded && (
        <View style={sg.expanded}>
          <View style={[sg.divider, { backgroundColor: theme.border }]} />
          <Text style={[sg.label, { color: theme.textTertiary }]}>Qué significa</Text>
          <Text style={[sg.desc, { color: theme.textSecondary }]}>{sign.description}</Text>
          <View style={[sg.actionBox, { backgroundColor: color + '10', borderLeftColor: color }]}>
            <Ionicons name="car" size={14} color={color} />
            <View style={{ flex: 1 }}>
              <Text style={[sg.actionLabel, { color }]}>Qué debes hacer</Text>
              <Text style={[sg.actionText, { color: theme.textPrimary }]}>{sign.action}</Text>
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── PANTALLA PRINCIPAL ──────────────────────────────────────────

type ManualView =
  | { type: 'home' }
  | { type: 'chapter'; chapterId: string }
  | { type: 'signGroup'; groupIndex: number };

export default function ManualScreen() {
  const [view, setView] = useState<ManualView>({ type: 'home' });
  const theme = useTheme();
  const requestedChapter = useStore(s => s.requestedManualChapter);
  const clearRequestedChapter = useStore(s => s.clearRequestedManualChapter);

  // Si otra pantalla pide abrir un capítulo concreto, navegar a él
  useEffect(() => {
    if (requestedChapter) {
      setView({ type: 'chapter', chapterId: requestedChapter });
      clearRequestedChapter();
    }
  }, [requestedChapter]);

  const openUrl = (url: string) => Linking.openURL(url).catch(() =>
    Alert.alert('Error', 'No se pudo abrir el enlace. Comprueba tu conexión.')
  );

  if (view.type === 'chapter') {
    const chapter = MANUAL_CHAPTERS.find(c => c.id === view.chapterId);
    if (chapter) return <ChapterView chapter={chapter} theme={theme} onBack={() => setView({ type: 'home' })} />;
  }
  if (view.type === 'signGroup') {
    const group = ALL_SIGN_GROUPS[view.groupIndex];
    if (group) return <SignGroupView group={group} theme={theme} onBack={() => setView({ type: 'home' })} />;
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* Hero */}
        <LinearGradient colors={['#1A237E', '#283593']} style={s.hero}>
          <Ionicons name="library" size={40} color="#fff" />
          <Text style={s.heroTitle}>Manual del Conductor</Text>
          <Text style={s.heroSub}>
            18 capítulos · Señales · Normativa actualizada{'\n'}
            Basado en el RGC, LSV y publicaciones oficiales DGT
          </Text>
        </LinearGradient>

        {/* Notice */}
        <View style={[s.notice, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="information-circle-outline" size={15} color={theme.textTertiary} />
          <Text style={[s.noticeTxt, { color: theme.textSecondary }]}>
            Material de elaboración propia basado en la normativa oficial pública. Cada capítulo enlaza al BOE para verificación.
          </Text>
        </View>

        {/* CAPÍTULOS DEL MANUAL */}
        <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>Temario completo</Text>
        <Text style={[s.sectionSub, { color: theme.textSecondary }]}>
          17 temas + anexo de puntos según estructura oficial DGT
        </Text>

        {MANUAL_CHAPTERS.map(chapter => (
          <TouchableOpacity
            key={chapter.id}
            style={[s.chapterCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setView({ type: 'chapter', chapterId: chapter.id })}
            activeOpacity={0.85}
          >
            <View style={[s.chapterIcon, { backgroundColor: chapter.color + '18' }]}>
              <Ionicons name={chapter.icon} size={20} color={chapter.color} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <View style={s.chapterTitleRow}>
                <Text style={[s.chapterNum, { color: chapter.color }]}>
                  {chapter.id === 'anexo_puntos' ? 'Anexo' : `Tema ${chapter.number}`}
                </Text>
                <Text style={[s.chapterName, { color: theme.textPrimary }]}>{chapter.title}</Text>
              </View>
              <Text style={[s.chapterCardDesc, { color: theme.textSecondary }]} numberOfLines={1}>
                {chapter.shortDesc}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
          </TouchableOpacity>
        ))}

        {/* CATÁLOGO DE SEÑALES */}
        <Text style={[s.sectionTitle, { color: theme.textPrimary, marginTop: 10 }]}>Catálogo de Señales</Text>
        <Text style={[s.sectionSub, { color: theme.textSecondary }]}>
          Cada señal con su significado completo y qué hacer al verla
        </Text>

        {ALL_SIGN_GROUPS.map((group, i) => (
          <TouchableOpacity
            key={group.type}
            style={[s.chapterCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setView({ type: 'signGroup', groupIndex: i })}
            activeOpacity={0.85}
          >
            <View style={[s.chapterIcon, { backgroundColor: group.color + '18' }]}>
              <Ionicons name="warning-outline" size={20} color={group.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.chapterName, { color: theme.textPrimary }]}>{group.title}</Text>
              <Text style={[s.chapterCount, { color: group.color }]}>{group.signs.length} señales</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
          </TouchableOpacity>
        ))}

        {/* RECURSOS OFICIALES */}
        <Text style={[s.sectionTitle, { color: theme.textPrimary, marginTop: 10 }]}>Recursos oficiales</Text>
        {[
          { label: 'Reglamento General de Circulación (BOE)', url: LEGAL.OFFICIAL_URLS.BOE_RGC, icon: 'document-text-outline' as const },
          { label: 'Ley de Tráfico y Seguridad Vial (BOE)', url: LEGAL.OFFICIAL_URLS.BOE_LSV, icon: 'document-text-outline' as const },
          { label: 'Manual del Conductor Lectura Fácil (DGT)', url: LEGAL.OFFICIAL_URLS.DGT_MANUAL_LF, icon: 'book-outline' as const },
          { label: 'Diccionario Permiso B (DGT)', url: LEGAL.OFFICIAL_URLS.DGT_DICTIONARY_LF, icon: 'book-outline' as const },
          { label: 'Normas de tráfico (DGT)', url: LEGAL.OFFICIAL_URLS.DGT_RULES, icon: 'globe-outline' as const },
          { label: 'Infracciones y sanciones (DGT)', url: LEGAL.OFFICIAL_URLS.DGT_SANCTIONS, icon: 'alert-circle-outline' as const },
          { label: 'Distintivo ambiental (DGT)', url: LEGAL.OFFICIAL_URLS.DGT_ENV_LABEL, icon: 'leaf-outline' as const },
        ].map(({ label, url, icon }) => (
          <TouchableOpacity
            key={url}
            style={[s.linkCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => openUrl(url)}
            activeOpacity={0.85}
          >
            <Ionicons name={icon} size={17} color={theme.blue} />
            <Text style={[s.linkLabel, { color: theme.textPrimary }]}>{label}</Text>
            <Ionicons name="open-outline" size={15} color={theme.textTertiary} />
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── ESTILOS ─────────────────────────────────────────────────────

const cb = StyleSheet.create({
  text: { fontSize: 14, lineHeight: 21 },
  subsectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, marginBottom: 2 },
  subsectionBar: { width: 3, height: 16, borderRadius: 2 },
  subsection: { fontSize: 14, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  listRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  listDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7, flexShrink: 0 },
  listNum: { fontSize: 13, fontWeight: '800', minWidth: 16 },
  listText: { fontSize: 14, lineHeight: 20 },
  listDetail: { fontSize: 12, lineHeight: 18, marginTop: 2 },
  quoteBox: { borderLeftWidth: 3, borderRadius: 8, padding: 12, gap: 4 },
  quoteText: { fontSize: 13, lineHeight: 19, fontStyle: 'italic' },
  quoteSource: { fontSize: 11, fontWeight: '700' },
  calloutBox: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', borderLeftWidth: 3, borderRadius: 8, padding: 10 },
  calloutText: { flex: 1, fontSize: 13, lineHeight: 19 },
  tableBox: { borderRadius: 8, borderWidth: 1, overflow: 'hidden' },
  tableRow: { flexDirection: 'row', paddingVertical: 9, paddingHorizontal: 12, gap: 10 },
  tableHeader: { flex: 1, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3 },
  tableCell: { flex: 1, fontSize: 12, lineHeight: 17 },
  defBox: { borderRadius: 10, borderWidth: 1, padding: 12, gap: 3 },
  defTerm: { fontSize: 13, fontWeight: '800' },
  defText: { fontSize: 13, lineHeight: 19 },
  signsCaption: { fontSize: 11, fontWeight: '600' },
  signsRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  signBox: { padding: 6, borderRadius: 10 },
  signCard: { flexDirection: 'row', gap: 12, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  signCardImg: { padding: 6, borderRadius: 10 },
  signCardName: { fontSize: 13, fontWeight: '800' },
  signCardDesc: { fontSize: 12, lineHeight: 17 },
  signCardAction: { fontSize: 11, fontWeight: '700', marginTop: 2 },
});

const sg = StyleSheet.create({
  hint: { fontSize: 12, textAlign: 'center', marginBottom: 4 },
  card: { borderRadius: 14, padding: 14, borderWidth: 1 },
  main: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  signBox: { width: 84, height: 84, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  codeBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  code: { fontSize: 11, fontWeight: '700' },
  name: { fontSize: 14, fontWeight: '700', lineHeight: 19 },
  legal: { fontSize: 10 },
  expanded: { gap: 8, marginTop: 10 },
  divider: { height: 0.5 },
  label: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  desc: { fontSize: 13, lineHeight: 20 },
  actionBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 10, padding: 10, borderLeftWidth: 3 },
  actionLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  actionText: { fontSize: 13, lineHeight: 19, fontWeight: '500' },
});

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 10 },
  hero: { borderRadius: 20, padding: 22, alignItems: 'center', gap: 8 },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'center' },
  heroSub: { fontSize: 12, color: '#ffffffCC', textAlign: 'center', lineHeight: 17 },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 12, padding: 11, borderWidth: 1 },
  noticeTxt: { flex: 1, fontSize: 11, lineHeight: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginTop: 4 },
  sectionSub: { fontSize: 12, marginTop: -6, marginBottom: 2 },
  chapterCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 13, borderWidth: 1 },
  chapterIcon: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  chapterTitleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  chapterNum: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  chapterName: { fontSize: 14, fontWeight: '700', flex: 1 },
  chapterCardDesc: { fontSize: 11 },
  chapterCount: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  linkCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 12, borderWidth: 1 },
  linkLabel: { flex: 1, fontSize: 13 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  backTxt: { fontSize: 15, fontWeight: '600' },
  // Chapter header
  chapterHeader: { borderRadius: 18, padding: 20, alignItems: 'center', gap: 8 },
  chapterNumber: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  chapterNumberTxt: { color: '#fff', fontSize: 22, fontWeight: '800' },
  chapterTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  chapterDesc: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  legalRefsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  legalRefBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  legalRefTxt: { fontSize: 10, fontWeight: '700' },
  groupIconBg: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  // Section card
  sectionCard: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, paddingBottom: 12 },
  sectionIndex: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  sectionIndexTxt: { fontSize: 11, fontWeight: '800' },
  sectionInnerTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
  sectionDivider: { height: 0.5 },
  sectionBody: { padding: 14, gap: 10 },
  officialBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, padding: 13, justifyContent: 'center', marginTop: 4 },
  officialBtnTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
