import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { UserRole } from '@/features/authentication/types/auth.types';

const ROLE_CONFIG: Record<UserRole, { label: string; bg: string; color: string }> = {
  ADMIN: { label: 'Admin', bg: '#e8f0fe', color: '#1967d2' },
  USER:  { label: 'User',  bg: '#e6f4ea', color: '#137333' },
};

export function RoleBadge({ role }: { role: UserRole }) {
  const { label, bg, color } = ROLE_CONFIG[role];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
