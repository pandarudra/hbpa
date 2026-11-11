import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import config from '@/constants/config';
import { useAuth } from '@/providers/AuthProvider';
import toast from 'react-hot-toast';
import { GoogleSignInButton } from '@/features/authentication/components/GoogleSignInButton';
import { AuthErrorMessage } from '@/features/authentication/components/AuthErrorMessage';
import { LoginSuccessAnimation } from '@/features/authentication/components/LoginSuccessAnimation';
import { HorizonIcon } from '@/components/common/HorizonIcon';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { authApi } from '@/features/authentication/services/authApi';
import type { AppUser } from '@/features/authentication/types/auth.types';
import { useTheme, typography } from '@/theme';

export default function LoginScreen() {
  const { signIn, isLoading, error, clearError } = useAuth();
  const { width } = useWindowDimensions();
  const { colors, isDark } = useTheme();
  const isDesktop = width >= 768;
  const [verifiedUser, setVerifiedUser] = useState<AppUser | null>(null);

  const [allowedDomains, setAllowedDomains] = useState<string[]>(
    config.allowedDomains.length > 0
      ? config.allowedDomains
      : ['hbplus.fit', 'outr.ac.in'],
  );

  useEffect(() => {
    authApi
      .getDomains()
      .then((res) => {
        if (res.domains && res.domains.length > 0) {
          setAllowedDomains(res.domains);
        }
      })
      .catch(() => {
        // Fall back gracefully to build-time config
      });
  }, []);

  const allowedDomainsList =
    allowedDomains.length > 0
      ? allowedDomains.map((d) => `@${d}`).join(', ')
      : '@hbplus.fit, @outr.ac.in';

  // Trigger matching toast on error via react-hot-toast
  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  const handleSignIn = async () => {
    await signIn(async (user: AppUser) => {
      setVerifiedUser(user);
      const userDomain = user.email ? user.email.split('@')[1] : '';
      toast.success(`Welcome, ${user.name.split(' ')[0]} (@${userDomain})`);
      // Wait for the animated tick to finish playing
      await new Promise((resolve) => setTimeout(resolve, 1400));
    });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Top Utility Bar for Theme Toggle */}
      <View style={styles.topBar}>
        <View style={styles.topBarSpacer} />
        <ThemeToggle size={38} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            isDesktop ? styles.scrollDesktop : styles.scrollMobile,
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Authentication Container (Native mobile screen on phones, elevated floating card on desktop) */}
          <View
            style={[
              styles.card,
              isDesktop
                ? [
                    styles.cardDesktop,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      shadowColor: isDark ? '#000000' : '#0F172A',
                    },
                  ]
                : styles.cardMobile,
            ]}
          >
            {verifiedUser ? (
              <LoginSuccessAnimation
                name={verifiedUser.name}
                email={verifiedUser.email}
              />
            ) : (
              <>
                {/* Minimalist Emblem */}
                <View style={styles.emblemContainer}>
                  <HorizonIcon size={52} variant="filled" />
                  <Text style={[styles.wordmark, { color: colors.textPrimary }]}>HORIZON</Text>
                </View>

                {/* Typography Header */}
                <View style={styles.textGroup}>
                  <Text style={[styles.heading, { color: colors.textPrimary }]}>Welcome back</Text>
                  <Text style={[styles.subheading, { color: colors.textSecondary }]}>
                    Sign in using your official organization Google account to continue.
                  </Text>
                </View>

                {/* Error Message */}
                {error && (
                  <AuthErrorMessage
                    code={error.code}
                    message={error.message}
                    onDismiss={clearError}
                  />
                )}

                {/* Primary Action Button */}
                <GoogleSignInButton
                  onPress={handleSignIn}
                  isLoading={isLoading}
                  style={styles.actionButton}
                />

                {/* Domain Security Policy Badge */}
                <View
                  style={[
                    styles.policyNotice,
                    {
                      backgroundColor: colors.successBg,
                      borderColor: colors.successBorder,
                    },
                  ]}
                >
                  <View style={[styles.policyIconDot, { backgroundColor: colors.success }]} />
                  <Text style={[styles.policyText, { color: colors.success }]}>
                    Access is exclusively to {allowedDomainsList}
                  </Text>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 14 : 6,
    paddingBottom: 4,
    zIndex: 10,
  },
  topBarSpacer: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollMobile: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  scrollDesktop: {
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  card: {
    width: '100%',
    alignItems: 'center',
    gap: 24,
  },
  cardMobile: {
    // Pure native mobile app style: no outer box borders or shadows
    backgroundColor: 'transparent',
    borderWidth: 0,
    maxWidth: 380,
    paddingHorizontal: 0,
  },
  cardDesktop: {
    maxWidth: 440,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 36,
    paddingVertical: 44,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
  emblemContainer: {
    alignItems: 'center',
    gap: 12,
  },
  wordmark: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2.8,
    textTransform: 'uppercase',
  },
  textGroup: {
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  heading: {
    fontFamily: typography.fonts.heading,
    fontSize: 32,
    fontWeight: '400',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subheading: {
    fontFamily: typography.fonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 320,
  },
  actionButton: {
    width: '100%',
    marginTop: 4,
  },
  policyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 9999,
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 16,
    width: '100%',
    justifyContent: 'center',
  },
  policyIconDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  policyText: {
    fontFamily: typography.fonts.bodySemibold,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
