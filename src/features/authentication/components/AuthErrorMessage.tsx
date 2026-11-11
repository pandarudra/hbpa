import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import type { AuthErrorCode } from "../types/auth.types";
import { CloseIcon, AlertCircleIcon } from "@/components/common/Icons";
import { colors, fonts, rounded, spacing } from "@/constants/theme";

const ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  DOMAIN_NOT_ALLOWED:
    "Access restricted. Please login using your official domain email.",
  EMAIL_NOT_VERIFIED:
    "Your Google email is not verified. Please verify it and try again.",
  INVALID_TOKEN: "Authentication failed. Please try again.",
  ACCOUNT_DISABLED:
    "Your account has been disabled. Please contact your administrator.",
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  CANCELLED: "",
  UNKNOWN: "An unexpected error occurred. Please try again.",
};

interface Props {
  code: AuthErrorCode;
  message?: string;
  onDismiss: () => void;
}

export function AuthErrorMessage({ code, message, onDismiss }: Props) {
  const text = message ?? ERROR_MESSAGES[code] ?? ERROR_MESSAGES.UNKNOWN;
  if (!text) return null;

  return (
    <View
      style={styles.container}
      accessibilityLiveRegion="assertive"
      accessibilityRole="alert"
    >
      <AlertCircleIcon size={16} color={colors.error} />
      <View style={styles.content}>
        <Text style={styles.text}>{text}</Text>
      </View>
      <Pressable
        onPress={onDismiss}
        accessibilityLabel="Dismiss error"
        style={styles.dismiss}
        hitSlop={8}
      >
        <CloseIcon size={11} color={colors.error} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.errorBg,
    borderColor: colors.errorBorder,
    borderWidth: 1,
    borderRadius: rounded.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    width: "100%",
    gap: spacing.sm,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  errorIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.error,
  },
  text: {
    flex: 1,
    color: colors.error,
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
  },
  dismiss: {
    padding: spacing.xxs,
  },
  dismissText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: "600",
  },
});
