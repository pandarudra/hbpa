import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

export interface HorizonIconProps {
  size?: number;
  variant?: 'filled' | 'outline' | 'minimal';
  color?: string;
  style?: ViewStyle;
}

/**
 * Minimalist geometric emblem for Horizon.
 * Evokes the rising sun breaking over a clean horizon line with a serene reflection.
 */
export function HorizonIcon({
  size = 48,
  variant = 'filled',
  color,
  style,
}: HorizonIconProps) {
  const { colors, isDark } = useTheme();

  const isFilled = variant === 'filled';
  const isOutline = variant === 'outline';

  const defaultGlyphColor = isFilled
    ? (isDark ? '#10131B' : '#FFFFFF')
    : colors.textPrimary;

  const glyphColor = color ?? defaultGlyphColor;

  const sunWidth = Math.round(size * 0.46);
  const sunHeight = Math.round(sunWidth / 2);
  const horizonWidth = Math.round(size * 0.6);
  const horizonHeight = Math.max(1.5, Math.round(size * 0.042));
  const reflectionWidth = Math.round(size * 0.3);
  const reflectionHeight = Math.max(1, Math.round(size * 0.032));
  const gap = Math.max(2, Math.round(size * 0.06));

  const containerBg = isFilled
    ? (isDark ? '#FFFFFF' : '#1B2338')
    : (isOutline ? colors.surface : 'transparent');

  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: containerBg,
          borderColor: isOutline ? colors.border : 'transparent',
          borderWidth: isOutline ? 1 : 0,
        },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel="Horizon emblem"
    >
      {/* Upper celestial body (rising sun/crest) */}
      <View
        style={{
          width: sunWidth,
          height: sunHeight,
          borderTopLeftRadius: sunHeight,
          borderTopRightRadius: sunHeight,
          backgroundColor: glyphColor,
          marginBottom: gap,
        }}
      />

      {/* The Horizon line */}
      <View
        style={{
          width: horizonWidth,
          height: horizonHeight,
          borderRadius: Math.round(horizonHeight / 2),
          backgroundColor: glyphColor,
        }}
      />

      {/* Subtle lower reflection */}
      <View
        style={{
          width: reflectionWidth,
          height: reflectionHeight,
          borderRadius: Math.round(reflectionHeight / 2),
          backgroundColor: glyphColor,
          opacity: 0.45,
          marginTop: gap,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
