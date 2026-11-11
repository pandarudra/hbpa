import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import toast from 'react-hot-toast';
import { Avatar } from '@/components/common/Avatar';
import { HorizonIcon } from '@/components/common/HorizonIcon';
import { colors, fonts, rounded, spacing } from '@/constants/theme';

export default function DashboardScreen() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  // Rule: Authenticated ADMIN accessing /dashboard must be redirected to /admin
  if (user.role === 'ADMIN') {
    return <Redirect href="/admin" />;
  }

  const handleSignOut = async () => {
    toast('Signed out of Horizon workspace.');
    await signOut();
  };

  const displayName = user.name ? user.name.split(' ')[0] : 'Member';

  return (
    <SafeAreaView style={styles.safe}>
      {/* 1. Application Header */}
      <View style={styles.header}>
        {/* Left: Horizon logo & brand name */}
        <View style={styles.headerLeft}>
          <HorizonIcon size={26} variant="filled" />
          <Text style={styles.brandName}>HORIZON</Text>
        </View>

        {/* Right: User avatar & Single Sign Out button */}
        <View style={styles.headerRight}>
          <Avatar uri={user.avatarUrl} name={user.name} size={34} />
          <TouchableOpacity
            onPress={handleSignOut}
            style={styles.signOutBtn}
            accessibilityLabel="Sign out"
            accessibilityRole="button"
            activeOpacity={0.8}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Main Content: Centered Minimal Welcome Experience (Strictly No-Scroll) */}
      <View style={styles.mainContainer}>
        <View style={styles.welcomeBox}>
          {/* Eyebrow Label */}
          <View style={styles.eyebrowRow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrowText}>WELCOME TO HORIZON</Text>
          </View>

          {/* Heading */}
          <Text style={styles.welcomeHeading}>
            Welcome back, {displayName}.
          </Text>

          {/* Confirmation sentence */}
          <Text style={styles.confirmationText}>
            Your official organization account is successfully authenticated.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.canvas,
    // Ensure viewport-fitting 100dvh on Web, flex: 1 on mobile
    ...(Platform.OS === 'web'
      ? {
          height: '100dvh' as unknown as number,
          maxHeight: '100dvh' as unknown as number,
          overflow: 'hidden' as unknown as 'hidden',
        }
      : {}),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.canvas,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  brandName: {
    fontFamily: fonts.serif,
    fontSize: 15,
    fontWeight: '300',
    letterSpacing: 2.5,
    color: colors.stone,
    textTransform: 'uppercase',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  signOutBtn: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xxs + 3,
    borderRadius: rounded.full,
    borderWidth: 1,
    borderColor: colors.stone,
    backgroundColor: colors.canvas,
  },
  signOutText: {
    color: colors.stone,
    fontFamily: fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  welcomeBox: {
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: 580,
    width: '100%',
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    marginBottom: spacing.xxs,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.forest,
  },
  eyebrowText: {
    fontFamily: fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.olive,
    textTransform: 'uppercase',
  },
  welcomeHeading: {
    fontFamily: fonts.serif,
    fontSize: Platform.select({ web: 38, default: 32 }),
    fontWeight: '300',
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: -0.3,
    lineHeight: Platform.select({ web: 46, default: 40 }),
  },
  confirmationText: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: colors.stone,
    textAlign: 'center',
    maxWidth: 420,
  },
});
