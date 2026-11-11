import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import toast from 'react-hot-toast';
import { Avatar } from '@/components/common/Avatar';
import { HorizonIcon } from '@/components/common/HorizonIcon';
import {
  SearchIcon,
  CloseIcon,
  AlertCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
} from '@/components/common/Icons';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { ProfileMenuModal } from '@/components/common/ProfileMenuModal';
import { MobileFilterSheet } from '@/components/common/MobileFilterSheet';
import { RoleBadge } from '@/features/dashboard/components/RoleBadge';
import { adminApi } from '@/services/api/adminApi';
import type {
  AdminUserItem,
  AdminPagination,
  UserRole,
  UserStatus,
} from '@/features/authentication/types/auth.types';
import { useTheme } from '@/theme';

export default function AdminDashboardScreen() {
  const { user, signOut } = useAuth();
  const { width } = useWindowDimensions();
  const { colors, isDark } = useTheme();
  const isCompact = width < 768;

  // Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<UserStatus | undefined>(undefined);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal State
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [mobileFilterVisible, setMobileFilterVisible] = useState(false);

  // Data & Request State
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [pagination, setPagination] = useState<AdminPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchUsers = useCallback(async () => {
    if (!user || user.role !== 'ADMIN') return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await adminApi.listUsers({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch || undefined,
        role: selectedRole,
        status: selectedStatus,
      });

      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setErrorMsg(e.message ?? 'Failed to load organization users.');
      toast.error('Failed to load user directory.');
    } finally {
      setIsLoading(false);
    }
  }, [user, currentPage, pageSize, debouncedSearch, selectedRole, selectedStatus]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSignOut = async () => {
    toast('Signed out of Horizon workspace.');
    await signOut();
  };

  const handleRoleChange = (role?: UserRole) => {
    setSelectedRole(role);
    setCurrentPage(1);
  };

  const handleStatusChange = (status?: UserStatus) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setPageSize(newLimit);
    setCurrentPage(1);
  };

  const activeFilterCount = (selectedRole ? 1 : 0) + (selectedStatus ? 1 : 0);

  const paginationInfo = useMemo(() => {
    if (!pagination || pagination.totalUsers === 0) {
      return 'Showing 0 users';
    }
    const start = (pagination.currentPage - 1) * pagination.pageSize + 1;
    const end = Math.min(
      pagination.currentPage * pagination.pageSize,
      pagination.totalUsers,
    );
    return `Showing ${start}-${end} of ${pagination.totalUsers} users`;
  }, [pagination]);

  // Authorization Guard: Regular USER must be redirected to /dashboard
  if (!user) return null;
  if (user.role !== 'ADMIN') {
    return <Redirect href="/dashboard" />;
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* 1. Admin Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
          isCompact && styles.headerCompact,
        ]}
      >
        {/* Left: Horizon Brand + Admin Pill */}
        <View style={styles.headerLeft}>
          <HorizonIcon size={isCompact ? 24 : 26} variant="filled" />
          <Text style={[styles.brandName, { color: colors.textPrimary }]}>HORIZON</Text>
          <View
            style={[
              styles.adminIndicator,
              {
                backgroundColor: colors.roleAdminBg,
                borderColor: colors.roleAdminBorder,
              },
            ]}
          >
            <Text style={[styles.adminIndicatorText, { color: colors.roleAdminText }]}>ADMIN</Text>
          </View>
        </View>

        {/* Right: Theme Toggle + User Avatar (opens ProfileMenu) + Sign Out on desktop */}
        <View style={styles.headerRight}>
          <ThemeToggle size={34} />

          <TouchableOpacity
            onPress={() => setProfileMenuVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Open user menu"
            activeOpacity={0.8}
            style={styles.avatarButton}
          >
            <Avatar uri={user.avatarUrl} name={user.name} size={isCompact ? 32 : 34} />
          </TouchableOpacity>

          {!isCompact && (
            <TouchableOpacity
              onPress={handleSignOut}
              style={[
                styles.signOutBtn,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                },
              ]}
              accessibilityLabel="Sign out"
              accessibilityRole="button"
              activeOpacity={0.8}
            >
              <Text style={[styles.signOutText, { color: colors.textPrimary }]}>Sign Out</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content Area */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isCompact && styles.scrollContentCompact,
        ]}
        showsVerticalScrollIndicator={true}
      >
        <View style={[styles.container, isCompact && styles.containerCompact]}>
          {/* Page Heading */}
          <View style={styles.pageHeadingSection}>
            <Text
              style={[
                styles.pageTitle,
                { color: colors.textPrimary },
                isCompact && styles.pageTitleCompact,
              ]}
            >
              User Management
            </Text>
            <Text style={[styles.pageDescription, { color: colors.textSecondary }]}>
              Manage and review registered members of your organization.
            </Text>
          </View>

          {/* Search & Filter Controls */}
          <View
            style={[
              styles.controlsCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Search Input */}
            <View
              style={[
                styles.searchWrapper,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                },
              ]}
            >
              <SearchIcon size={15} color={colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder="Search by name or email…"
                placeholderTextColor={colors.textMuted}
                value={searchTerm}
                onChangeText={setSearchTerm}
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
              {searchTerm.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchTerm('')}
                  hitSlop={8}
                  style={styles.clearSearchBtn}
                >
                  <CloseIcon size={12} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Mobile Filter Action Row (Ref Screenshot 2) */}
            {isCompact ? (
              <View style={styles.mobileFilterBar}>
                <TouchableOpacity
                  onPress={() => setMobileFilterVisible(true)}
                  style={[
                    styles.mobileFilterTriggerBtn,
                    {
                      backgroundColor: activeFilterCount > 0 ? colors.primary : colors.surfaceSecondary,
                      borderColor: activeFilterCount > 0 ? colors.primary : colors.border,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Open filters sheet"
                  activeOpacity={0.8}
                >
                  <FilterIcon
                    size={14}
                    color={activeFilterCount > 0 ? colors.primaryForeground : colors.textPrimary}
                  />
                  <Text
                    style={[
                      styles.mobileFilterTriggerText,
                      {
                        color: activeFilterCount > 0 ? colors.primaryForeground : colors.textPrimary,
                      },
                    ]}
                  >
                    Filter {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
                  </Text>
                </TouchableOpacity>

                {/* Per Page Quick Select on Mobile */}
                <View style={styles.mobilePerPageGroup}>
                  <Text style={[styles.perPageLabel, { color: colors.textSecondary }]}>Rows:</Text>
                  {[10, 25, 50].map((limitVal) => {
                    const isSelected = pageSize === limitVal;
                    return (
                      <TouchableOpacity
                        key={limitVal}
                        onPress={() => handleLimitChange(limitVal)}
                        style={[
                          styles.mobilePerPagePill,
                          {
                            backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                            borderColor: isSelected ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.mobilePerPagePillText,
                            {
                              color: isSelected ? colors.primaryForeground : colors.textSecondary,
                              fontWeight: isSelected ? '600' : '400',
                            },
                          ]}
                        >
                          {limitVal}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : (
              /* Desktop Filter Pills Bar */
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersScrollContent}
                style={styles.filtersScrollView}
              >
                <View style={styles.filtersRow}>
                  {/* Role Filters */}
                  <View style={styles.filterGroup}>
                    <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>ROLE:</Text>
                    {(['ALL', 'USER', 'ADMIN'] as const).map((r) => {
                      const isSelected = (r === 'ALL' && selectedRole === undefined) || selectedRole === r;
                      return (
                        <TouchableOpacity
                          key={r}
                          onPress={() => handleRoleChange(r === 'ALL' ? undefined : (r as UserRole))}
                          style={[
                            styles.filterPill,
                            {
                              backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                              borderColor: isSelected ? colors.primary : colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.filterPillText,
                              {
                                color: isSelected ? colors.primaryForeground : colors.textPrimary,
                                fontWeight: isSelected ? '600' : '500',
                              },
                            ]}
                          >
                            {r === 'ALL' ? 'All' : r === 'USER' ? 'User' : 'Admin'}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Status Filters */}
                  <View style={styles.filterGroup}>
                    <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>STATUS:</Text>
                    {(['ALL', 'ACTIVE', 'DISABLED'] as const).map((s) => {
                      const isSelected = (s === 'ALL' && selectedStatus === undefined) || selectedStatus === s;
                      return (
                        <TouchableOpacity
                          key={s}
                          onPress={() => handleStatusChange(s === 'ALL' ? undefined : (s as UserStatus))}
                          style={[
                            styles.filterPill,
                            {
                              backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                              borderColor: isSelected ? colors.primary : colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.filterPillText,
                              {
                                color: isSelected ? colors.primaryForeground : colors.textPrimary,
                                fontWeight: isSelected ? '600' : '500',
                              },
                            ]}
                          >
                            {s === 'ALL' ? 'All' : s === 'ACTIVE' ? 'Active' : 'Disabled'}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Page Size Selector */}
                  <View style={styles.filterGroup}>
                    <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>PER PAGE:</Text>
                    {[10, 25, 50].map((limitVal) => {
                      const isSelected = pageSize === limitVal;
                      return (
                        <TouchableOpacity
                          key={limitVal}
                          onPress={() => handleLimitChange(limitVal)}
                          style={[
                            styles.filterPill,
                            {
                              backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                              borderColor: isSelected ? colors.primary : colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.filterPillText,
                              {
                                color: isSelected ? colors.primaryForeground : colors.textPrimary,
                                fontWeight: isSelected ? '600' : '500',
                              },
                            ]}
                          >
                            {limitVal}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>
            )}
          </View>

          {/* User Directory Container */}
          <View
            style={[
              styles.tableCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {isCompact ? (
              /* ── MOBILE NATIVE USER CARDS (Ref Screenshot 1) ────────── */
              <View style={styles.mobileList}>
                {isLoading ? (
                  <View style={styles.stateContainer}>
                    <ActivityIndicator size="small" color={colors.textPrimary} />
                    <Text style={[styles.stateText, { color: colors.textSecondary }]}>
                      Loading user directory…
                    </Text>
                  </View>
                ) : errorMsg ? (
                  <View style={styles.stateContainer}>
                    <View style={styles.errorIconBadge}>
                      <AlertCircleIcon size={24} color={colors.danger} />
                    </View>
                    <Text style={[styles.errorStateText, { color: colors.danger }]}>{errorMsg}</Text>
                    <TouchableOpacity
                      onPress={fetchUsers}
                      style={[styles.retryBtn, { borderColor: colors.border }]}
                    >
                      <Text style={[styles.retryBtnText, { color: colors.textPrimary }]}>Try Again</Text>
                    </TouchableOpacity>
                  </View>
                ) : users.length === 0 ? (
                  <View style={styles.stateContainer}>
                    <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No members found</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                      {searchTerm || selectedRole || selectedStatus
                        ? 'Try adjusting your search query or active filters.'
                        : 'No users have authenticated yet.'}
                    </Text>
                  </View>
                ) : (
                  users.map((item, index) => {
                    const isLast = index === users.length - 1;
                    const joinedDate = item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—';
                    const lastLoginDate = item.lastLoginAt
                      ? new Date(item.lastLoginAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Never';

                    return (
                      <View
                        key={item.id}
                        style={[
                          styles.mobileCard,
                          {
                            backgroundColor: isDark ? colors.surfaceSecondary : colors.surface,
                            borderColor: colors.border,
                          },
                          isLast && styles.mobileCardLast,
                        ]}
                      >
                        {/* Top Row: Avatar + Name/Email + Role Badge */}
                        <View style={styles.mobileCardTopRow}>
                          <Avatar uri={item.avatarUrl ?? undefined} name={item.name} size={40} />
                          <View style={styles.mobileUserInfo}>
                            <Text style={[styles.mobileUserName, { color: colors.textPrimary }]} numberOfLines={1}>
                              {item.name || 'Member'}
                            </Text>
                            <Text style={[styles.mobileUserEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                              {item.email}
                            </Text>
                          </View>
                          <RoleBadge role={item.role} />
                        </View>

                        {/* Subtle Divider */}
                        <View style={[styles.mobileCardDivider, { backgroundColor: colors.borderSubtle }]} />

                        {/* Bottom Row: Status Indicator + Last Login Date */}
                        <View style={styles.mobileCardBottomRow}>
                          <View style={styles.statusCell}>
                            <View
                              style={[
                                styles.statusDot,
                                {
                                  backgroundColor: item.status === 'ACTIVE' ? colors.success : colors.textMuted,
                                },
                              ]}
                            />
                            <Text style={[styles.statusText, { color: colors.textPrimary }]}>
                              {item.status === 'ACTIVE' ? 'Active' : 'Disabled'}
                            </Text>
                          </View>
                          <Text style={[styles.mobileDateMeta, { color: colors.textSecondary }]}>
                            {item.lastLoginAt ? `Active ${lastLoginDate}` : `Joined ${joinedDate}`}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            ) : (
              /* ── DESKTOP DATA TABLE ───────────────────────── */
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={styles.tableScrollInner}
              >
                <View style={styles.table}>
                  {/* Table Header */}
                  <View
                    style={[
                      styles.tableHeaderRow,
                      {
                        backgroundColor: colors.surfaceSecondary,
                        borderBottomColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.th, styles.colUser, { color: colors.textSecondary }]}>USER</Text>
                    <Text style={[styles.th, styles.colEmail, { color: colors.textSecondary }]}>EMAIL</Text>
                    <Text style={[styles.th, styles.colRole, { color: colors.textSecondary }]}>ROLE</Text>
                    <Text style={[styles.th, styles.colStatus, { color: colors.textSecondary }]}>STATUS</Text>
                    <Text style={[styles.th, styles.colJoined, { color: colors.textSecondary }]}>JOINED</Text>
                    <Text style={[styles.th, styles.colLastLogin, { color: colors.textSecondary }]}>LAST LOGIN</Text>
                  </View>

                  {/* Table Body States */}
                  {isLoading ? (
                    <View style={styles.stateContainer}>
                      <ActivityIndicator size="small" color={colors.textPrimary} />
                      <Text style={[styles.stateText, { color: colors.textSecondary }]}>
                        Loading user directory…
                      </Text>
                    </View>
                  ) : errorMsg ? (
                    <View style={styles.stateContainer}>
                      <View style={styles.errorIconBadge}>
                        <AlertCircleIcon size={24} color={colors.danger} />
                      </View>
                      <Text style={[styles.errorStateText, { color: colors.danger }]}>{errorMsg}</Text>
                      <TouchableOpacity
                        onPress={fetchUsers}
                        style={[styles.retryBtn, { borderColor: colors.border }]}
                      >
                        <Text style={[styles.retryBtnText, { color: colors.textPrimary }]}>Try Again</Text>
                      </TouchableOpacity>
                    </View>
                  ) : users.length === 0 ? (
                    <View style={styles.stateContainer}>
                      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No members found</Text>
                      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                        {searchTerm || selectedRole || selectedStatus
                          ? 'Try adjusting your search query or active filters.'
                          : 'No users have authenticated yet.'}
                      </Text>
                    </View>
                  ) : (
                    users.map((item, index) => {
                      const isLast = index === users.length - 1;
                      const joinedDate = item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—';
                      const lastLoginDate = item.lastLoginAt
                        ? new Date(item.lastLoginAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—';

                      return (
                        <View
                          key={item.id}
                          style={[
                            styles.tableRow,
                            {
                              borderBottomColor: colors.borderSubtle,
                            },
                            isLast && styles.tableRowLast,
                          ]}
                        >
                          {/* User column (Avatar + Name) */}
                          <View style={[styles.td, styles.colUser, styles.userCell]}>
                            <Avatar uri={item.avatarUrl ?? undefined} name={item.name} size={32} />
                            <Text style={[styles.userNameText, { color: colors.textPrimary }]} numberOfLines={1}>
                              {item.name || 'Member'}
                            </Text>
                          </View>

                          {/* Email */}
                          <View style={[styles.td, styles.colEmail]}>
                            <Text style={[styles.emailText, { color: colors.textPrimary }]} numberOfLines={1}>
                              {item.email}
                            </Text>
                          </View>

                          {/* Role */}
                          <View style={[styles.td, styles.colRole]}>
                            <RoleBadge role={item.role} />
                          </View>

                          {/* Status */}
                          <View style={[styles.td, styles.colStatus]}>
                            <View style={styles.statusCell}>
                              <View
                                style={[
                                  styles.statusDot,
                                  {
                                    backgroundColor: item.status === 'ACTIVE' ? colors.success : colors.textMuted,
                                  },
                                ]}
                              />
                              <Text style={[styles.statusText, { color: colors.textPrimary }]}>
                                {item.status === 'ACTIVE' ? 'Active' : 'Disabled'}
                              </Text>
                            </View>
                          </View>

                          {/* Joined */}
                          <View style={[styles.td, styles.colJoined]}>
                            <Text style={[styles.dateText, { color: colors.textSecondary }]}>{joinedDate}</Text>
                          </View>

                          {/* Last Login */}
                          <View style={[styles.td, styles.colLastLogin]}>
                            <Text style={[styles.dateText, { color: colors.textSecondary }]}>{lastLoginDate}</Text>
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              </ScrollView>
            )}

            {/* Pagination Footer */}
            {pagination && (
              <View
                style={[
                  styles.paginationFooter,
                  {
                    borderTopColor: colors.border,
                    backgroundColor: colors.surface,
                  },
                  isCompact && styles.paginationFooterCompact,
                ]}
              >
                <Text style={[styles.paginationCountText, { color: colors.textSecondary }]}>
                  {paginationInfo}
                </Text>

                <View style={[styles.paginationButtons, isCompact && styles.paginationButtonsCompact]}>
                  <TouchableOpacity
                    onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination.hasPreviousPage || isLoading}
                    style={[
                      styles.pageBtn,
                      {
                        backgroundColor: colors.surfaceSecondary,
                        borderColor: colors.border,
                      },
                      (!pagination.hasPreviousPage || isLoading) && styles.pageBtnDisabled,
                    ]}
                  >
                    <View style={styles.pageBtnContent}>
                      <ChevronLeftIcon
                        size={10}
                        color={!pagination.hasPreviousPage || isLoading ? colors.textMuted : colors.textPrimary}
                      />
                      <Text
                        style={[
                          styles.pageBtnText,
                          { color: colors.textPrimary },
                          (!pagination.hasPreviousPage || isLoading) && { color: colors.textMuted },
                        ]}
                      >
                        Previous
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.pageNumberBadge}>
                    <Text style={[styles.pageNumberText, { color: colors.textSecondary }]}>
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      setCurrentPage((p) =>
                        Math.min(pagination.totalPages, p + 1),
                      )
                    }
                    disabled={!pagination.hasNextPage || isLoading}
                    style={[
                      styles.pageBtn,
                      {
                        backgroundColor: colors.surfaceSecondary,
                        borderColor: colors.border,
                      },
                      (!pagination.hasNextPage || isLoading) && styles.pageBtnDisabled,
                    ]}
                  >
                    <View style={styles.pageBtnContent}>
                      <Text
                        style={[
                          styles.pageBtnText,
                          { color: colors.textPrimary },
                          (!pagination.hasNextPage || isLoading) && { color: colors.textMuted },
                        ]}
                      >
                        Next
                      </Text>
                      <ChevronRightIcon
                        size={10}
                        color={!pagination.hasNextPage || isLoading ? colors.textMuted : colors.textPrimary}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Profile & Appearance Menu Popover (Ref Screenshot 3) */}
      <ProfileMenuModal
        visible={profileMenuVisible}
        onClose={() => setProfileMenuVisible(false)}
        user={{
          displayName: user.name,
          email: user.email,
          role: user.role,
        }}
        onSignOut={handleSignOut}
      />

      {/* Mobile Filter Bottom Sheet (Ref Screenshot 2) */}
      <MobileFilterSheet
        visible={mobileFilterVisible}
        onClose={() => setMobileFilterVisible(false)}
        selectedRole={selectedRole || 'ALL'}
        selectedStatus={selectedStatus || 'ALL'}
        onApply={(role, status) => {
          setSelectedRole(role === 'ALL' ? undefined : role);
          setSelectedStatus(status === 'ALL' ? undefined : status);
          setCurrentPage(1);
        }}
        onReset={() => {
          setSelectedRole(undefined);
          setSelectedStatus(undefined);
          setCurrentPage(1);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerCompact: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandName: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  adminIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    borderWidth: 1,
    marginLeft: 4,
  },
  adminIndicatorText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarButton: {
    borderRadius: 9999,
  },
  signOutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
    borderWidth: 1,
  },
  signOutText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 28,
    paddingHorizontal: 24,
  },
  scrollContentCompact: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  container: {
    maxWidth: 1120,
    width: '100%',
    alignSelf: 'center',
    gap: 20,
  },
  containerCompact: {
    gap: 14,
  },
  pageHeadingSection: {
    gap: 4,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  pageTitleCompact: {
    fontSize: 22,
    letterSpacing: -0.3,
  },
  pageDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  controlsCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 9999,
    paddingHorizontal: 14,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  clearSearchBtn: {
    padding: 4,
  },
  mobileFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingTop: 2,
  },
  mobileFilterTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  mobileFilterTriggerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  mobilePerPageGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  perPageLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  mobilePerPagePill: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  mobilePerPagePillText: {
    fontSize: 11,
  },
  filtersScrollView: {
    width: '100%',
  },
  filtersScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginRight: 2,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
  },
  tableCard: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  tableScrollInner: {
    minWidth: '100%',
    flexGrow: 1,
  },
  table: {
    width: '100%',
    minWidth: 860,
  },
  tableHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  th: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tableRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  td: {
    justifyContent: 'center',
  },
  colUser: {
    flex: 2.2,
    minWidth: 190,
    paddingRight: 12,
  },
  colEmail: {
    flex: 2.6,
    minWidth: 210,
    paddingRight: 12,
  },
  colRole: {
    flex: 1.1,
    minWidth: 100,
    paddingRight: 12,
  },
  colStatus: {
    flex: 1.1,
    minWidth: 100,
    paddingRight: 12,
  },
  colJoined: {
    flex: 1.3,
    minWidth: 120,
    paddingRight: 12,
  },
  colLastLogin: {
    flex: 1.3,
    minWidth: 120,
  },
  userCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userNameText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  emailText: {
    fontSize: 13,
  },
  statusCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 13,
  },
  dateText: {
    fontSize: 13,
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 44,
    gap: 12,
  },
  stateText: {
    fontSize: 13,
  },
  errorIconBadge: {
    marginBottom: 4,
  },
  errorStateText: {
    fontSize: 14,
  },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    marginTop: 6,
  },
  retryBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 13,
  },
  paginationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    flexWrap: 'wrap',
    gap: 14,
  },
  paginationCountText: {
    fontSize: 13,
  },
  paginationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
  },
  pageBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pageBtnDisabled: {
    opacity: 0.4,
  },
  pageBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pageNumberBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pageNumberText: {
    fontSize: 12,
    fontWeight: '500',
  },
  paginationFooterCompact: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  paginationButtonsCompact: {
    width: '100%',
    justifyContent: 'space-between',
  },
  mobileList: {
    padding: 14,
    gap: 12,
  },
  mobileCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  mobileCardLast: {
    marginBottom: 0,
  },
  mobileCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mobileUserInfo: {
    flex: 1,
    gap: 2,
  },
  mobileUserName: {
    fontSize: 15,
    fontWeight: '600',
  },
  mobileUserEmail: {
    fontSize: 12,
  },
  mobileCardDivider: {
    height: 1,
    width: '100%',
  },
  mobileCardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mobileDateMeta: {
    fontSize: 12,
  },
});
