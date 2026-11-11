import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  Image,
  type ViewStyle,
} from 'react-native';
import { colors, fonts, rounded, spacing } from '@/constants/theme';

interface Props {
  onPress: () => void;
  isLoading?: boolean;
  style?: ViewStyle;
}

export function GoogleSignInButton({ onPress, isLoading = false, style }: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, isLoading && styles.buttonDisabled, style]}
      onPress={onPress}
      disabled={isLoading}
      accessibilityLabel="Continue with Google"
      accessibilityRole="button"
      activeOpacity={0.88}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.onPrimary} size="small" />
      ) : (
        <View style={styles.iconCircle}>
          <Image
            source={require('@assets/images/google.png')}
            style={styles.googleIcon}
            resizeMode="contain"
            accessibilityLabel="Google icon"
          />
        </View>
      )}
      <Text style={styles.label}>
        {isLoading ? 'Authenticating…' : 'Continue with Google'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: rounded.full,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    width: '100%',
    minHeight: 48,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 15,
    height: 15,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: 15,
    fontWeight: '600',
    color: colors.onPrimary,
    letterSpacing: 0.2,
  },
});
