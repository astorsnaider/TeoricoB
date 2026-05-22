import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  color: string;   // hex color stored in avatarEmoji field
  name?: string;   // used to show initial letter
  size?: number;
}

export const AVATAR_COLORS = [
  '#E63946', '#457B9D', '#2A9D8F', '#F4A261',
  '#9B5DE5', '#1982C4', '#52B788', '#F7A072',
  '#6A4C93', '#3A86FF', '#8AC926', '#FF595E',
];

export function AvatarView({ color, name = '', size = 44 }: Props) {
  const isColor = color?.startsWith('#');
  const bg = isColor ? color : '#457B9D';
  const initial = name.charAt(0).toUpperCase();
  const fontSize = size * 0.38;

  return (
    <View style={[
      styles.circle,
      { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
    ]}>
      {initial
        ? <Text style={[styles.initial, { fontSize, color: '#fff' }]}>{initial}</Text>
        : <Ionicons name="person" size={size * 0.5} color="#fff" />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  initial: { fontWeight: '800', letterSpacing: -0.5 },
});
