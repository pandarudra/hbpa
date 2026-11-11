import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { CheckIcon } from '@/components/common/Icons';
import { colors, fonts, rounded, spacing } from '@/constants/theme';

interface Props {
  name?: string;
  email?: string;
  onComplete?: () => void;
}

export function LoginSuccessAnimation({ name, email, onComplete }: Props) {
  const badgeScale = useRef(new Animated.Value(0.2)).current;
  const tickScale = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.7)).current;
  const ringOpacity = useRef(new Animated.Value(0.9)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(14)).current;

  const firstName = name ? name.split(' ')[0] : 'Member';
  const domain = email ? email.split('@')[1] ?? '' : '';

  useEffect(() => {
    // 1. Spring the badge up & expand the outer ripple ring
    Animated.parallel([
      Animated.spring(badgeScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(ringScale, {
        toValue: 1.5,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(ringOpacity, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Pop the checkmark tick with a spring
    const tickTimer = setTimeout(() => {
      Animated.spring(tickScale, {
        toValue: 1,
        friction: 4,
        tension: 90,
        useNativeDriver: true,
      }).start();
    }, 140);

    // 3. Fade and slide in the confirmation text
    const textTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 280);

    // 4. Trigger completion callback after the user enjoys the animation
    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, 1300);

    return () => {
      clearTimeout(tickTimer);
      clearTimeout(textTimer);
      clearTimeout(completeTimer);
    };
  }, [
    badgeScale,
    tickScale,
    ringScale,
    ringOpacity,
    textOpacity,
    textTranslateY,
    onComplete,
  ]);

  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      {/* Animated Tick Badge with Ripple Ring */}
      <View style={styles.badgeWrapper}>
        <Animated.View
          style={[
            styles.rippleRing,
            {
              transform: [{ scale: ringScale }],
              opacity: ringOpacity,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.badgeCircle,
            {
              transform: [{ scale: badgeScale }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.tickContainer,
              {
                transform: [{ scale: tickScale }],
              },
            ]}
          >
            <CheckIcon size={26} color={colors.onStone} strokeWidth={2.8} />
          </Animated.View>
        </Animated.View>
      </View>

      {/* Confirmation Typography */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
          },
        ]}
      >
        <View style={styles.eyebrowBadge}>
          <View style={styles.eyebrowDot} />
          <Text style={styles.eyebrowText}>DOMAIN VERIFIED</Text>
        </View>

        <Text style={styles.heading}>Welcome, {firstName}</Text>
        <Text style={styles.subheading}>
          Your organization identity has been confirmed.
        </Text>

        {domain ? (
          <View style={styles.domainPill}>
            <View style={styles.statusDot} />
            <Text style={styles.domainText}>@{domain}</Text>
          </View>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    width: '100%',
    gap: spacing.lg,
  },
  badgeWrapper: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rippleRing: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: colors.sagePale,
    backgroundColor: colors.sageBg,
  },
  badgeCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.sageBg,
    borderColor: colors.sagePale,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickGlyph: {
    fontFamily: fonts.sans,
    fontSize: 34,
    fontWeight: '700',
    color: colors.forest,
    marginTop: -2,
  },
  textContainer: {
    alignItems: 'center',
    gap: spacing.xs,
    width: '100%',
  },
  eyebrowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.canvas,
    borderRadius: rounded.full,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 1,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.forest,
  },
  eyebrowText: {
    fontFamily: fonts.sans,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.olive,
    textTransform: 'uppercase',
  },
  heading: {
    fontFamily: fonts.serif,
    fontSize: 26,
    fontWeight: '300',
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  subheading: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: colors.stone,
    textAlign: 'center',
  },
  domainPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: rounded.full,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs + 2,
    marginTop: spacing.xxs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.forest,
  },
  domainText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
});
