import { Platform } from 'react-native';

export const colors = {
  // Brand & Action (Obsidian / High-Contrast Modern Tech)
  primary: '#0f172a',       // Deep obsidian — clean, modern, high-contrast primary CTA
  onPrimary: '#ffffff',
  stone: '#1e293b',         // Sleek slate neutral — wordmarks, secondary pills, outlines
  onStone: '#ffffff',
  
  // Surfaces (Clean, crisp modern canvas inspired by hbplus.fit)
  canvas: '#f8f9fa',        // Signature clean, modern off-white canvas
  surface: '#ffffff',       // Pure white elevated cards & containers
  surfaceGrey: '#f1f5f9',   // Light utility fill / subtle track
  silver: '#e2e8f0',        // Subtle border & tab edge
  hairline: '#e5e7eb',      // Crisp, refined 1px border on canvas & cards
  
  // Ink & Text
  ink: '#0f172a',           // Deep slate black heading and body text
  ash: '#64748b',           // Muted slate for metadata & utility captions
  mute: '#94a3b8',          // Quietest captions & disabled text
  onDark: '#ffffff',
  
  // Wellness & Vitality Accent Families (Inspired by hbplus.fit health & fitness ecosystem)
  gold: '#d97706',          // Warm amber for administrative badges
  ochre: '#b45309',
  goldSoft: '#f59e0b',
  goldPale: '#fde68a',
  goldBg: '#fffbeb',        // Subtle warm amber badge background
  
  forest: '#065f46',        // Deep emerald forest
  olive: '#047857',
  sage: '#10b981',          // Vibrant, clean emerald vitality green (verified status & member badges)
  sagePale: '#a7f3d0',
  sageBg: '#ecfdf5',        // Soft emerald badge background
  
  clay: '#6b443d',
  espresso: '#1e293b',
  
  // Semantic
  error: '#ef4444',         // Crisp modern red
  errorBg: '#fef2f2',
  errorBorder: '#fecaca',
} as const;

export const fonts = {
  heading: 'TheGirlNextDoor',
  serif: Platform.select({
    web: "-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', 'Inter', 'Segoe UI', Roboto, sans-serif",
    ios: 'System',
    android: 'sans-serif-medium',
    default: 'sans-serif',
  }),
  sans: 'UbuntuSans-Regular',
  sansMedium: 'UbuntuSans-Medium',
  sansSemibold: 'UbuntuSans-SemiBold',
  sansBold: 'UbuntuSans-Bold',
};

export const rounded = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 28,
  full: 9999,
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const shadows = {
  card: {
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  elevated: {
    shadowColor: '#0f172a',
    shadowOpacity: 0.07,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
} as const;

export const theme = {
  colors,
  fonts,
  rounded,
  spacing,
  shadows,
};

export default theme;
