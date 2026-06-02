/**
 * Renderizador de escenarios de tráfico en vista cenital.
 *
 * A diferencia de TrafficSign (que muestra señales individuales del
 * catálogo oficial DGT), aquí dibujamos esquemas de SITUACIONES — por
 * ejemplo: "dos coches en una intersección sin señales", "ciclista que
 * vas a adelantar", "paso de peatones con peatón cruzando".
 *
 * Los SVGs son diagramas vectoriales propios siguiendo la convención
 * visual estándar del material DGT (vista cenital, contornos claros,
 * coches con colores diferenciados para que la pregunta pueda decir
 * "el coche rojo"). NO son señales del Anexo I del RGC — son
 * representaciones pedagógicas amparadas por la legítima docencia.
 *
 * Las preguntas asociadas tienen `legalRef` con el Art. RGC que
 * regula la situación; la explanation cita textualmente la fuente
 * oficial DGT (TeoricaAbreviada).
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { TRAFFIC_SCENES } from '../data/trafficScenes';

export function TrafficScene({ sceneId, size = 200 }: { sceneId: string; size?: number }) {
  const entry = TRAFFIC_SCENES[sceneId];
  if (entry) {
    return (
      <View
        style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
        accessibilityLabel={entry.alt}
      >
        <SvgXml xml={entry.xml} width="100%" height="100%" />
      </View>
    );
  }
  return <ScenePlaceholder size={size} />;
}

function ScenePlaceholder({ size }: { size: number }) {
  return (
    <View
      style={[
        styles.placeholder,
        { width: size, height: size, borderRadius: size * 0.05 },
      ]}
      accessibilityLabel="Diagrama no disponible"
    >
      <Text style={[styles.placeholderText, { fontSize: Math.max(11, size * 0.09) }]}>
        Diagrama{'\n'}no disponible
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
