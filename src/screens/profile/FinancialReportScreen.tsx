import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";
import { useTheme } from "@/src/hooks/useTheme";

type TransactionType = "fine" | "reward" | "bonus";

interface Transaction {
  id: number;
  title: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
}

const TRANSACTIONS: Transaction[] = [
  { id: 1, title: "Phạt vắng ca trực", description: "Ca sáng 15/03/2026 - không có lý do", amount: -50000, type: "fine", date: "15/03/2026" },
  { id: 2, title: "Thưởng hoàn thành xuất sắc", description: "Xếp loại A tháng 02/2026", amount: 100000, type: "reward", date: "28/02/2026" },
  { id: 3, title: "Phạt đi muộn", description: "Ca chiều 10/03/2026 - trễ 20 phút", amount: -30000, type: "fine", date: "10/03/2026" },
  { id: 4, title: "Cộng điểm hoàn thành nhiệm vụ", description: "Tổng kết HK1/2025-2026", amount: 200000, type: "bonus", date: "05/01/2026" },
  { id: 5, title: "Thưởng tháng 01", description: "Thành viên tiêu biểu tháng 01", amount: 150000, type: "reward", date: "31/01/2026" },
];

const TYPE_CONFIG: Record<TransactionType, { color: string; icon: string; bgKey: string }> = {
  fine: { color: COLORS.ERROR, icon: "remove-circle", bgKey: "#FFEBEE" },
  reward: { color: COLORS.SUCCESS, icon: "add-circle", bgKey: "#E8F5E9" },
  bonus: { color: "#1976D2", icon: "star", bgKey: "#E3F2FD" },
};

const FinancialReportScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const [filter, setFilter] = useState<"all" | TransactionType>("all");

  const totalReward = TRANSACTIONS.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  const totalFine = TRANSACTIONS.filter((t) => t.amount < 0).reduce((a, t) => a + t.amount, 0);
  const balance = totalReward + totalFine;

  const filtered = filter === "all" ? TRANSACTIONS : TRANSACTIONS.filter((t) => t.type === filter);

  const fmt = (n: number) =>
    (n >= 0 ? "+" : "") + n.toLocaleString("vi-VN") + " đ";

  const FILTERS: Array<{ key: "all" | TransactionType; label: string }> = [
    { key: "all", label: "Tất cả" },
    { key: "reward", label: "Thưởng" },
    { key: "fine", label: "Phạt" },
    { key: "bonus", label: "Cộng điểm" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: balance >= 0 ? COLORS.PRIMARY : COLORS.ERROR }]}>
          <Text style={styles.balanceLabel}>Số dư hiện tại</Text>
          <Text style={styles.balanceAmount}>{fmt(balance)}</Text>
          <View style={styles.balanceDetails}>
            <View style={styles.balanceItem}>
              <Ionicons name="arrow-up-circle" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.balanceDetailText}>Thưởng: +{totalReward.toLocaleString("vi-VN")} đ</Text>
            </View>
            <View style={styles.balanceItem}>
              <Ionicons name="arrow-down-circle" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.balanceDetailText}>Phạt: {totalFine.toLocaleString("vi-VN")} đ</Text>
            </View>
          </View>
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterPill,
                filter === f.key
                  ? { backgroundColor: COLORS.PRIMARY }
                  : { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER, borderWidth: 1 },
              ]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterText, { color: filter === f.key ? COLORS.WHITE : colors.TEXT_SECONDARY }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Transactions */}
        <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>
          Lịch sử giao dịch ({filtered.length})
        </Text>

        {filtered.map((tx) => {
          const cfg = TYPE_CONFIG[tx.type];
          return (
            <View
              key={tx.id}
              style={[styles.txCard, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}
            >
              <View style={[styles.txIcon, { backgroundColor: isDark ? "#2a2a2a" : cfg.bgKey }]}>
                <Ionicons name={cfg.icon as any} size={22} color={cfg.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.txTitle, { color: colors.TEXT_PRIMARY }]}>{tx.title}</Text>
                <Text style={[styles.txDesc, { color: colors.TEXT_SECONDARY }]}>{tx.description}</Text>
                <Text style={[styles.txDate, { color: colors.TEXT_SECONDARY }]}>{tx.date}</Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.amount >= 0 ? COLORS.SUCCESS : COLORS.ERROR }]}>
                {fmt(tx.amount)}
              </Text>
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  balanceCard: {
    borderRadius: 20, padding: 24, marginBottom: 16,
    shadowColor: COLORS.PRIMARY, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  balanceLabel: { color: "rgba(255,255,255,0.8)", fontSize: 14, marginBottom: 4 },
  balanceAmount: { color: COLORS.WHITE, fontSize: 32, fontWeight: "800", marginBottom: 16 },
  balanceDetails: { flexDirection: "row", gap: 20 },
  balanceItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  balanceDetailText: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
  filterScroll: { marginBottom: 16 },
  filterPill: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    marginRight: 8,
  },
  filterText: { fontSize: 13, fontWeight: "600" },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 12 },
  txCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  txIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  txTitle: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  txDesc: { fontSize: 12, lineHeight: 18, marginBottom: 2 },
  txDate: { fontSize: 11 },
  txAmount: { fontSize: 15, fontWeight: "800" },
});

export default FinancialReportScreen;
