import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Sun, Moon, Monitor } from 'lucide-react-native';
import { useTheme } from '@/theme';

interface ThemeToggleProps {
  size?: number;
  showBorder?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 36,
  showBorder = true,
}) => {
  const { mode, isDark, colors, toggleTheme } = useTheme();

  return (
    <Pressable
      onPress={toggleTheme}
      accessibilityRole="button"
      accessibilityLabel={`Switch theme. Currently ${mode}`}
      style={({ pressed }) => [
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.surfaceSecondary,
          borderColor: showBorder ? colors.border : 'transparent',
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <View style={styles.iconWrapper}>
        {mode === 'system' ? (
          <Monitor size={16} color={colors.textPrimary} strokeWidth={1.8} />
        ) : isDark ? (
          <Moon size={16} color={colors.textPrimary} strokeWidth={1.8} />
        ) : (
          <Sun size={16} color={colors.textPrimary} strokeWidth={1.8} />
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
