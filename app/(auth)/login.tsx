import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import config from "@/constants/config";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { GoogleSignInButton } from "@/features/authentication/components/GoogleSignInButton";
import { AuthErrorMessage } from "@/features/authentication/components/AuthErrorMessage";
import { LoginSuccessAnimation } from "@/features/authentication/components/LoginSuccessAnimation";
import type { AppUser } from "@/features/authentication/types/auth.types";
import { colors, fonts, rounded, spacing, shadows } from "@/constants/theme";

export default function LoginScreen() {
  const { signIn, isLoading, error, clearError } = useAuth();
  const { showToast } = useToast();
  const { width } = useWindowDimensions();
  const isWide = width > 600;
  const [verifiedUser, setVerifiedUser] = useState<AppUser | null>(null);

  const allowedDomainsList =
    config.allowedDomains.length > 0
      ? config.allowedDomains.map((d) => `@${d}`).join(", ")
      : "@hbplus.fit";

  // Trigger matching toast on error
  useEffect(() => {
    if (error) {
      showToast({
        type: "error",
        title:
          error.code === "DOMAIN_NOT_ALLOWED"
            ? "Domain Restricted"
            : "Authentication Error",
        message: error.message,
      });
    }
  }, [error, showToast]);

  const handleSignIn = async () => {
    await signIn(async (user: AppUser) => {
      setVerifiedUser(user);
      const userDomain = user.email ? user.email.split("@")[1] : "";
      showToast({
        type: "success",
        title: "Domain Verified",
        message: `Welcome, ${user.name.split(" ")[0]} (@${userDomain})`,
      });
      // Wait for the animated tick to finish playing
      await new Promise((resolve) => setTimeout(resolve, 1400));
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, isWide && styles.scrollWide]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Eyebrow / Overline */}
          <View style={styles.eyebrowContainer}>
            <View style={styles.eyebrowPill}>
              <View style={styles.eyebrowDot} />
              <Text style={styles.eyebrowText}>ENTERPRISE WORKSPACE</Text>
            </View>
          </View>

          {/* Authentication Card (ex-auth-form-card) */}
          <View style={[styles.card, isWide && styles.cardWide]}>
            {verifiedUser ? (
              <LoginSuccessAnimation
                name={verifiedUser.name}
                email={verifiedUser.email}
              />
            ) : (
              <>
                {/* Minimalist Emblem */}
                <View style={styles.emblemContainer}>
                  <View style={styles.emblem}>
                    <Text style={styles.emblemLetter}>H</Text>
                  </View>
                  <Text style={styles.wordmark}>HORIZON</Text>
                </View>

                {/* Typography Header */}
                <View style={styles.textGroup}>
                  <Text style={styles.heading}>Welcome back</Text>
                  <Text style={styles.subheading}>
                    Sign in using your official organization Google account to
                    continue.
                  </Text>
                </View>

                {/* Error Message in Card */}
                {error && (
                  <AuthErrorMessage
                    code={error.code}
                    message={error.message}
                    onDismiss={clearError}
                  />
                )}

                {/* Primary Action Button with real Google icon */}
                <GoogleSignInButton
                  onPress={handleSignIn}
                  isLoading={isLoading}
                  style={styles.actionButton}
                />
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
    backgroundColor: colors.canvas,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.lg,
  },
  scrollWide: {
    paddingVertical: spacing.xxl,
  },
  eyebrowContainer: {
    alignItems: "center",
  },
  eyebrowPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs + 2,
    backgroundColor: colors.canvas,
    borderRadius: rounded.full,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.stone,
  },
  eyebrowText: {
    fontFamily: fonts.sans,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: colors.stone,
    textTransform: "uppercase",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: rounded.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    alignItems: "center",
    gap: spacing.lg,
    ...shadows.card,
  },
  cardWide: {
    maxWidth: 440,
    paddingHorizontal: spacing.xl + 4,
    paddingVertical: spacing.xl + 8,
  },
  emblemContainer: {
    alignItems: "center",
    gap: spacing.xs,
  },
  emblem: {
    width: 48,
    height: 48,
    borderRadius: rounded.full,
    backgroundColor: colors.stone,
    alignItems: "center",
    justifyContent: "center",
  },
  emblemLetter: {
    fontFamily: fonts.serif,
    fontSize: 24,
    fontWeight: "300",
    color: colors.onStone,
    marginTop: -2,
  },
  wordmark: {
    fontFamily: fonts.serif,
    fontSize: 15,
    fontWeight: "300",
    letterSpacing: 3,
    color: colors.stone,
    textTransform: "uppercase",
  },
  textGroup: {
    alignItems: "center",
    gap: spacing.xs,
    width: "100%",
  },
  heading: {
    fontFamily: fonts.serif,
    fontSize: 30,
    fontWeight: "300",
    color: colors.ink,
    textAlign: "center",
    letterSpacing: -0.2,
  },
  subheading: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.stone,
    textAlign: "center",
    maxWidth: 320,
  },
  actionButton: {
    width: "100%",
    marginTop: spacing.xs,
  },
  policyNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.canvas,
    borderRadius: rounded.full,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    width: "100%",
    justifyContent: "center",
  },
  policyIconDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.olive,
  },
  policyText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.stone,
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
    paddingTop: spacing.xs,
  },
  footerText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.ash,
    letterSpacing: 0.2,
  },
});
