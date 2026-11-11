import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

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
      activeOpacity={0.85}
    >
      {isLoading ? (
        <ActivityIndicator color="#444" size="small" />
      ) : (
        <View style={styles.googleIcon}>
          {/* Simple coloured G mark — replace with an SVG asset if desired */}
          <Text style={styles.googleLetter}>G</Text>
        </View>
      )}
      <Text style={styles.label}>
        {isLoading ? 'Signing in…' : 'Continue with Google'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleLetter: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3c4043',
    letterSpacing: 0.1,
  },
});
