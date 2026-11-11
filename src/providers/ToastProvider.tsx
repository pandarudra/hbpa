import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  SafeAreaView,
  Platform,
} from 'react-native';
import { colors, fonts, rounded, spacing, shadows } from '@/constants/theme';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastOptions {
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-30)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast(null);
    });
  }, [opacity, translateY]);

  const showToast = useCallback(
    (options: ToastOptions) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setToast(options);
      opacity.setValue(0);
      translateY.setValue(-30);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 7,
          tension: 70,
          useNativeDriver: true,
        }),
      ]).start();

      const duration = options.duration ?? 4200;
      timerRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    },
    [opacity, translateY, hideToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <SafeAreaView pointerEvents="box-none" style={styles.toastWrapper}>
          <Animated.View
            style={[
              styles.toastContainer,
              {
                opacity,
                transform: [{ translateY }],
              },
            ]}
          >
            {/* Status indicator badge */}
            <View
              style={[
                styles.iconBadge,
                toast.type === 'error' && styles.iconBadgeError,
                toast.type === 'success' && styles.iconBadgeSuccess,
              ]}
            >
              {toast.type === 'success' && (
                <Text style={styles.tickIcon}>✓</Text>
              )}
              {toast.type === 'error' && (
                <Text style={styles.errorIcon}>!</Text>
              )}
              {(!toast.type || toast.type === 'info') && (
                <View style={styles.infoDot} />
              )}
            </View>

            {/* Message Body */}
            <View style={styles.messageBox}>
              {toast.title && <Text style={styles.title}>{toast.title}</Text>}
              <Text style={styles.message}>{toast.message}</Text>
            </View>

            {/* Dismiss action */}
            <Pressable
              onPress={hideToast}
              style={styles.dismissBtn}
              accessibilityLabel="Dismiss message"
              hitSlop={8}
            >
              <Text style={styles.dismissText}>✕</Text>
            </Pressable>
          </Animated.View>
        </SafeAreaView>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 16 : 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    paddingHorizontal: spacing.md,
  },
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.hairline,
    borderWidth: 1,
    borderRadius: rounded.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    maxWidth: 480,
    width: '100%',
    ...shadows.elevated,
  },
  iconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadgeSuccess: {
    backgroundColor: colors.sageBg,
    borderWidth: 1,
    borderColor: colors.sagePale,
  },
  iconBadgeError: {
    backgroundColor: colors.errorBg,
    borderWidth: 1,
    borderColor: colors.errorBorder,
  },
  tickIcon: {
    color: colors.forest,
    fontSize: 13,
    fontWeight: '700',
    marginTop: -1,
  },
  errorIcon: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '700',
    marginTop: -1,
  },
  infoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.stone,
  },
  messageBox: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
    letterSpacing: 0.1,
  },
  message: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: colors.stone,
  },
  dismissBtn: {
    padding: spacing.xxs,
  },
  dismissText: {
    color: colors.ash,
    fontSize: 13,
    fontWeight: '600',
  },
});
