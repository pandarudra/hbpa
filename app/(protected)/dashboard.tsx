import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
} from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import toast from "react-hot-toast";
import { Avatar } from "@/components/common/Avatar";
import { HorizonIcon } from "@/components/common/HorizonIcon";
import { RoleBadge } from "@/features/dashboard/components/RoleBadge";
import { colors, fonts, rounded, spacing, shadows } from "@/constants/theme";

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width > 640;

  if (!user) return null;

  const handleSignOut = async () => {
    toast("Signed out of Horizon workspace.");
    await signOut();
  };

  const firstName = user.name ? user.name.split(" ")[0] : "Member";

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  const lastLogin = user.lastLoginAt
    ? new Date(user.lastLoginAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  const emailDomain = user.email ? (user.email.split("@")[1] ?? "") : "";

  return (
    <SafeAreaView style={styles.safe}>
      {/* Navigation Bar (nav-bar) */}
      <View style={styles.navBar}>
        <View style={styles.navLeft}>
          <HorizonIcon size={26} variant="filled" />
          <Text style={styles.navTitle}>HORIZON</Text>
        </View>

        <View style={styles.navRight}>
          <Avatar uri={user.avatarUrl} name={user.name} size={34} />
          <TouchableOpacity
            onPress={handleSignOut}
            style={styles.navLogoutBtn}
            accessibilityLabel="Sign out"
            accessibilityRole="button"
            activeOpacity={0.8}
          >
            <Text style={styles.navLogoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, isWide && styles.scrollWide]}
        showsVerticalScrollIndicator={false}
      >
        {/* Editorial Hero Statement (hero) */}
        <View style={styles.heroSection}>
          <View style={styles.heroEyebrow}>
            <View style={styles.heroDot} />
            <Text style={styles.heroEyebrowText}>WORKSPACE PROFILE</Text>
          </View>
          <Text style={styles.heroHeading}>Welcome back, {firstName}.</Text>
          <Text style={styles.heroSubheading}>
            Your official domain session is active and authenticated.
          </Text>
        </View>

        {/* Member Profile Card (feature-card) */}
        <View style={styles.card}>
          <View style={styles.profileHeader}>
            <Avatar uri={user.avatarUrl} name={user.name} size={68} />
            <View style={styles.profileMeta}>
              <Text style={styles.userName}>
                {user.name || "Organization Member"}
              </Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.badgeRow}>
                <RoleBadge role={user.role} />
              </View>
            </View>
          </View>
        </View>

        {/* Telemetry & Details Card (feature-card) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Session & Account Telemetry</Text>

          <StatRow
            label="Domain Verification"
            value={`@${emailDomain}`}
            isAccent
          />
          <StatRow
            label="Account Status"
            value={user.status === "ACTIVE" ? "Active" : user.status}
            statusDot={user.status === "ACTIVE"}
          />
          <StatRow label="Identity Provider" value="Google Workspace" />
          <StatRow label="Member Since" value={memberSince} />
          <StatRow label="Last Authenticated" value={lastLogin} isLast />
        </View>

        {/* Action Button: button-outline-stone */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          accessibilityLabel="Sign out of Horizon"
          accessibilityRole="button"
          activeOpacity={0.85}
        >
          <Text style={styles.signOutButtonText}>Sign Out of Horizon</Text>
        </TouchableOpacity>
        {/* Quiet Editorial Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Horizon Zero-Trust Workspace · Cryptographically Verified
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatRow({
  label,
  value,
  statusDot = false,
  isAccent = false,
  isLast = false,
}: {
  label: string;
  value: string;
  statusDot?: boolean;
  isAccent?: boolean;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.statRow, isLast && styles.statRowLast]}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statValueGroup}>
        {statusDot && <View style={styles.statusDot} />}
        <Text
          style={[
            styles.statValue,
            isAccent && styles.statValueAccent,
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.canvas,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  navLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  navTitle: {
    fontFamily: fonts.serif,
    fontSize: 15,
    fontWeight: "300",
    letterSpacing: 2,
    color: colors.stone,
    textTransform: "uppercase",
  },
  navRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  navLogoutBtn: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xxs + 2,
    borderRadius: rounded.full,
    borderWidth: 1,
    borderColor: colors.stone,
    backgroundColor: colors.canvas,
  },
  navLogoutText: {
    color: colors.stone,
    fontFamily: fonts.sans,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.lg,
  },
  scrollWide: {
    maxWidth: 580,
    width: "100%",
    alignSelf: "center",
    paddingVertical: spacing.xxl,
  },
  heroSection: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  heroEyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    alignSelf: "flex-start",
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.olive,
  },
  heroEyebrowText: {
    fontFamily: fonts.sans,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: colors.stone,
    textTransform: "uppercase",
  },
  heroHeading: {
    fontFamily: fonts.serif,
    fontSize: 32,
    fontWeight: "300",
    color: colors.ink,
    letterSpacing: -0.3,
    lineHeight: 38,
  },
  heroSubheading: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.stone,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: rounded.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.xl,
    gap: spacing.md,
    ...shadows.card,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  profileMeta: {
    flex: 1,
    gap: spacing.xxs,
  },
  userName: {
    fontFamily: fonts.sans,
    fontSize: 19,
    fontWeight: "600",
    color: colors.ink,
    letterSpacing: 0.1,
  },
  userEmail: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.stone,
  },
  badgeRow: {
    marginTop: spacing.xxs,
  },
  cardTitle: {
    fontFamily: fonts.sans,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: colors.ash,
    textTransform: "uppercase",
    marginBottom: spacing.xxs,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  statRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  statLabel: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.stone,
  },
  statValueGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.forest,
  },
  statValue: {
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: "500",
    color: colors.ink,
  },
  statValueAccent: {
    color: colors.primary,
    fontWeight: "600",
  },
  signOutButton: {
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.stone,
    borderRadius: rounded.full,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    minHeight: 48,
  },
  signOutButtonText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: "600",
    color: colors.stone,
    letterSpacing: 0.3,
  },
  footer: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  footerText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.ash,
    letterSpacing: 0.2,
  },
});
