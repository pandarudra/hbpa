import React from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';

interface Props {
  uri?: string;
  name?: string;
  size?: number;
}

export function Avatar({ uri, name, size = 48 }: Props) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return uri ? (
    <Image
      source={{ uri }}
      style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      accessibilityLabel={`${name ?? 'User'} avatar`}
    />
  ) : (
    <View
      style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: '#e8eaed' },
  placeholder: {
    backgroundColor: '#1A73E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { color: '#fff', fontWeight: '700' },
});
