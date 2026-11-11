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
} from '@/components/common/Icons';
import { RoleBadge } from '@/features/dashboard/components/RoleBadge';
import { adminApi } from '@/services/api/adminApi';
import type {
  AdminUserItem,
  AdminPagination,
  UserRole,
  UserStatus,
} from '@/features/authentication/types/auth.types';
import { colors, fonts, rounded, spacing, shadows } from '@/constants/theme';

export default function AdminDashboardScreen() {
  const { user, signOut } = useAuth();
  const { width } = useWindowDimensions();
  const isCompact = width < 768;

  // Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<UserStatus | undefined>(undefined);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

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
    <SafeAreaView style={styles.safe}>
      {/* 1. Admin Header */}
      <View style={styles.header}>
        {/* Left: Horizon Brand + Admin Pill */}
        <View style={styles.headerLeft}>
          <HorizonIcon size={26} variant="filled" />
          <Text style={styles.brandName}>HORIZON</Text>
          <View style={styles.adminIndicator}>
            <Text style={styles.adminIndicatorText}>ADMIN</Text>
          </View>
        </View>

        {/* Right: Logged-in admin profile & Sign out */}
        <View style={styles.headerRight}>
          <Avatar uri={user.avatarUrl} name={user.name} size={34} />
          {!isCompact && (
            <Text style={styles.adminName} numberOfLines={1}>
              {user.name || 'Administrator'}
            </Text>
          )}
          <TouchableOpacity
            onPress={handleSignOut}
            style={styles.signOutBtn}
            accessibilityLabel="Sign out"
            accessibilityRole="button"
            activeOpacity={0.8}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area (Scrolls vertically when needed) */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.container}>
          {/* Page Heading */}
          <View style={styles.pageHeadingSection}>
            <Text style={styles.pageTitle}>User Management</Text>
            <Text style={styles.pageDescription}>
              Manage and review registered members of your organization.
            </Text>
          </View>

          {/* Search & Filter Controls Bar */}
          <View style={styles.controlsCard}>
            {/* Search Input */}
            <View style={styles.searchWrapper}>
              <SearchIcon size={15} color={colors.ash} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name or email…"
                placeholderTextColor={colors.ash}
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
                  <CloseIcon size={12} color={colors.ash} />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Pills */}
            <View style={styles.filtersRow}>
              {/* Role Filters */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>ROLE:</Text>
                <TouchableOpacity
                  onPress={() => handleRoleChange(undefined)}
                  style={[
                    styles.filterPill,
                    selectedRole === undefined && styles.filterPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      selectedRole === undefined && styles.filterPillTextActive,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleRoleChange('USER')}
                  style={[
                    styles.filterPill,
                    selectedRole === 'USER' && styles.filterPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      selectedRole === 'USER' && styles.filterPillTextActive,
                    ]}
                  >
                    User
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleRoleChange('ADMIN')}
                  style={[
                    styles.filterPill,
                    selectedRole === 'ADMIN' && styles.filterPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      selectedRole === 'ADMIN' && styles.filterPillTextActive,
                    ]}
                  >
                    Admin
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Status Filters */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>STATUS:</Text>
                <TouchableOpacity
                  onPress={() => handleStatusChange(undefined)}
                  style={[
                    styles.filterPill,
                    selectedStatus === undefined && styles.filterPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      selectedStatus === undefined && styles.filterPillTextActive,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleStatusChange('ACTIVE')}
                  style={[
                    styles.filterPill,
                    selectedStatus === 'ACTIVE' && styles.filterPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      selectedStatus === 'ACTIVE' && styles.filterPillTextActive,
                    ]}
                  >
                    Active
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleStatusChange('DISABLED')}
                  style={[
                    styles.filterPill,
                    selectedStatus === 'DISABLED' && styles.filterPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      selectedStatus === 'DISABLED' && styles.filterPillTextActive,
                    ]}
                  >
                    Disabled
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Page Size Selector */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>PER PAGE:</Text>
                {[10, 25, 50].map((limitVal) => (
                  <TouchableOpacity
                    key={limitVal}
                    onPress={() => handleLimitChange(limitVal)}
                    style={[
                      styles.filterPill,
                      pageSize === limitVal && styles.filterPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        pageSize === limitVal && styles.filterPillTextActive,
                      ]}
                    >
                      {limitVal}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* User Table Card */}
          <View style={styles.tableCard}>
            {/* Horizontal Scroll wrapper for responsive mobile display */}
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={styles.tableScrollInner}
            >
              <View style={styles.table}>
                {/* Table Header */}
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.th, styles.colUser]}>USER</Text>
                  <Text style={[styles.th, styles.colEmail]}>EMAIL</Text>
                  <Text style={[styles.th, styles.colRole]}>ROLE</Text>
                  <Text style={[styles.th, styles.colStatus]}>STATUS</Text>
                  <Text style={[styles.th, styles.colJoined]}>JOINED</Text>
                  <Text style={[styles.th, styles.colLastLogin]}>LAST LOGIN</Text>
                </View>

                {/* Table Body States */}
                {isLoading ? (
                  <View style={styles.stateContainer}>
                    <ActivityIndicator size="small" color={colors.stone} />
                    <Text style={styles.stateText}>Loading user directory…</Text>
                  </View>
                ) : errorMsg ? (
                  <View style={styles.stateContainer}>
                    <View style={styles.errorIconBadge}>
                      <AlertCircleIcon size={22} color={colors.error} />
                    </View>
                    <Text style={styles.errorStateText}>{errorMsg}</Text>
                    <TouchableOpacity
                      onPress={fetchUsers}
                      style={styles.retryBtn}
                    >
                      <Text style={styles.retryBtnText}>Try Again</Text>
                    </TouchableOpacity>
                  </View>
                ) : users.length === 0 ? (
                  <View style={styles.stateContainer}>
                    <Text style={styles.emptyTitle}>No members found</Text>
                    <Text style={styles.emptySubtitle}>
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
                          isLast && styles.tableRowLast,
                        ]}
                      >
                        {/* User column (Avatar + Name) */}
                        <View style={[styles.td, styles.colUser, styles.userCell]}>
                          <Avatar uri={item.avatarUrl ?? undefined} name={item.name} size={32} />
                          <Text style={styles.userNameText} numberOfLines={1}>
                            {item.name || 'Member'}
                          </Text>
                        </View>

                        {/* Email */}
                        <View style={[styles.td, styles.colEmail]}>
                          <Text style={styles.emailText} numberOfLines={1}>
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
                                item.status === 'ACTIVE'
                                  ? styles.statusDotActive
                                  : styles.statusDotDisabled,
                              ]}
                            />
                            <Text style={styles.statusText}>
                              {item.status === 'ACTIVE' ? 'Active' : 'Disabled'}
                            </Text>
                          </View>
                        </View>

                        {/* Joined */}
                        <View style={[styles.td, styles.colJoined]}>
                          <Text style={styles.dateText}>{joinedDate}</Text>
                        </View>

                        {/* Last Login */}
                        <View style={[styles.td, styles.colLastLogin]}>
                          <Text style={styles.dateText}>{lastLoginDate}</Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </ScrollView>

            {/* Pagination Footer */}
            {pagination && (
              <View style={styles.paginationFooter}>
                <Text style={styles.paginationCountText}>
                  {paginationInfo}
                </Text>

                <View style={styles.paginationButtons}>
                  <TouchableOpacity
                    onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination.hasPreviousPage || isLoading}
                    style={[
                      styles.pageBtn,
                      (!pagination.hasPreviousPage || isLoading) &&
                        styles.pageBtnDisabled,
                    ]}
                  >
                    <View style={styles.pageBtnContent}>
                      <ChevronLeftIcon
                        size={10}
                        color={
                          !pagination.hasPreviousPage || isLoading
                            ? colors.ash
                            : colors.stone
                        }
                      />
                      <Text
                        style={[
                          styles.pageBtnText,
                          (!pagination.hasPreviousPage || isLoading) &&
                            styles.pageBtnTextDisabled,
                        ]}
                      >
                        Previous
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.pageNumberBadge}>
                    <Text style={styles.pageNumberText}>
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
                      (!pagination.hasNextPage || isLoading) &&
                        styles.pageBtnDisabled,
                    ]}
                  >
                    <View style={styles.pageBtnContent}>
                      <Text
                        style={[
                          styles.pageBtnText,
                          (!pagination.hasNextPage || isLoading) &&
                            styles.pageBtnTextDisabled,
                        ]}
                      >
                        Next
                      </Text>
                      <ChevronRightIcon
                        size={10}
                        color={
                          !pagination.hasNextPage || isLoading
                            ? colors.ash
                            : colors.stone
                        }
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.canvas,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  brandName: {
    fontFamily: fonts.serif,
    fontSize: 15,
    fontWeight: '300',
    letterSpacing: 2.5,
    color: colors.stone,
    textTransform: 'uppercase',
  },
  adminIndicator: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: rounded.xs,
    backgroundColor: colors.goldBg,
    borderColor: colors.goldPale,
    borderWidth: 1,
    marginLeft: spacing.xxs,
  },
  adminIndicatorText: {
    fontFamily: fonts.sans,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.gold,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  adminName: {
    fontFamily: fonts.sans,
    fontSize: 13,
    fontWeight: '500',
    color: colors.ink,
    maxWidth: 160,
  },
  signOutBtn: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xxs + 3,
    borderRadius: rounded.full,
    borderWidth: 1,
    borderColor: colors.stone,
    backgroundColor: colors.canvas,
  },
  signOutText: {
    color: colors.stone,
    fontFamily: fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  container: {
    maxWidth: 1120,
    width: '100%',
    alignSelf: 'center',
    gap: spacing.lg,
  },
  pageHeadingSection: {
    gap: spacing.xxs,
  },
  pageTitle: {
    fontFamily: fonts.serif,
    fontSize: 32,
    fontWeight: '300',
    color: colors.ink,
    letterSpacing: -0.3,
  },
  pageDescription: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.stone,
    lineHeight: 20,
  },
  controlsCard: {
    backgroundColor: colors.surface,
    borderColor: colors.hairline,
    borderWidth: 1,
    borderRadius: rounded.lg,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.card,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.canvas,
    borderColor: colors.hairline,
    borderWidth: 1,
    borderRadius: rounded.md,
    paddingHorizontal: spacing.md,
    height: 42,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.ink,
  },
  clearSearchBtn: {
    padding: spacing.xxs,
  },
  clearSearchText: {
    fontSize: 12,
    color: colors.ash,
    fontWeight: '600',
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  filterLabel: {
    fontFamily: fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.ash,
    marginRight: 2,
  },
  filterPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 1,
    borderRadius: rounded.full,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  filterPillActive: {
    backgroundColor: colors.stone,
    borderColor: colors.stone,
  },
  filterPillText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.stone,
    fontWeight: '500',
  },
  filterPillTextActive: {
    color: colors.onStone,
    fontWeight: '600',
  },
  tableCard: {
    backgroundColor: colors.surface,
    borderColor: colors.hairline,
    borderWidth: 1,
    borderRadius: rounded.lg,
    overflow: 'hidden',
    ...shadows.card,
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
    backgroundColor: colors.canvas,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
  },
  th: {
    fontFamily: fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.ash,
    textTransform: 'uppercase',
  },
  tableRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
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
    paddingRight: spacing.sm,
  },
  colEmail: {
    flex: 2.6,
    minWidth: 210,
    paddingRight: spacing.sm,
  },
  colRole: {
    flex: 1.1,
    minWidth: 100,
    paddingRight: spacing.sm,
  },
  colStatus: {
    flex: 1.1,
    minWidth: 100,
    paddingRight: spacing.sm,
  },
  colJoined: {
    flex: 1.3,
    minWidth: 120,
    paddingRight: spacing.sm,
  },
  colLastLogin: {
    flex: 1.3,
    minWidth: 120,
  },
  userCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  userNameText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
    flex: 1,
  },
  emailText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.stone,
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
  statusDotActive: {
    backgroundColor: colors.forest,
  },
  statusDotDisabled: {
    backgroundColor: colors.ash,
  },
  statusText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.stone,
  },
  dateText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.stone,
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  stateText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.ash,
  },
  errorIconBadge: {
    marginBottom: spacing.xs,
  },
  errorStateText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.error,
  },
  retryBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: rounded.full,
    borderWidth: 1,
    borderColor: colors.stone,
    marginTop: spacing.xs,
  },
  retryBtnText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: colors.stone,
  },
  emptyTitle: {
    fontFamily: fonts.serif,
    fontSize: 18,
    fontWeight: '300',
    color: colors.ink,
  },
  emptySubtitle: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.ash,
  },
  paginationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    backgroundColor: colors.surface,
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  paginationCountText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.stone,
  },
  paginationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pageBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: rounded.full,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  pageBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pageBtnDisabled: {
    opacity: 0.4,
  },
  pageBtnText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: colors.stone,
  },
  pageBtnTextDisabled: {
    color: colors.ash,
  },
  pageNumberBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pageNumberText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.ash,
    fontWeight: '500',
  },
});
