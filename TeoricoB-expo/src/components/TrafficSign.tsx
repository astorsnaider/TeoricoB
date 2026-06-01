/**
 * Renderizador de señales de tráfico oficiales DGT.
 *
 * Solo muestra señales con SVG verificado proveniente de Wikimedia Commons
 * (catálogo oficial Anexo I del RGC, RD 1428/2003).
 *
 * NO existen señales dibujadas a mano. Si un signId no tiene SVG oficial,
 * se muestra un placeholder visible indicando que la imagen no está
 * disponible — preferible a mostrar una representación inexacta que
 * pueda inducir a error.
 *
 * Para añadir nuevas señales: ver scripts/regenerate-signs.js
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { WIKIMEDIA_SIGNS } from '../data/signSvgsWikimedia';

export type SignId = string;

export function TrafficSign({ signId, size = 100 }: { signId: string; size?: number }) {
  const entry = WIKIMEDIA_SIGNS[signId];
  if (entry) {
    return <SvgXml xml={entry.xml} width={size} height={size} />;
  }
  return <SignPlaceholder size={size} />;
}

function SignPlaceholder({ size }: { size: number }) {
  return (
    <View
      style={[
        styles.placeholder,
        { width: size, height: size, borderRadius: size * 0.08 },
      ]}
      accessibilityLabel="Imagen oficial de la señal no disponible"
    >
      <Text style={[styles.placeholderText, { fontSize: Math.max(10, size * 0.11) }]}>
        Sin{'\n'}imagen{'\n'}oficial
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#EAEAEA',
    borderWidth: 1,
    borderColor: '#B0B0B0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
  },
});
