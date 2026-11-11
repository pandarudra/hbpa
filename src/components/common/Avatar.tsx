import React from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '@/constants/theme';

interface Props {
  uri?: string;
  name?: string;
  size?: number;
}

export function Avatar({ uri, name, size = 48 }: Props) {
  const initials = name
    ? name
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '—';

  return uri ? (
    <Image
      source={{ uri }}
      style={[
        styles.image,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
      accessibilityLabel={`${name ?? 'User'} avatar`}
    />
  ) : (
    <View
      style={[
        styles.placeholder,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: Math.max(11, size * 0.36) }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.surfaceGrey,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  placeholder: {
    backgroundColor: colors.stone,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  initials: {
    color: colors.onStone,
    fontFamily: fonts.sans,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
