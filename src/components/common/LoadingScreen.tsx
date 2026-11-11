import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '@/constants/theme';

export function LoadingScreen() {
  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <View style={styles.content}>
        <Text style={styles.wordmark}>HORIZON</Text>
        <ActivityIndicator size="small" color={colors.stone} style={styles.spinner} />
        <Text style={styles.caption}>Loading workspace…</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.canvas,
  },
  content: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  wordmark: {
    fontFamily: fonts.serif,
    fontSize: 20,
    fontWeight: '300',
    letterSpacing: 3,
    color: colors.stone,
    textTransform: 'uppercase',
  },
  spinner: {
    marginVertical: spacing.xs,
  },
  caption: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.ash,
    letterSpacing: 0.3,
  },
});
