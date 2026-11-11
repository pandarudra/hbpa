import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Sun, Moon, Monitor } from 'lucide-react-native';
import { colors } from '@/constants/theme';

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: ViewStyle;
}

/**
 * Pure geometric vector icons crafted to replace emojis throughout Horizon.
 * Strictly adheres to DESIGN.md tokens: hairline strokes, warm taupe/ink colors.
 */

/** Minimalist Search / Magnifying Glass Icon */
export function SearchIcon({
  size = 16,
  color = colors.ash,
  strokeWidth = 1.6,
  style,
}: IconProps) {
  const circleSize = Math.round(size * 0.72);
  const handleLength = Math.round(size * 0.38);

  return (
    <View
      style={[
        styles.iconContainer,
        { width: size, height: size },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel="Search"
    >
      {/* Search Ring */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: circleSize,
          height: circleSize,
          borderRadius: circleSize / 2,
          borderWidth: strokeWidth,
          borderColor: color,
        }}
      />
      {/* Search Stem / Handle */}
      <View
        style={{
          position: 'absolute',
          bottom: Math.round(size * 0.08),
          right: Math.round(size * 0.08),
          width: strokeWidth,
          height: handleLength,
          backgroundColor: color,
          borderRadius: strokeWidth / 2,
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </View>
  );
}

/** Minimalist Dismiss / Close (X) Icon */
export function CloseIcon({
  size = 14,
  color = colors.ash,
  strokeWidth = 1.5,
  style,
}: IconProps) {
  const lineLength = Math.round(size * 0.85);

  return (
    <View
      style={[
        styles.iconContainer,
        { width: size, height: size },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel="Close"
    >
      <View
        style={{
          position: 'absolute',
          width: strokeWidth,
          height: lineLength,
          backgroundColor: color,
          borderRadius: strokeWidth / 2,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: strokeWidth,
          height: lineLength,
          backgroundColor: color,
          borderRadius: strokeWidth / 2,
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </View>
  );
}

/** Minimalist Checkmark / Verified Tick Icon */
export function CheckIcon({
  size = 16,
  color = colors.sage,
  strokeWidth = 2,
  style,
}: IconProps) {
  const shortArm = Math.round(size * 0.3);
  const longArm = Math.round(size * 0.62);

  return (
    <View
      style={[
        styles.iconContainer,
        { width: size, height: size },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel="Check"
    >
      <View
        style={{
          width: longArm,
          height: shortArm,
          borderLeftWidth: strokeWidth,
          borderBottomWidth: strokeWidth,
          borderColor: color,
          transform: [{ rotate: '-45deg' }, { translateY: -Math.round(size * 0.1) }],
        }}
      />
    </View>
  );
}

/** Minimalist Warning / Alert Circle Icon */
export function AlertCircleIcon({
  size = 18,
  color = colors.error,
  strokeWidth = 1.6,
  style,
}: IconProps) {
  const barHeight = Math.round(size * 0.36);
  const dotSize = Math.max(2, Math.round(strokeWidth * 1.25));

  return (
    <View
      style={[
        styles.iconContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: color,
        },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel="Warning"
    >
      {/* Exclamation Bar */}
      <View
        style={{
          width: strokeWidth,
          height: barHeight,
          backgroundColor: color,
          borderRadius: strokeWidth / 2,
          marginBottom: 2,
        }}
      />
      {/* Exclamation Dot */}
      <View
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

/** Minimalist Left Directional Chevron */
export function ChevronLeftIcon({
  size = 12,
  color = colors.stone,
  strokeWidth = 1.75,
  style,
}: IconProps) {
  const arm = Math.round(size * 0.55);

  return (
    <View
      style={[
        styles.iconContainer,
        { width: size, height: size },
        style,
      ]}
      accessibilityRole="image"
    >
      <View
        style={{
          width: arm,
          height: arm,
          borderLeftWidth: strokeWidth,
          borderBottomWidth: strokeWidth,
          borderColor: color,
          transform: [{ rotate: '45deg' }, { translateX: Math.round(size * 0.1) }],
        }}
      />
    </View>
  );
}

/** Minimalist Right Directional Chevron */
export function ChevronRightIcon({
  size = 12,
  color = colors.stone,
  strokeWidth = 1.75,
  style,
}: IconProps) {
  const arm = Math.round(size * 0.55);

  return (
    <View
      style={[
        styles.iconContainer,
        { width: size, height: size },
        style,
      ]}
      accessibilityRole="image"
    >
      <View
        style={{
          width: arm,
          height: arm,
          borderRightWidth: strokeWidth,
          borderTopWidth: strokeWidth,
          borderColor: color,
          transform: [{ rotate: '45deg' }, { translateX: -Math.round(size * 0.1) }],
        }}
      />
    </View>
  );
}

/** Minimalist Down Directional Chevron */
export function ChevronDownIcon({
  size = 12,
  color = colors.stone,
  strokeWidth = 1.75,
  style,
}: IconProps) {
  const arm = Math.round(size * 0.48);

  return (
    <View
      style={[
        styles.iconContainer,
        { width: size, height: size },
        style,
      ]}
      accessibilityRole="image"
    >
      <View
        style={{
          width: arm,
          height: arm,
          borderRightWidth: strokeWidth,
          borderBottomWidth: strokeWidth,
          borderColor: color,
          transform: [{ rotate: '45deg' }, { translateY: -Math.round(size * 0.1) }],
        }}
      />
    </View>
  );
}

/** Minimalist Funnel / Filter Icon */
export function FilterIcon({
  size = 16,
  color = colors.stone,
  strokeWidth = 1.75,
  style,
}: IconProps) {
  const gap = Math.max(2, Math.round(size * 0.14));

  return (
    <View
      style={[
        styles.iconContainer,
        { width: size, height: size, justifyContent: 'center', alignItems: 'center' },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel="Filter"
    >
      <View
        style={{
          width: Math.round(size * 0.85),
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: strokeWidth / 2,
          marginBottom: gap,
        }}
      />
      <View
        style={{
          width: Math.round(size * 0.54),
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: strokeWidth / 2,
          marginBottom: gap,
        }}
      />
      <View
        style={{
          width: Math.round(size * 0.26),
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: strokeWidth / 2,
        }}
      />
    </View>
  );
}

/** Lucide Sun Icon for Light Mode */
export function SunIcon({
  size = 16,
  color = colors.stone,
  strokeWidth = 1.75,
  style,
}: IconProps) {
  return <Sun size={size} color={color} strokeWidth={strokeWidth} style={style} />;
}

/** Lucide Moon Icon for Dark Mode */
export function MoonIcon({
  size = 16,
  color = colors.stone,
  strokeWidth = 1.75,
  style,
}: IconProps) {
  return <Moon size={size} color={color} strokeWidth={strokeWidth} style={style} />;
}

/** Lucide Monitor Icon for System Theme */
export function MonitorIcon({
  size = 16,
  color = colors.stone,
  strokeWidth = 1.75,
  style,
}: IconProps) {
  return <Monitor size={size} color={color} strokeWidth={strokeWidth} style={style} />;
}

export { Sun, Moon, Monitor };

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
