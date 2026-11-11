import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Appearance, Platform } from 'react-native';
import type { ThemeMode, ThemeColors, ThemeContextType } from './types';
import { lightColors, darkColors } from './colors';

const STORAGE_KEY = 'horizon_theme_mode';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getStoredTheme(): ThemeMode {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch {
      // Ignore storage access errors
    }
  }
  return 'system';
}

function persistTheme(mode: ThemeMode): void {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Ignore storage write errors
    }
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(getStoredTheme);
  const [systemScheme, setSystemScheme] = useState<'light' | 'dark'>(() => {
    return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme === 'dark' ? 'dark' : 'light');
    });
    return () => {
      listener.remove();
    };
  }, []);

  const setThemeMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    persistTheme(newMode);
  }, []);

  const toggleTheme = useCallback(() => {
    setModeState((currentMode) => {
      const currentResolved = currentMode === 'system'
        ? (Appearance.getColorScheme() === 'dark' ? 'dark' : 'light')
        : currentMode;
      const nextMode = currentResolved === 'dark' ? 'light' : 'dark';
      persistTheme(nextMode);
      return nextMode;
    });
  }, []);

  const resolvedTheme: 'light' | 'dark' = useMemo(() => {
    if (mode === 'system') {
      return systemScheme;
    }
    return mode;
  }, [mode, systemScheme]);

  const isDark = resolvedTheme === 'dark';
  const colors: ThemeColors = isDark ? darkColors : lightColors;

  // Sync background on web document body
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.style.backgroundColor = colors.background;
      document.body.style.backgroundColor = colors.background;
    }
  }, [colors.background]);

  const value = useMemo<ThemeContextType>(() => ({
    mode,
    resolvedTheme,
    isDark,
    colors,
    setThemeMode,
    toggleTheme,
  }), [mode, resolvedTheme, isDark, colors, setThemeMode, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    // Graceful fallback for components or tests outside ThemeProvider
    const systemScheme = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
    return {
      mode: 'system',
      resolvedTheme: systemScheme,
      isDark: systemScheme === 'dark',
      colors: systemScheme === 'dark' ? darkColors : lightColors,
      setThemeMode: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
}
