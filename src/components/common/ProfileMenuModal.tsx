import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useTheme, typography } from '@/theme';
import type { ThemeMode } from '@/theme';
import { Sun, Moon, Monitor, LogOut } from 'lucide-react-native';
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
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

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
        <View
          style={[
            styles.backdrop,
            isDesktop ? styles.backdropDesktop : styles.backdropSidebar,
            { backgroundColor: colors.overlay },
          ]}
        >
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.popoverCard,
                isDesktop ? styles.popoverCardDesktop : styles.popoverCardSidebar,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              {/* Header Info */}
              <View style={[styles.headerRow, { borderBottomColor: colors.borderSubtle }]}>
                <View
                  style={[
                    styles.avatar,
                    isDesktop && styles.avatarDesktop,
                    { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarText,
                      isDesktop && styles.avatarTextDesktop,
                      { color: colors.textPrimary },
                    ]}
                  >
                    {initials}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <View style={styles.nameBadgeRow}>
                    <Text
                      style={[
                        styles.userName,
                        isDesktop && styles.userNameDesktop,
                        { color: colors.textPrimary },
                      ]}
                      numberOfLines={1}
                    >
                      {user?.displayName || 'Organization Member'}
                    </Text>
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
                  <Text
                    style={[
                      styles.userEmail,
                      isDesktop && styles.userEmailDesktop,
                      { color: colors.textSecondary },
                    ]}
                    numberOfLines={1}
                  >
                    {user?.email || 'Authenticated'}
                  </Text>
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
                              fontFamily: isSelected
                                ? typography.fonts.bodySemibold
                                : typography.fonts.body,
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
              <View style={[styles.actionSection, !isDesktop && styles.actionSectionSidebar]}>
                <Pressable
                  onPress={() => {
                    onClose();
                    onSignOut();
                  }}
                  style={({ pressed }) => [
                    styles.signOutBtn,
                    {
                      backgroundColor: colors.dangerBg,
                      borderColor: colors.dangerBorder,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Sign out"
                >
                  <LogOut size={14} color={colors.danger} strokeWidth={2} />
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
  },
  // Big centered modal on desktop/tablet.
  backdropDesktop: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  // Full-height drawer anchored to the right edge on phone.
  backdropSidebar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  popoverCard: {
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  popoverCardDesktop: {
    width: '100%',
    maxWidth: 460,
    borderRadius: 20,
    padding: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  popoverCardSidebar: {
    width: '82%',
    maxWidth: 340,
    height: '100%',
    borderWidth: 0,
    borderLeftWidth: 1,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    paddingTop: Platform.OS === 'web' ? 24 : 56,
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowOffset: { width: -4, height: 0 },
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
  avatarDesktop: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
  },
  avatarText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: 16,
    fontWeight: '700',
  },
  avatarTextDesktop: {
    fontSize: 20,
  },
  userInfo: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  userName: {
    flexShrink: 1,
    fontFamily: typography.fonts.bodySemibold,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  userNameDesktop: {
    fontSize: 18,
  },
  userEmail: {
    fontFamily: typography.fonts.body,
    fontSize: 12,
    marginTop: 3,
  },
  userEmailDesktop: {
    fontSize: 13,
  },
  roleBadge: {
    flexShrink: 0,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontFamily: typography.fonts.bodyBold,
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
    fontFamily: typography.fonts.bodyBold,
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
  actionSectionSidebar: {
    marginTop: 'auto',
  },
  signOutBtn: {
    flexDirection: 'row',
    gap: 7,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    fontFamily: typography.fonts.bodySemibold,
    fontSize: 13,
    fontWeight: '600',
  },
});
