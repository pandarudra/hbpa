import { Platform } from 'react-native';

export const typography = {
  fonts: {
    heading: 'TheGirlNextDoor',
    body: 'UbuntuSans-Regular',
    bodyMedium: 'UbuntuSans-Medium',
    bodySemibold: 'UbuntuSans-SemiBold',
    bodyBold: 'UbuntuSans-Bold',
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
