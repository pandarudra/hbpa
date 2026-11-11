export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceElevated: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  border: string;
  borderSubtle: string;

  primary: string;
  primaryForeground: string;

  success: string;
  successBg: string;
  successBorder: string;

  warning: string;
  warningBg: string;
  warningBorder: string;

  danger: string;
  dangerBg: string;
  dangerBorder: string;

  inputBackground: string;
  inputBorder: string;

  overlay: string;

  // Role badges & specialized indicators
  roleAdminBg: string;
  roleAdminText: string;
  roleAdminBorder: string;

  roleUserBg: string;
  roleUserText: string;
  roleUserBorder: string;
}

export interface ThemeContextType {
  mode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}
