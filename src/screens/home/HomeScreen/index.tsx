import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";
import { useAuth } from "@/src/hooks/useAuth";
import { useTheme } from "@/src/hooks/useTheme";
import { ROUTE_NAMES } from "@/src/config/routes.config";
import { useTranslation } from "@/src/utils/i18n";

const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.CARD_BG}
      />

      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.CARD_BG, borderBottomColor: colors.BORDER },
        ]}
      >
        <View>
          <Text style={[styles.greeting, { color: colors.TEXT_SECONDARY }]}>
            {t("home.welcomeBack")}
          </Text>
          <Text style={[styles.headerTitle, { color: colors.TEXT_PRIMARY }]}>
            {user?.name || user?.fullName || "Guest"}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: colors.BORDER }]}
          onPress={() => navigation.navigate(ROUTE_NAMES.COMMON.NOTIFICATIONS)}
        >
          <Ionicons
            name="notifications-outline"
            size={24}
            color={colors.PRIMARY}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.PRIMARY]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.mainCard, { backgroundColor: colors.PRIMARY }]}>
          <View style={styles.cardHeader}>
             <Ionicons name="flag" size={32} color={COLORS.WHITE} />
             <Text style={[styles.cardTitle, { color: COLORS.WHITE }]}>
               Đội Cờ Đỏ PTIT
             </Text>
          </View>
          <Text
            style={[
              styles.cardText,
              {
                color: isDark
                  ? "rgba(255,255,255,0.8)"
                  : "rgba(255,255,255,0.9)",
              },
            ]}
          >
            Nền tảng quản lý nhân sự và điều hành hoạt động trực thuộc Học viện Công nghệ Bưu chính Viễn thông.
          </Text>
        </View>

        {/* Statistics Row - Synthetic from Web Dashboard */}
        <View style={styles.statsContainer}>
          <View style={[styles.statItem, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}>
            <Text style={[styles.statValue, { color: colors.PRIMARY }]}>156</Text>
            <Text style={[styles.statLabel, { color: colors.TEXT_SECONDARY }]}>Thành viên</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}>
            <Text style={[styles.statValue, { color: "#52c41a" }]}>12</Text>
            <Text style={[styles.statLabel, { color: colors.TEXT_SECONDARY }]}>Đang trực</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}>
            <Text style={[styles.statValue, { color: "#1890ff" }]}>5</Text>
            <Text style={[styles.statLabel, { color: colors.TEXT_SECONDARY }]}>Mới</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>
          {t("home.quickActions")}
        </Text>
        <View style={styles.actionsGrid}>
          {/* Lịch trực - Navigate to Duty Tab */}
          <TouchableOpacity
            style={[
              styles.actionItem,
              { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER },
            ]}
            onPress={() => navigation.navigate(ROUTE_NAMES.TABS.DUTY)}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: isDark ? "#1e3a5f" : "#E3F2FD" },
              ]}
            >
              <Ionicons
                name="calendar"
                size={24}
                color={isDark ? "#64B5F6" : "#1976D2"}
              />
            </View>
            <Text style={[styles.actionLabel, { color: colors.TEXT_PRIMARY }]}>
              Lịch trực
            </Text>
          </TouchableOpacity>

          {/* Đổi ca - Navigate to Duty Tab or specific screen */}
          <TouchableOpacity
            style={[
              styles.actionItem,
              { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER },
            ]}
            onPress={() => navigation.navigate(ROUTE_NAMES.TABS.DUTY)}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: isDark ? "#3e2818" : "#FFF3E0" },
              ]}
            >
              <Ionicons
                name="swap-horizontal"
                size={24}
                color={isDark ? "#FFB74D" : "#F57C00"}
              />
            </View>
            <Text style={[styles.actionLabel, { color: colors.TEXT_PRIMARY }]}>
              Đổi ca trực
            </Text>
          </TouchableOpacity>

          {/* Danh sách đội */}
          <TouchableOpacity
            style={[
              styles.actionItem,
              { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER },
            ]}
            onPress={() => navigation.navigate(ROUTE_NAMES.TABS.PROFILE)}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: isDark ? "#1b3321" : "#E8F5E9" },
              ]}
            >
              <Ionicons
                name="people-outline"
                size={24}
                color={isDark ? "#81C784" : "#388E3C"}
              />
            </View>
            <Text style={[styles.actionLabel, { color: colors.TEXT_PRIMARY }]}>
              Danh sách đội
            </Text>
          </TouchableOpacity>

          {/* Hỗ trợ */}
          <TouchableOpacity
            style={[
              styles.actionItem,
              { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER },
            ]}
            onPress={() => navigation.navigate("Support")}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: isDark ? "#331b1b" : "#FFEBEE" },
              ]}
            >
              <Ionicons
                name="help-circle-outline"
                size={24}
                color={isDark ? "#E57373" : "#D32F2F"}
              />
            </View>
            <Text style={[styles.actionLabel, { color: colors.TEXT_PRIMARY }]}>
              Hỗ trợ
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.WHITE,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  greeting: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.DARK,
  },
  iconBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    padding: 20,
  },
  mainCard: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.WHITE,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  statItem: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionItem: {
    width: "48%",
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.DARK,
  },
});

export default HomeScreen;
