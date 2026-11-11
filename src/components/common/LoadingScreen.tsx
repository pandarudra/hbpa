import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors, fonts, spacing } from '@/constants/theme';
import { HorizonIcon } from '@/components/common/HorizonIcon';

const RING_SIZE = 58;

export function LoadingScreen() {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <View style={styles.content}>
        {/* Unified Orbit Loader around the Horizon Icon */}
        <View style={styles.iconOrbitContainer}>
          {/* Static Orbit Track Ring */}
          <View style={styles.orbitTrack} />

          {/* Active Rotating Loader Ring */}
          <Animated.View
            style={[
              styles.orbitSpinner,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          />

          {/* Central Horizon Emblem */}
          <HorizonIcon size={42} variant="filled" />
        </View>

        {/* Wordmark */}
        <Text style={styles.wordmark}>HORIZON</Text>
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
    gap: spacing.md,
  },
  iconOrbitContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitTrack: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.hairline,
  },
  orbitSpinner: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: colors.stone,
    borderRightColor: colors.stone,
  },
  wordmark: {
    fontFamily: fonts.serif,
    fontSize: 16,
    fontWeight: '300',
    letterSpacing: 4,
    color: colors.stone,
    textTransform: 'uppercase',
  },
});
