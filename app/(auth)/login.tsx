import React from 'react';
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
import { GoogleSignInButton } from '@/features/authentication/components/GoogleSignInButton';
import { AuthErrorMessage } from '@/features/authentication/components/AuthErrorMessage';

export default function LoginScreen() {
  const { signIn, isLoading, error, clearError } = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width > 600;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.card, isWide && styles.cardWide]}>
            {/* Logo placeholder */}
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>HB+</Text>
            </View>

            <Text style={styles.heading}>Welcome</Text>
            <Text style={styles.subheading}>
              Sign in using your official Google Workspace account to continue.
            </Text>

            {error && (
              <AuthErrorMessage
                code={error.code}
                message={error.message}
                onDismiss={clearError}
              />
            )}

            <GoogleSignInButton
              onPress={signIn}
              isLoading={isLoading}
              style={styles.button}
            />

            <Text style={styles.hint}>
              {config.allowedDomains.length > 0
                ? `Authorised domains: ${config.allowedDomains.map((d) => '@' + d).join(', ')}`
                : 'Access is restricted to authorised domains only.'}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f9fa' },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 36,
    alignItems: 'center',
    gap: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardWide: {
    maxWidth: 440,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#1A73E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  logoText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#202124',
    textAlign: 'center',
  },
  subheading: {
    fontSize: 15,
    color: '#5f6368',
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    width: '100%',
  },
  hint: {
    fontSize: 12,
    color: '#9aa0a6',
    textAlign: 'center',
  },
});
