import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { UserRole } from '@/features/authentication/types/auth.types';
import { useTheme } from '@/theme';

export function RoleBadge({ role }: { role: UserRole }) {
  const { colors } = useTheme();

  const isAdmin = role === 'ADMIN';
  const label = isAdmin ? 'Admin' : 'Member';
  const bg = isAdmin ? colors.roleAdminBg : colors.roleUserBg;
  const color = isAdmin ? colors.roleAdminText : colors.roleUserText;
  const border = isAdmin ? colors.roleAdminBorder : colors.roleUserBorder;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg, borderColor: border },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
