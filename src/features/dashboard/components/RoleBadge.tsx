import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { UserRole } from '@/features/authentication/types/auth.types';
import { colors, fonts, rounded, spacing } from '@/constants/theme';

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; bg: string; color: string; border: string }
> = {
  ADMIN: {
    label: 'Admin',
    bg: colors.goldBg,
    color: colors.gold,
    border: colors.goldPale,
  },
  USER: {
    label: 'Member',
    bg: colors.sageBg,
    color: colors.olive,
    border: colors.sagePale,
  },
};

export function RoleBadge({ role }: { role: UserRole }) {
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.USER;
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg, borderColor: config.border },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 1,
    borderRadius: rounded.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
