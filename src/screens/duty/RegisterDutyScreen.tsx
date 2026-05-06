import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";
import { useTheme } from "@/src/hooks/useTheme";

const SHIFTS = [
  { id: "morning", label: "Ca sáng", time: "7:00 - 11:00" },
  { id: "afternoon", label: "Ca chiều", time: "13:00 - 17:00" },
  { id: "evening", label: "Ca tối", time: "18:00 - 22:00" },
];

const DAYS = [
  { id: "mon", label: "Thứ 2", date: "05/05" },
  { id: "tue", label: "Thứ 3", date: "06/05" },
  { id: "wed", label: "Thứ 4", date: "07/05" },
  { id: "thu", label: "Thứ 5", date: "08/05" },
  { id: "fri", label: "Thứ 6", date: "09/05" },
  { id: "sat", label: "Thứ 7", date: "10/05" },
  { id: "sun", label: "CN", date: "11/05" },
];

const RegisterDutyScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isLeader, setIsLeader] = useState(false);

  const toggleSlot = (dayId: string, shiftId: string) => {
    const key = `${dayId}-${shiftId}`;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const isSelected = (dayId: string, shiftId: string) =>
    selected.has(`${dayId}-${shiftId}`);

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: isDark ? "#1a2a3a" : "#EBF5FF" }]}>
          <Ionicons name="information-circle-outline" size={20} color="#1976D2" />
          <Text style={[styles.infoText, { color: isDark ? "#64B5F6" : "#1565C0" }]}>
            Bấm vào ô để chọn ca trực. Bấm lại để bỏ chọn. Sau khi gửi, chuyên viên sẽ xác nhận.
          </Text>
        </View>

        {/* Week Label */}
        <Text style={[styles.weekLabel, { color: colors.TEXT_PRIMARY }]}>Tuần 19/2026 (05/05 - 11/05)</Text>

        {/* Grid Table */}
        <View style={[styles.tableContainer, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}>
          {/* Header Row */}
          <View style={[styles.headerRow, { borderBottomColor: colors.BORDER }]}>
            <View style={[styles.shiftCol, { borderRightColor: colors.BORDER }]}>
              <Text style={[styles.headerText, { color: colors.TEXT_SECONDARY }]}>Ca / Ngày</Text>
            </View>
            {DAYS.map((day) => (
              <View key={day.id} style={[styles.dayCol, { borderRightColor: colors.BORDER }]}>
                <Text style={[styles.dayLabel, { color: colors.TEXT_PRIMARY }]}>{day.label}</Text>
                <Text style={[styles.dayDate, { color: colors.TEXT_SECONDARY }]}>{day.date}</Text>
              </View>
            ))}
          </View>

          {/* Shift Rows */}
          {SHIFTS.map((shift) => (
            <View key={shift.id} style={[styles.shiftRow, { borderBottomColor: colors.BORDER }]}>
              <View style={[styles.shiftCol, { borderRightColor: colors.BORDER }]}>
                <Text style={[styles.shiftLabel, { color: colors.TEXT_PRIMARY }]}>{shift.label}</Text>
                <Text style={[styles.shiftTime, { color: colors.TEXT_SECONDARY }]}>{shift.time}</Text>
              </View>
              {DAYS.map((day) => {
                const sel = isSelected(day.id, shift.id);
                return (
                  <TouchableOpacity
                    key={day.id}
                    style={[
                      styles.cell,
                      { borderRightColor: colors.BORDER },
                      sel && { backgroundColor: COLORS.PRIMARY },
                    ]}
                    onPress={() => toggleSlot(day.id, shift.id)}
                  >
                    {sel && <Ionicons name="checkmark" size={18} color={COLORS.WHITE} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Leader toggle */}
        <View style={[styles.leaderRow, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}>
          <View>
            <Text style={[styles.leaderTitle, { color: colors.TEXT_PRIMARY }]}>Đăng ký làm kíp trưởng</Text>
            <Text style={[styles.leaderDesc, { color: colors.TEXT_SECONDARY }]}>Kíp trưởng sẽ có quyền quản lý điểm danh</Text>
          </View>
          <Switch
            value={isLeader}
            onValueChange={setIsLeader}
            trackColor={{ false: colors.BORDER, true: COLORS.PRIMARY }}
            thumbColor={isLeader ? COLORS.WHITE : "#f4f3f4"}
          />
        </View>

        {/* Summary */}
        <View style={[styles.summaryBox, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}>
          <Text style={[styles.summaryTitle, { color: colors.TEXT_PRIMARY }]}>Đã chọn {selected.size} ca trực</Text>
          {Array.from(selected).map((key) => {
            const [dayId, shiftId] = key.split("-");
            const day = DAYS.find((d) => d.id === dayId);
            const shift = SHIFTS.find((s) => s.id === shiftId);
            return (
              <View key={key} style={styles.summaryItem}>
                <Ionicons name="time-outline" size={14} color={COLORS.PRIMARY} />
                <Text style={[styles.summaryItemText, { color: colors.TEXT_SECONDARY }]}>
                  {day?.label} {day?.date} - {shift?.label} ({shift?.time})
                </Text>
              </View>
            );
          })}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: selected.size > 0 ? COLORS.PRIMARY : colors.BORDER }]}
          disabled={selected.size === 0}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.submitBtnText, { color: selected.size > 0 ? COLORS.WHITE : colors.TEXT_SECONDARY }]}>
            Gửi đăng ký ({selected.size} ca)
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  infoCard: {
    flexDirection: "row", gap: 10, padding: 14,
    borderRadius: 12, marginBottom: 16, alignItems: "flex-start",
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 20 },
  weekLabel: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  tableContainer: {
    borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row", borderBottomWidth: 1,
  },
  shiftRow: {
    flexDirection: "row", borderBottomWidth: 1,
  },
  shiftCol: {
    width: 88, padding: 10, borderRightWidth: 1, justifyContent: "center",
  },
  headerText: { fontSize: 11, fontWeight: "600" },
  dayCol: {
    flex: 1, padding: 8, alignItems: "center", borderRightWidth: 1,
  },
  dayLabel: { fontSize: 11, fontWeight: "700" },
  dayDate: { fontSize: 10 },
  shiftLabel: { fontSize: 11, fontWeight: "700" },
  shiftTime: { fontSize: 10, marginTop: 2 },
  cell: {
    flex: 1, height: 52, alignItems: "center", justifyContent: "center",
    borderRightWidth: 1,
  },
  leaderRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 14,
  },
  leaderTitle: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  leaderDesc: { fontSize: 12 },
  summaryBox: {
    padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 16, gap: 8,
  },
  summaryTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  summaryItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  summaryItemText: { fontSize: 13 },
  submitBtn: {
    paddingVertical: 16, borderRadius: 14, alignItems: "center",
    shadowColor: COLORS.PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  submitBtnText: { fontSize: 16, fontWeight: "700" },
});

export default RegisterDutyScreen;
