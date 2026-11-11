import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { AuthProvider } from '@/providers/AuthProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '@/theme';
import { LoadingScreen } from '@/components/common/LoadingScreen';

function AppContent() {
  const { isDark } = useTheme();

  return (
    <AuthProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    TheGirlNextDoor: require('@assets/fonts/TheGirlNextDoor-Regular.ttf'),
    'UbuntuSans-Regular': require('@assets/fonts/UbuntuSans-Regular.ttf'),
    'UbuntuSans-Medium': require('@assets/fonts/UbuntuSans-Medium.ttf'),
    'UbuntuSans-SemiBold': require('@assets/fonts/UbuntuSans-SemiBold.ttf'),
    'UbuntuSans-Bold': require('@assets/fonts/UbuntuSans-Bold.ttf'),
  });

  useEffect(() => {
    // Inject mobile web app enhancements on web browsers
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'horizon-mobile-app-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          html, body, #root {
            height: 100%;
            width: 100%;
            margin: 0;
            padding: 0;
            -webkit-tap-highlight-color: transparent;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            overscroll-behavior-y: contain;
          }
          /* Prevent iOS Safari 16px auto-zoom */
          input, select, textarea {
            font-size: 16px !important;
          }
          /* Custom scrollbar matching sleek modern aesthetic */
          ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(148, 163, 184, 0.35);
            border-radius: 9999px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(148, 163, 184, 0.55);
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ThemeProvider>
  );
}
