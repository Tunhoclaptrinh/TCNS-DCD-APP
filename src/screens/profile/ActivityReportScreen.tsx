import React from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";
import { useTheme } from "@/src/hooks/useTheme";

const STATS = [
  { label: "Tổng ca trực", value: "42", sub: "ca", icon: "calendar", color: "#1976D2", bg: "#E3F2FD" },
  { label: "Ca vắng", value: "3", sub: "ca", icon: "close-circle", color: COLORS.ERROR, bg: "#FFEBEE" },
  { label: "Tiền phạt", value: "150.000", sub: "đ", icon: "cash", color: COLORS.WARNING, bg: "#FFF8E1" },
  { label: "Điểm RLN", value: "88", sub: "điểm", icon: "star", color: COLORS.SUCCESS, bg: "#E8F5E9" },
];

const MONTHLY_SUMMARY = [
  { month: "Tháng 4/2026", shifts: 10, absent: 0, fine: 0 },
  { month: "Tháng 3/2026", shifts: 12, absent: 1, fine: 50000 },
  { month: "Tháng 2/2026", shifts: 8, absent: 2, fine: 100000 },
  { month: "Tháng 1/2026", shifts: 12, absent: 0, fine: 0 },
];

const ActivityReportScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();

  const formatCurrency = (amount: number) =>
    amount === 0 ? "Không" : amount.toLocaleString("vi-VN") + " đ";

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {STATS.map((stat) => (
            <View
              key={stat.label}
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

        {/* Bar Chart placeholder */}
        <View style={[styles.chartCard, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}>
          <Text style={[styles.chartTitle, { color: colors.TEXT_PRIMARY }]}>Ca trực theo tháng</Text>
          <View style={styles.barChart}>
            {MONTHLY_SUMMARY.map((m, idx) => (
              <View key={idx} style={styles.barGroup}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      { height: m.shifts * 6, backgroundColor: m.absent > 0 ? COLORS.WARNING : COLORS.PRIMARY },
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, { color: colors.TEXT_SECONDARY }]}>
                  {m.month.replace("Tháng ", "T")}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Monthly Table */}
        <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>Chi tiết theo tháng</Text>
        <View style={[styles.tableCard, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}>
          <View style={[styles.tableHeader, { borderBottomColor: colors.BORDER }]}>
            <Text style={[styles.tableHead, { color: colors.TEXT_SECONDARY, flex: 2 }]}>Tháng</Text>
            <Text style={[styles.tableHead, { color: colors.TEXT_SECONDARY }]}>Ca trực</Text>
            <Text style={[styles.tableHead, { color: colors.TEXT_SECONDARY }]}>Vắng</Text>
            <Text style={[styles.tableHead, { color: colors.TEXT_SECONDARY }]}>Phạt</Text>
          </View>
          {MONTHLY_SUMMARY.map((m, idx) => (
            <View
              key={idx}
              style={[styles.tableRow, { borderBottomColor: colors.BORDER }, idx === MONTHLY_SUMMARY.length - 1 && { borderBottomWidth: 0 }]}
            >
              <Text style={[styles.tableCell, { color: colors.TEXT_PRIMARY, flex: 2 }]}>{m.month}</Text>
              <Text style={[styles.tableCell, { color: colors.TEXT_PRIMARY }]}>{m.shifts}</Text>
              <Text style={[styles.tableCell, { color: m.absent > 0 ? COLORS.ERROR : COLORS.SUCCESS }]}>{m.absent}</Text>
              <Text style={[styles.tableCell, { color: m.fine > 0 ? COLORS.WARNING : COLORS.SUCCESS }]}>
                {formatCurrency(m.fine)}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
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
