import React, { useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";
import { useTheme } from "@/src/hooks/useTheme";
import { useAppDispatch, useAppSelector } from "@/src/store";
import { fetchOverview } from "@/src/store/slices/reportSlice";

const ActivityReportScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const dispatch = useAppDispatch();
  const { overview, loading, error } = useAppSelector(state => state.report);

  useEffect(() => {
    dispatch(fetchOverview());
  }, [dispatch]);

  const onRefresh = () => {
    dispatch(fetchOverview());
  };

  const formatCurrency = (amount: number) =>
    amount === 0 ? "0" : amount.toLocaleString("vi-VN") + " đ";

  if (loading && !overview) {
    return (
      <View style={[styles.container, styles.centerBox, { backgroundColor: colors.BACKGROUND }]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerBox, { backgroundColor: colors.BACKGROUND }]}>
        <Text style={{ color: COLORS.ERROR }}>Lỗi tải báo cáo: {error}</Text>
        <TouchableOpacity style={{ marginTop: 16 }} onPress={() => dispatch(fetchOverview())}>
          <Text style={{ color: COLORS.PRIMARY }}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Map BE data to Stats
  const stats = [
    { label: "Tổng số User", value: overview?.users?.totalUsers || 0, sub: "người", icon: "people", color: "#1976D2", bg: "#E3F2FD" },
    { label: "Đang hoạt động", value: overview?.users?.activeUsers || 0, sub: "người", icon: "checkmark-circle", color: COLORS.SUCCESS, bg: "#E8F5E9" },
    { label: "Tổng ca trực", value: overview?.duty?.totalSlots || 0, sub: "ca", icon: "calendar", color: COLORS.PRIMARY, bg: "#FFEBEE" },
    { label: "Tỉ lệ phủ", value: overview?.duty?.coverageRate || 0, sub: "%", icon: "pie-chart", color: COLORS.WARNING, bg: "#FFF8E1" },
    { label: "Yêu cầu đổi ca", value: overview?.duty?.pendingSwapRequests || 0, sub: "yêu cầu", icon: "swap-horizontal", color: "#8E24AA", bg: "#F3E5F5" },
    { label: "Chưa đọc TB", value: overview?.notifications?.unreadNotifications || 0, sub: "thông báo", icon: "notifications", color: "#F57C00", bg: "#FFF3E0" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} colors={[COLORS.PRIMARY]} />}
      >
        <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY, marginTop: 0 }]}>
          Báo cáo tổng quan
        </Text>
        
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, idx) => (
            <View
              key={idx}
              style={[styles.statCard, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}
            >
              <View style={[styles.statIconBox, { backgroundColor: isDark ? "#2a2a2a" : stat.bg }]}>
                <Ionicons name={stat.icon as any} size={22} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: colors.TEXT_PRIMARY }]}>
                {stat.value}
                <Text style={[styles.statSub, { color: colors.TEXT_SECONDARY }]}> {stat.sub}</Text>
              </Text>
              <Text style={[styles.statLabel, { color: colors.TEXT_SECONDARY }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Finance Block */}
        <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>Thu chi thưởng phạt</Text>
        <View style={[styles.tableCard, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}>
          <View style={[styles.tableRow, { borderBottomColor: colors.BORDER }]}>
            <Text style={[styles.tableCell, { color: colors.TEXT_PRIMARY, flex: 2, fontWeight: "600" }]}>Tổng thu (thưởng)</Text>
            <Text style={[styles.tableCell, { color: COLORS.SUCCESS, fontWeight: "600" }]}>+{formatCurrency(overview?.finance?.totalReward || 0)}</Text>
          </View>
          <View style={[styles.tableRow, { borderBottomColor: colors.BORDER }]}>
            <Text style={[styles.tableCell, { color: colors.TEXT_PRIMARY, flex: 2, fontWeight: "600" }]}>Tổng chi (phạt)</Text>
            <Text style={[styles.tableCell, { color: COLORS.ERROR, fontWeight: "600" }]}>-{formatCurrency(overview?.finance?.totalPenalty || 0)}</Text>
          </View>
          <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.tableCell, { color: colors.TEXT_PRIMARY, flex: 2, fontWeight: "700" }]}>Số dư</Text>
            <Text style={[styles.tableCell, { color: COLORS.PRIMARY, fontWeight: "700" }]}>{formatCurrency(overview?.finance?.netBalance || 0)}</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerBox: { justifyContent: "center", alignItems: "center" },
  content: { padding: 16 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 },
  statCard: {
    width: "47%", padding: 16, borderRadius: 16, borderWidth: 1,
    alignItems: "center", gap: 6,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  statIconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "800" },
  statSub: { fontSize: 13, fontWeight: "400" },
  statLabel: { fontSize: 12, fontWeight: "600", textAlign: "center" },
  chartCard: {
    borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 20,
  },
  chartTitle: { fontSize: 15, fontWeight: "700", marginBottom: 16 },
  barChart: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around", height: 100 },
  barGroup: { alignItems: "center", gap: 6 },
  barWrapper: { height: 80, justifyContent: "flex-end" },
  bar: { width: 36, borderRadius: 8, minHeight: 8 },
  barLabel: { fontSize: 11, fontWeight: "600" },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 12 },
  tableCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  tableHeader: { flexDirection: "row", padding: 12, borderBottomWidth: 1 },
  tableHead: { flex: 1, fontSize: 12, fontWeight: "700", textAlign: "center" },
  tableRow: { flexDirection: "row", padding: 12, borderBottomWidth: 1 },
  tableCell: { flex: 1, fontSize: 13, textAlign: "center" },
});

export default ActivityReportScreen;
