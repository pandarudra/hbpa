import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { Avatar } from '@/components/common/Avatar';
import { RoleBadge } from '@/features/dashboard/components/RoleBadge';

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width > 600;

  // ProtectedLayout already guarantees user is non-null here
  if (!user) return null;

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—';

  const lastLogin = user.lastLoginAt
    ? new Date(user.lastLoginAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>HB Plus</Text>
        <View style={styles.headerRight}>
          <Avatar uri={user.avatarUrl} name={user.name} size={32} />
          <TouchableOpacity
            onPress={signOut}
            style={styles.logoutBtn}
            accessibilityLabel="Logout"
            accessibilityRole="button"
          >
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, isWide && styles.scrollWide]}>
        {/* Profile card */}
        <View style={styles.card}>
          <Avatar uri={user.avatarUrl} name={user.name} size={72} />
          <Text style={styles.welcome}>Welcome, {user.name.split(' ')[0]}!</Text>
          <Text style={styles.email}>{user.email}</Text>
          <RoleBadge role={user.role} />
        </View>

        {/* Stats card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Details</Text>
          <StatRow label="Member since" value={memberSince} />
          <StatRow label="Last login" value={lastLogin} />
          <StatRow label="Status" value={user.status} />
        </View>

        {/* Logout button */}
        <TouchableOpacity
          style={styles.logoutFull}
          onPress={signOut}
          accessibilityLabel="Sign out"
          accessibilityRole="button"
        >
          <Text style={styles.logoutFullText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaed',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A73E8' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#fce8e6',
  },
  logoutBtnText: { color: '#c5221f', fontWeight: '600', fontSize: 13 },

  scroll: { padding: 20, gap: 16 },
  scrollWide: { maxWidth: 540, alignSelf: 'center', width: '100%' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    width: '100%',
  },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#5f6368', alignSelf: 'flex-start' },

  welcome: { fontSize: 22, fontWeight: '700', color: '#202124' },
  email: { fontSize: 14, color: '#5f6368' },

  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  statLabel: { fontSize: 14, color: '#5f6368' },
  statValue: { fontSize: 14, fontWeight: '500', color: '#202124' },

  logoutFull: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  logoutFullText: { fontSize: 15, fontWeight: '600', color: '#c5221f' },
});
