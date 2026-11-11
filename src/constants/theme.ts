import { Platform } from 'react-native';

export const colors = {
  // Brand & Action
  primary: '#2a72de',       // Action blue — strictly reserved for primary CTA
  onPrimary: '#ffffff',
  stone: '#4a4741',         // Warm taupe-brown neutral — wordmarks, secondary pills, outlines
  onStone: '#ffffff',
  
  // Surfaces
  canvas: '#f7f1e8',        // Signature warm-paper resting background
  surface: '#ffffff',       // Pure white elevated cards & containers
  surfaceGrey: '#ececec',   // Light utility fill
  silver: '#cccac7',        // Subtle border & tab edge
  hairline: '#e1dcd3',      // Warm 1px divider / border on canvas
  
  // Ink & Text
  ink: '#1c1b1a',           // Primary heading and body text on cream
  ash: '#838280',           // Muted grey for metadata & utility captions
  mute: '#a8a5a0',          // Quietest captions & disabled text
  onDark: '#ffffff',
  
  // Earth-tone Accent Families (Bands, Data-viz & Badges)
  gold: '#af751b',
  ochre: '#bc924c',
  goldSoft: '#ddaa61',
  goldPale: '#ddbe78',
  goldBg: '#faf4e8',
  
  forest: '#224228',
  olive: '#5c6f5d',
  sage: '#849671',
  sagePale: '#ced4b8',
  sageBg: '#f2f5ee',
  
  clay: '#6b443d',
  espresso: '#39221e',
  
  // Semantic
  error: '#e33a22',
  errorBg: '#fdf1ef',
  errorBorder: '#f8c8c1',
} as const;

export const fonts = {
  serif: Platform.select({
    web: "Georgia, 'Editorial New', 'Newsreader', 'Times New Roman', serif",
    ios: 'Georgia',
    android: 'serif',
    default: 'serif',
  }),
  sans: Platform.select({
    web: "-apple-system, BlinkMacSystemFont, 'Inter', 'AkkuratLL', 'Segoe UI', Roboto, sans-serif",
    ios: 'System',
    android: 'sans-serif',
    default: 'sans-serif',
  }),
};

export const rounded = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 24,
  xl: 40,
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
    shadowColor: '#39221e',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  elevated: {
    shadowColor: '#39221e',
    shadowOpacity: 0.09,
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
