import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { AuthErrorCode } from '../types/auth.types';
import { CloseIcon, AlertCircleIcon } from '@/components/common/Icons';
import { useTheme, typography } from '@/theme';

const ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  DOMAIN_NOT_ALLOWED:
    'Access restricted. Please login using your official domain email.',
  EMAIL_NOT_VERIFIED:
    'Your Google email is not verified. Please verify it and try again.',
  INVALID_TOKEN: 'Authentication failed. Please try again.',
  ACCOUNT_DISABLED:
    'Your account has been disabled. Please contact your administrator.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  CANCELLED: '',
  UNKNOWN: 'An unexpected error occurred. Please try again.',
};

interface Props {
  code: AuthErrorCode;
  message?: string;
  onDismiss: () => void;
}

export function AuthErrorMessage({ code, message, onDismiss }: Props) {
  const { colors } = useTheme();
  const text = message ?? ERROR_MESSAGES[code] ?? ERROR_MESSAGES.UNKNOWN;
  if (!text) return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.dangerBg,
          borderColor: colors.dangerBorder,
        },
      ]}
      accessibilityLiveRegion="assertive"
      accessibilityRole="alert"
    >
      <AlertCircleIcon size={16} color={colors.danger} />
      <View style={styles.content}>
        <Text style={[styles.text, { color: colors.danger }]}>{text}</Text>
      </View>
      <Pressable
        onPress={onDismiss}
        accessibilityLabel="Dismiss error"
        style={styles.dismiss}
        hitSlop={8}
      >
        <CloseIcon size={12} color={colors.danger} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    width: '100%',
    gap: 10,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    flex: 1,
    fontFamily: typography.fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  dismiss: {
    padding: 4,
  },
});
