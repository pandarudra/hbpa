import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { useTheme } from '@/theme';
import type { ThemeMode } from '@/theme';
import { Sun, Moon, Monitor } from 'lucide-react-native';
import { CloseIcon } from './Icons';

interface ProfileMenuModalProps {
  visible: boolean;
  onClose: () => void;
  user: {
    displayName?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
  onSignOut: () => void;
}

export const ProfileMenuModal: React.FC<ProfileMenuModalProps> = ({
  visible,
  onClose,
  user,
  onSignOut,
}) => {
  const { mode, colors, setThemeMode } = useTheme();

  if (!visible) return null;

  const initials = (user?.displayName || user?.email || 'U')
    .slice(0, 2)
    .toUpperCase();

  const isAdmin = user?.role === 'ADMIN';

  const themeOptions: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    {
      mode: 'light',
      label: 'Light',
      icon: (
        <Sun
          size={14}
          color={mode === 'light' ? colors.primaryForeground : colors.textSecondary}
          strokeWidth={2}
        />
      ),
    },
    {
      mode: 'dark',
      label: 'Dark',
      icon: (
        <Moon
          size={14}
          color={mode === 'dark' ? colors.primaryForeground : colors.textSecondary}
          strokeWidth={2}
        />
      ),
    },
    {
      mode: 'system',
      label: 'System',
      icon: (
        <Monitor
          size={14}
          color={mode === 'system' ? colors.primaryForeground : colors.textSecondary}
          strokeWidth={2}
        />
      ),
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.popoverCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              {/* Header Info */}
              <View style={[styles.headerRow, { borderBottomColor: colors.borderSubtle }]}>
                <View style={[styles.avatar, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                  <Text style={[styles.avatarText, { color: colors.textPrimary }]}>{initials}</Text>
                </View>
                <View style={styles.userInfo}>
                  <View style={styles.nameBadgeRow}>
                    <Text style={[styles.userName, { color: colors.textPrimary }]} numberOfLines={1}>
                      {user?.displayName || 'Organization Member'}
                    </Text>
                  </View>
                  <Text style={[styles.userEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                    {user?.email || 'Authenticated'}
                  </Text>
                  <View style={styles.roleContainer}>
                    <View
                      style={[
                        styles.roleBadge,
                        {
                          backgroundColor: isAdmin ? colors.roleAdminBg : colors.roleUserBg,
                          borderColor: isAdmin ? colors.roleAdminBorder : colors.roleUserBorder,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.roleBadgeText,
                          { color: isAdmin ? colors.roleAdminText : colors.roleUserText },
                        ]}
                      >
                        {user?.role || 'USER'}
                      </Text>
                    </View>
                  </View>
                </View>

                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.6 : 1 }]}
                  accessibilityLabel="Close profile menu"
                >
                  <CloseIcon size={14} color={colors.textSecondary} />
                </Pressable>
              </View>

              {/* Theme Preference Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APPEARANCE</Text>
                <View style={[styles.themeSegment, { backgroundColor: colors.surfaceSecondary, borderColor: colors.borderSubtle }]}>
                  {themeOptions.map((opt) => {
                    const isSelected = mode === opt.mode;
                    return (
                      <Pressable
                        key={opt.mode}
                        onPress={() => setThemeMode(opt.mode)}
                        style={({ pressed }) => [
                          styles.themeOption,
                          isSelected && {
                            backgroundColor: colors.primary,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.1,
                            shadowRadius: 2,
                            elevation: 1,
                          },
                          { opacity: pressed ? 0.75 : 1 },
                        ]}
                      >
                        {opt.icon}
                        <Text
                          style={[
                            styles.themeOptionText,
                            {
                              color: isSelected ? colors.primaryForeground : colors.textSecondary,
                              fontWeight: isSelected ? '600' : '400',
                            },
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Divider */}
              <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

              {/* Actions Section */}
              <View style={styles.actionSection}>
                <Pressable
                  onPress={() => {
                    onClose();
                    onSignOut();
                  }}
                  style={({ pressed }) => [
                    styles.signOutBtn,
                    {
                      backgroundColor: colors.surfaceSecondary,
                      borderColor: colors.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Sign out"
                >
                  <Text style={[styles.signOutText, { color: colors.danger }]}>Sign Out</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'web' ? 58 : 64,
    paddingRight: 16,
    paddingLeft: 16,
  },
  popoverCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  roleContainer: {
    marginTop: 6,
    flexDirection: 'row',
  },
  roleBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 6,
  },
  section: {
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  themeSegment: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 8,
    gap: 6,
  },
  themeOptionText: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  actionSection: {},
  signOutBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
