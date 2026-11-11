import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
  Linking,
  useWindowDimensions,
} from "react-native";
import { Server, KeyRound, ShieldCheck, ArrowUpRight } from "lucide-react-native";
import { useTheme, typography } from "@/theme";
import { CloseIcon } from "@/components/common/Icons";

const REPO_BASE = "https://github.com/pandarudra/hbpa/blob/main/core";

interface Props {
  visible: boolean;
  onClose: () => void;
  allowedDomains: string[];
}

export function AuthInfoModal({ visible, onClose, allowedDomains }: Props) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const domainsList =
    allowedDomains.length > 0
      ? allowedDomains.map((d) => `@${d}`).join(", ")
      : "@hbplus.fit, @outr.ac.in";

  const sections = [
    {
      icon: Server,
      title: "Setup Instructions",
      body: "Install dependencies at the project root and inside backend/, then configure a Google OAuth 2.0 client and a Firebase project. Copy .env.example to .env on both sides and fill in the client ID, Firebase config, and allowed-domain list. Run npm run web, npm run android, or npm run ios for the client, and npm run dev inside backend/ for the API.",
      url: `${REPO_BASE}/setup-instructions.md`,
    },
    {
      icon: KeyRound,
      title: "Authentication Flow",
      body: "Continue with Google opens Google’s OAuth consent screen. On success, Google issues an ID token, which the backend verifies independently — the client never decides who gets in. The verified email’s domain is then checked against the allowed list; a match issues a session and routes you to your dashboard (or the admin console, for Admin accounts). A mismatch is rejected with an explicit error and no session is created. Signing out clears the session on both client and server.",
      url: `${REPO_BASE}/authentication-flow.md`,
    },
    {
      icon: ShieldCheck,
      title: "How Domain Restriction Works",
      body: `Only Google accounts ending in ${domainsList} can access this app. The check runs entirely server-side, after Google has already verified your identity, so it can’t be bypassed from the client. Any other domain is rejected with an "Access restricted" message before a session is ever created.`,
      url: `${REPO_BASE}/domain-restriction.md`,
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
            isDesktop ? styles.backdropDesktop : styles.backdropSheet,
            { backgroundColor: colors.overlay },
          ]}
        >
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.card,
                isDesktop ? styles.cardDesktop : styles.cardSheet,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              {!isDesktop && (
                <View style={styles.handleContainer}>
                  <View
                    style={[styles.handle, { backgroundColor: colors.border }]}
                  />
                </View>
              )}

              <View
                style={[
                  styles.header,
                  { borderBottomColor: colors.borderSubtle },
                ]}
              >
                <Text style={[styles.title, { color: colors.textPrimary }]}>
                  How Horizon Works ?
                </Text>
                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.closeBtn,
                    { opacity: pressed ? 0.6 : 1 },
                  ]}
                  accessibilityLabel="Close"
                  accessibilityRole="button"
                >
                  <CloseIcon size={14} color={colors.textSecondary} />
                </Pressable>
              </View>

              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {sections.map(({ icon: Icon, title, body, url }, i) => (
                  <View
                    key={title}
                    style={[
                      styles.section,
                      i > 0 && styles.sectionDivider,
                      { borderTopColor: colors.borderSubtle },
                    ]}
                  >
                    <View style={styles.sectionHeading}>
                      <View
                        style={[
                          styles.sectionIcon,
                          {
                            backgroundColor: colors.surfaceSecondary,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <Icon
                          size={15}
                          color={colors.textPrimary}
                          strokeWidth={2}
                        />
                      </View>
                      <Text
                        style={[
                          styles.sectionTitle,
                          { color: colors.textPrimary },
                        ]}
                      >
                        {title}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.sectionBody,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {body}
                    </Text>
                    <Pressable
                      onPress={() => Linking.openURL(url)}
                      style={({ pressed }) => [
                        styles.learnMoreLink,
                        { opacity: pressed ? 0.6 : 1 },
                      ]}
                      accessibilityRole="link"
                      accessibilityLabel={`Learn more about ${title}`}
                    >
                      <Text
                        style={[styles.learnMoreText, { color: colors.primary }]}
                      >
                        Learn more
                      </Text>
                      <ArrowUpRight size={13} color={colors.primary} strokeWidth={2} />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  backdropDesktop: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  backdropSheet: {
    justifyContent: "flex-end",
  },
  card: {
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  cardDesktop: {
    width: "100%",
    maxWidth: 560,
    maxHeight: "82%",
    borderRadius: 20,
    padding: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  cardSheet: {
    width: "100%",
    maxHeight: "86%",
    borderBottomWidth: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "web" ? 20 : 28,
    shadowOffset: { width: 0, height: -4 },
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 6,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  closeBtn: {
    padding: 4,
  },
  scroll: {
    marginTop: 4,
  },
  scrollContent: {
    paddingBottom: 4,
  },
  section: {
    paddingVertical: 16,
  },
  sectionDivider: {
    borderTopWidth: 1,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontFamily: typography.fonts.bodySemibold,
    fontSize: 14,
    fontWeight: "600",
  },
  sectionBody: {
    fontFamily: typography.fonts.body,
    fontSize: 13,
    lineHeight: 20,
  },
  learnMoreLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  learnMoreText: {
    fontFamily: typography.fonts.bodySemibold,
    fontSize: 13,
    fontWeight: "600",
  },
});
