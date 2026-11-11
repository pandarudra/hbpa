import React, { type ReactNode } from 'react';
import {
  Platform,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
} from 'react-native';
import toast, {
  Toaster as WebToaster,
  useToaster,
  type Toast,
} from 'react-hot-toast';
import { CheckIcon, CloseIcon, AlertCircleIcon } from '@/components/common/Icons';
import { colors, fonts, rounded, spacing, shadows } from '@/constants/theme';

export { toast };
export default toast;

const webToastOptions = {
  duration: 4000,
  style: {
    background: colors.surface,
    color: colors.ink,
    border: `1px solid ${colors.hairline}`,
    borderRadius: `${rounded.lg}px`,
    padding: `${spacing.sm}px ${spacing.md}px`,
    fontFamily:
      "'UbuntuSans-Regular', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '1.4',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
  },
  success: {
    duration: 3500,
    iconTheme: {
      primary: colors.forest,
      secondary: colors.sageBg,
    },
    style: {
      border: `1px solid ${colors.sagePale}`,
    },
  },
  error: {
    duration: 4500,
    iconTheme: {
      primary: colors.error,
      secondary: colors.errorBg,
    },
    style: {
      border: `1px solid ${colors.errorBorder}`,
    },
  },
};

/**
 * Native mobile toaster rendered using React Native primitives,
 * subscribed to the react-hot-toast headless store.
 */
function NativeToaster() {
  const { toasts } = useToaster();
  const visibleToasts = toasts.filter((t) => t.visible);

  if (visibleToasts.length === 0) return null;

  return (
    <SafeAreaView pointerEvents="box-none" style={styles.nativeWrapper}>
      {visibleToasts.map((t) => (
        <NativeToastItem key={t.id} toast={t} />
      ))}
    </SafeAreaView>
  );
}

function NativeToastItem({ toast: t }: { toast: Toast }) {
  const isSuccess = t.type === 'success';
  const isError = t.type === 'error';
  const messageStr = typeof t.message === 'function' ? '' : String(t.message);

  return (
    <View style={styles.nativeToast}>
      <View
        style={[
          styles.iconBadge,
          isSuccess && styles.iconBadgeSuccess,
          isError && styles.iconBadgeError,
        ]}
      >
        {isSuccess && <CheckIcon size={12} color={colors.sage} />}
        {isError && <AlertCircleIcon size={14} color={colors.error} />}
        {!isSuccess && !isError && <View style={styles.infoDot} />}
      </View>
      <Text style={styles.nativeText}>{messageStr}</Text>
      <Pressable
        onPress={() => toast.dismiss(t.id)}
        hitSlop={8}
        style={styles.dismissBtn}
      >
        <CloseIcon size={11} color={colors.ash} />
      </Pressable>
    </View>
  );
}

/**
 * Universal Toaster following DESIGN.md's ex-toast spec:
 * Uses react-hot-toast's Toaster on Web and a native-rendered fallback on mobile.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      {Platform.OS === 'web' ? (
        <WebToaster position="top-center" toastOptions={webToastOptions} />
      ) : (
        <NativeToaster />
      )}
    </>
  );
}

/**
 * Hook for backward-compatibility with earlier useToast() callers.
 * Delegates directly to react-hot-toast.
 */
export function useToast() {
  return {
    showToast: (options: {
      type?: 'success' | 'error' | 'info';
      title?: string;
      message: string;
      duration?: number;
    }) => {
      const msg = options.title
        ? `${options.title}: ${options.message}`
        : options.message;

      if (options.type === 'success') {
        toast.success(msg, { duration: options.duration });
      } else if (options.type === 'error') {
        toast.error(msg, { duration: options.duration });
      } else {
        toast(msg, { duration: options.duration });
      }
    },
    hideToast: () => toast.dismiss(),
  };
}

const styles = StyleSheet.create({
  nativeWrapper: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  nativeToast: {
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
  nativeText: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: colors.ink,
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
