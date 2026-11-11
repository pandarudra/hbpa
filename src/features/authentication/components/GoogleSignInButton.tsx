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
import { useTheme } from '@/theme';

interface Props {
  onPress: () => void;
  isLoading?: boolean;
  style?: ViewStyle;
}

export function GoogleSignInButton({ onPress, isLoading = false, style }: Props) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: colors.primary,
        },
        isLoading && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={isLoading}
      accessibilityLabel="Continue with Google"
      accessibilityRole="button"
      activeOpacity={0.88}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.primaryForeground} size="small" />
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
      <Text style={[styles.label, { color: colors.primaryForeground }]}>
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
    borderRadius: 9999,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
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
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
});
