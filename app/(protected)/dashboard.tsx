import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import toast from 'react-hot-toast';
import { Avatar } from '@/components/common/Avatar';
import { HorizonIcon } from '@/components/common/HorizonIcon';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { ProfileMenuModal } from '@/components/common/ProfileMenuModal';
import { useTheme, typography } from '@/theme';

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const isCompact = width < 768;
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);

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
    <SafeAreaView
      style={[
        styles.safe,
        { backgroundColor: colors.background },
      ]}
    >
      {/* 1. Application Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
          isCompact && styles.headerCompact,
        ]}
      >
        {/* Left: Horizon logo & brand name */}
        <View style={styles.headerLeft}>
          <HorizonIcon size={isCompact ? 24 : 26} variant="filled" />
          <Text style={[styles.brandName, { color: colors.textPrimary }]}>HORIZON</Text>
        </View>

        {/* Right: Theme Toggle + User Avatar (opens ProfileMenu) + Sign Out */}
        <View style={styles.headerRight}>
          <ThemeToggle size={34} />

          <TouchableOpacity
            onPress={() => setProfileMenuVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Open user menu"
            activeOpacity={0.8}
            style={styles.avatarButton}
          >
            <Avatar uri={user.avatarUrl} name={user.name} size={isCompact ? 32 : 34} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSignOut}
            style={[
              styles.signOutBtn,
              {
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
              },
            ]}
            accessibilityLabel="Sign out"
            accessibilityRole="button"
            activeOpacity={0.8}
          >
            <Text style={[styles.signOutText, { color: colors.textPrimary }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Main Content: Centered Minimal Welcome Experience (Strictly No-Scroll) */}
      <View style={[styles.mainContainer, isCompact && styles.mainContainerCompact]}>
        <View style={styles.welcomeBox}>
          {/* Eyebrow Label */}
          <View
            style={[
              styles.eyebrowRow,
              {
                backgroundColor: colors.successBg,
                borderColor: colors.successBorder,
              },
            ]}
          >
            <View style={[styles.eyebrowDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.eyebrowText, { color: colors.success }]}>WELCOME TO HORIZON</Text>
          </View>

          {/* Heading */}
          <Text
            style={[
              styles.welcomeHeading,
              { color: colors.textPrimary },
              isCompact && styles.welcomeHeadingCompact,
            ]}
          >
            Welcome back, {displayName}.
          </Text>

          {/* Confirmation sentence */}
          <Text
            style={[
              styles.confirmationText,
              { color: colors.textSecondary },
              isCompact && styles.confirmationTextCompact,
            ]}
          >
            Your official organization account is successfully authenticated.
          </Text>
        </View>
      </View>

      {/* Profile & Appearance Menu Popover (Ref Screenshot 3) */}
      <ProfileMenuModal
        visible={profileMenuVisible}
        onClose={() => setProfileMenuVisible(false)}
        user={{
          displayName: user.name,
          email: user.email,
          role: user.role,
        }}
        onSignOut={handleSignOut}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerCompact: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandName: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarButton: {
    borderRadius: 9999,
  },
  signOutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
    borderWidth: 1,
  },
  signOutText: {
    fontFamily: typography.fonts.bodySemibold,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  mainContainerCompact: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  welcomeBox: {
    alignItems: 'center',
    gap: 12,
    maxWidth: 580,
    width: '100%',
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  eyebrowText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  welcomeHeading: {
    fontFamily: typography.fonts.heading,
    fontSize: Platform.select({ web: 44, default: 38 }),
    fontWeight: '400',
    textAlign: 'center',
    letterSpacing: -0.6,
    lineHeight: Platform.select({ web: 52, default: 46 }),
  },
  welcomeHeadingCompact: {
    fontSize: 32,
    lineHeight: 42,
    letterSpacing: -0.4,
  },
  confirmationText: {
    fontFamily: typography.fonts.body,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 420,
  },
  confirmationTextCompact: {
    fontSize: 14,
    lineHeight: 20,
  },
});
