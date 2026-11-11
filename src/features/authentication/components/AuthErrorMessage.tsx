import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { AuthErrorCode } from '../types/auth.types';

const ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  DOMAIN_NOT_ALLOWED:
    'Access restricted. Please login using your official domain email.',
  EMAIL_NOT_VERIFIED:
    'Your Google email is not verified. Please verify it and try again.',
  INVALID_TOKEN:
    'Authentication failed. Please try again.',
  ACCOUNT_DISABLED:
    'Your account has been disabled. Please contact your administrator.',
  NETWORK_ERROR:
    'Network error. Please check your connection and try again.',
  CANCELLED: '',
  UNKNOWN:
    'An unexpected error occurred. Please try again.',
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
      <Text style={styles.text}>{text}</Text>
      <Pressable onPress={onDismiss} accessibilityLabel="Dismiss error" style={styles.dismiss}>
        <Text style={styles.dismissText}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fce8e6',
    borderColor: '#f28b82',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    gap: 8,
  },
  text: {
    flex: 1,
    color: '#c5221f',
    fontSize: 14,
    lineHeight: 20,
  },
  dismiss: {
    padding: 4,
  },
  dismissText: {
    color: '#c5221f',
    fontSize: 16,
    fontWeight: '600',
  },
});
