import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme, typography } from '@/theme';
import { CloseIcon } from './Icons';

interface MobileFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedRole: 'ALL' | 'USER' | 'ADMIN';
  selectedStatus: 'ALL' | 'ACTIVE' | 'DISABLED';
  onApply: (role: 'ALL' | 'USER' | 'ADMIN', status: 'ALL' | 'ACTIVE' | 'DISABLED') => void;
  onReset: () => void;
}

export const MobileFilterSheet: React.FC<MobileFilterSheetProps> = ({
  visible,
  onClose,
  selectedRole,
  selectedStatus,
  onApply,
  onReset,
}) => {
  const { colors } = useTheme();

  // Local draft state so user can change filters and hit "Apply filters"
  const [draftRole, setDraftRole] = useState(selectedRole);
  const [draftStatus, setDraftStatus] = useState(selectedStatus);

  useEffect(() => {
    if (visible) {
      setDraftRole(selectedRole);
      setDraftStatus(selectedStatus);
    }
  }, [visible, selectedRole, selectedStatus]);

  if (!visible) return null;

  const roleOptions: { key: 'ALL' | 'USER' | 'ADMIN'; label: string }[] = [
    { key: 'ALL', label: 'All Roles' },
    { key: 'USER', label: 'User' },
    { key: 'ADMIN', label: 'Admin' },
  ];

  const statusOptions: { key: 'ALL' | 'ACTIVE' | 'DISABLED'; label: string }[] = [
    { key: 'ALL', label: 'All Statuses' },
    { key: 'ACTIVE', label: 'Active' },
    { key: 'DISABLED', label: 'Disabled' },
  ];

  const handleApply = () => {
    onApply(draftRole, draftStatus);
    onClose();
  };

  const handleReset = () => {
    setDraftRole('ALL');
    setDraftStatus('ALL');
    onReset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.sheetContainer,
                {
                  backgroundColor: colors.surface,
                  borderTopColor: colors.border,
                },
              ]}
            >
              {/* Drag Handle Indicator */}
              <View style={styles.handleContainer}>
                <View style={[styles.handle, { backgroundColor: colors.border }]} />
              </View>

              {/* Sheet Header */}
              <View style={[styles.headerRow, { borderBottomColor: colors.borderSubtle }]}>
                <View>
                  <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>Filter Users</Text>
                  <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>
                    Refine administrative user directory
                  </Text>
                </View>

                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.6 : 1 }]}
                  accessibilityLabel="Close filter sheet"
                >
                  <CloseIcon size={16} color={colors.textSecondary} />
                </Pressable>
              </View>

              {/* Filter: Role */}
              <View style={styles.filterSection}>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ROLE</Text>
                <View style={styles.optionsRow}>
                  {roleOptions.map((opt) => {
                    const isSelected = draftRole === opt.key;
                    return (
                      <Pressable
                        key={opt.key}
                        onPress={() => setDraftRole(opt.key)}
                        style={({ pressed }) => [
                          styles.optionPill,
                          {
                            backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                            borderColor: isSelected ? colors.primary : colors.border,
                            opacity: pressed ? 0.8 : 1,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionPillText,
                            {
                              color: isSelected ? colors.primaryForeground : colors.textPrimary,
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

              {/* Filter: Status */}
              <View style={styles.filterSection}>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ACCOUNT STATUS</Text>
                <View style={styles.optionsRow}>
                  {statusOptions.map((opt) => {
                    const isSelected = draftStatus === opt.key;
                    return (
                      <Pressable
                        key={opt.key}
                        onPress={() => setDraftStatus(opt.key)}
                        style={({ pressed }) => [
                          styles.optionPill,
                          {
                            backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                            borderColor: isSelected ? colors.primary : colors.border,
                            opacity: pressed ? 0.8 : 1,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionPillText,
                            {
                              color: isSelected ? colors.primaryForeground : colors.textPrimary,
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

              {/* Action Buttons: Reset all & Apply filters (Ref Screenshot 2) */}
              <View style={[styles.footerActions, { borderTopColor: colors.borderSubtle }]}>
                <Pressable
                  onPress={handleReset}
                  style={({ pressed }) => [
                    styles.resetBtn,
                    {
                      backgroundColor: colors.surfaceSecondary,
                      borderColor: colors.border,
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Reset all filters"
                >
                  <Text style={[styles.resetBtnText, { color: colors.textSecondary }]}>Reset all</Text>
                </Pressable>

                <Pressable
                  onPress={handleApply}
                  style={({ pressed }) => [
                    styles.applyBtn,
                    {
                      backgroundColor: colors.primary,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Apply filters"
                >
                  <Text style={[styles.applyBtnText, { color: colors.primaryForeground }]}>Apply filters</Text>
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
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 28,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    marginTop: 4,
  },
  sheetTitle: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sheetSubtitle: {
    fontFamily: typography.fonts.body,
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  filterSection: {
    marginTop: 18,
  },
  sectionLabel: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  optionPillText: {
    fontSize: 13,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: {
    fontFamily: typography.fonts.bodySemibold,
    fontSize: 14,
    fontWeight: '600',
  },
  applyBtn: {
    flex: 1.4,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    fontFamily: typography.fonts.bodySemibold,
    fontSize: 14,
    fontWeight: '600',
  },
});
