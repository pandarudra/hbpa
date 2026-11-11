import { Platform } from 'react-native';

export const typography = {
  fonts: {
    heading: Platform.select({
      web: "-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Inter', 'Segoe UI', Roboto, sans-serif",
      ios: 'System',
      android: 'sans-serif-medium',
      default: 'sans-serif',
    }),
    body: Platform.select({
      web: "-apple-system, BlinkMacSystemFont, 'Inter', 'Plus Jakarta Sans', 'Segoe UI', Roboto, sans-serif",
      ios: 'System',
      android: 'sans-serif',
      default: 'sans-serif',
    }),
    mono: Platform.select({
      web: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  sizes: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    display: 34,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;
