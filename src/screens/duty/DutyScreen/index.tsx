import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";
import { useTheme } from "@/src/hooks/useTheme";

// --- Mock Data ---
const DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const MOCK_DATES = ["05/05", "06/05", "07/05", "08/05", "09/05", "10/05", "11/05"];

const MOCK_SLOTS = [
  {
    id: 1,
    shift: "Ca sáng (7:00 - 11:00)",
    date: "07/05",
    dayLabel: "T4",
    members: ["Nguyễn Văn A", "Trần Thị B"],
    isMyShift: true,
    status: "upcoming", // upcoming | checked-in | absent
    startTime: "07:00",
  },
  {
    id: 2,
    shift: "Ca chiều (13:00 - 17:00)",
    date: "07/05",
    dayLabel: "T4",
    members: ["Lê Văn C", "Phạm Thị D"],
    isMyShift: false,
    status: "upcoming",
    startTime: "13:00",
  },
  {
    id: 3,
    shift: "Ca sáng (7:00 - 11:00)",
    date: "08/05",
    dayLabel: "T5",
    members: ["Nguyễn Văn A"],
    isMyShift: true,
    status: "checked-in",
    startTime: "07:00",
  },
  {
    id: 4,
    shift: "Ca tối (18:00 - 22:00)",
    date: "09/05",
    dayLabel: "T6",
    members: ["Trần Thị B", "Lê Văn C", "Hoàng Văn E"],
    isMyShift: false,
    status: "upcoming",
    startTime: "18:00",
  },
];

const MOCK_MANAGEMENT_MEMBERS = [
  { id: 1, name: "Nguyễn Văn A", studentId: "B21DCDT001", checkedIn: true },
  { id: 2, name: "Trần Thị B", studentId: "B21DCDT002", checkedIn: false },
  { id: 3, name: "Lê Văn C", studentId: "B21DCDT003", checkedIn: false },
];

const DutyScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const [selectedDay, setSelectedDay] = useState(2); // Index of today (T4)
  const [managementModalVisible, setManagementModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  // Giả lập: người dùng hiện tại là kíp trưởng và đã self check-in
  const IS_LEADER = true;
  const IS_SELF_CHECKED_IN = true;

  // Kiểm tra cửa sổ 2 phút để hiện nút Self Check-in
  const canSelfCheckIn = (startTime: string) => {
    // Mock: Ca 7:00 sáng 07/05 đang trong cửa sổ check-in
    // Trong thực tế sẽ so sánh với thời gian thực
    return startTime === "07:00";
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "checked-in":
        return { bg: isDark ? "#1a3a1a" : "#E8F5E9", color: COLORS.SUCCESS, label: "Đã điểm danh" };
      case "absent":
        return { bg: isDark ? "#3a1a1a" : "#FFEBEE", color: COLORS.ERROR, label: "Vắng mặt" };
      default:
        return { bg: isDark ? "#1a2a3a" : "#E3F2FD", color: "#1976D2", label: "Sắp tới" };
    }
  };

  const filteredSlots = selectedDay === -1
    ? MOCK_SLOTS
    : MOCK_SLOTS.filter((s) => s.dayLabel === DAYS[selectedDay]);

  const openManagementModal = (slot: any) => {
    setSelectedSlot(slot);
    setManagementModalVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      {/* Week Header */}
      <View style={[styles.weekHeader, { backgroundColor: colors.CARD_BG, borderBottomColor: colors.BORDER }]}>
        <View style={styles.weekTitleRow}>
          <Text style={[styles.weekTitle, { color: colors.TEXT_PRIMARY }]}>Tuần 19/2026</Text>
          <View style={styles.weekNav}>
            <TouchableOpacity style={[styles.navBtn, { backgroundColor: colors.BORDER }]}>
              <Ionicons name="chevron-back" size={18} color={colors.TEXT_PRIMARY} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.navBtn, { backgroundColor: colors.BORDER }]}>
              <Ionicons name="chevron-forward" size={18} color={colors.TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Day Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll}>
          <TouchableOpacity
            style={[styles.dayChip, selectedDay === -1 && { backgroundColor: COLORS.PRIMARY }]}
            onPress={() => setSelectedDay(-1)}
          >
            <Text style={[styles.dayChipText, selectedDay === -1 && { color: COLORS.WHITE }]}>Tất cả</Text>
          </TouchableOpacity>
          {DAYS.map((day, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.dayChip, selectedDay === idx && { backgroundColor: COLORS.PRIMARY }]}
              onPress={() => setSelectedDay(idx)}
            >
              <Text style={[styles.dayChipText, { color: selectedDay === idx ? COLORS.WHITE : colors.TEXT_SECONDARY }]}>{day}</Text>
              <Text style={[styles.dayDate, { color: selectedDay === idx ? "rgba(255,255,255,0.8)" : colors.TEXT_SECONDARY }]}>
                {MOCK_DATES[idx]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Register Button */}
      <TouchableOpacity
        style={[styles.registerBtn, { backgroundColor: COLORS.PRIMARY }]}
        onPress={() => navigation.navigate("RegisterDuty")}
      >
        <Ionicons name="add-circle-outline" size={20} color={COLORS.WHITE} />
        <Text style={styles.registerBtnText}>Đăng ký lịch trực</Text>
      </TouchableOpacity>

      {/* Slots List */}
      <ScrollView contentContainerStyle={styles.slotList}>
        {filteredSlots.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="calendar-outline" size={56} color={colors.BORDER} />
            <Text style={[styles.emptyText, { color: colors.TEXT_SECONDARY }]}>Không có ca trực nào</Text>
          </View>
        ) : (
          filteredSlots.map((slot) => {
            const { bg, color, label } = getStatusStyle(slot.status);
            const showSelfCheckIn = slot.isMyShift && slot.status === "upcoming" && canSelfCheckIn(slot.startTime);
            const showManagement = IS_LEADER && IS_SELF_CHECKED_IN && slot.isMyShift && slot.status === "upcoming";

            return (
              <View
                key={slot.id}
                style={[styles.slotCard, { backgroundColor: colors.CARD_BG, borderColor: slot.isMyShift ? COLORS.PRIMARY : colors.BORDER }]}
              >
                {/* Card Header */}
                <View style={styles.slotHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.slotShift, { color: colors.TEXT_PRIMARY }]}>{slot.shift}</Text>
                    <Text style={[styles.slotDate, { color: colors.TEXT_SECONDARY }]}>
                      {slot.dayLabel} - {slot.date}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: bg }]}>
                    <Text style={[styles.statusText, { color }]}>{label}</Text>
                  </View>
                </View>

                {/* My shift indicator */}
                {slot.isMyShift && (
                  <View style={styles.myShiftBadge}>
                    <Ionicons name="person" size={12} color={COLORS.PRIMARY} />
                    <Text style={[styles.myShiftText, { color: COLORS.PRIMARY }]}>Ca của bạn</Text>
                  </View>
                )}

                {/* Members */}
                <View style={[styles.membersRow, { borderTopColor: colors.BORDER }]}>
                  <Ionicons name="people-outline" size={16} color={colors.TEXT_SECONDARY} />
                  <Text style={[styles.membersText, { color: colors.TEXT_SECONDARY }]}>
                    {slot.members.join(" • ")}
                  </Text>
                </View>

                {/* Action Buttons */}
                {(showSelfCheckIn || showManagement) && (
                  <View style={styles.actionRow}>
                    {showSelfCheckIn && (
                      <TouchableOpacity style={[styles.checkInBtn, { backgroundColor: COLORS.PRIMARY }]}>
                        <Ionicons name="finger-print" size={16} color={COLORS.WHITE} />
                        <Text style={styles.checkInBtnText}>Điểm danh</Text>
                      </TouchableOpacity>
                    )}
                    {showManagement && (
                      <TouchableOpacity
                        style={[styles.managementBtn, { backgroundColor: COLORS.WARNING }]}
                        onPress={() => openManagementModal(slot)}
                      >
                        <Ionicons name="shield-checkmark" size={16} color={COLORS.WHITE} />
                        <Text style={styles.managementBtnText}>Quản lý kíp</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Management Modal */}
      <Modal
        visible={managementModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setManagementModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.CARD_BG }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.TEXT_PRIMARY }]}>Quản lý kíp</Text>
              <TouchableOpacity onPress={() => setManagementModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.TEXT_SECONDARY} />
              </TouchableOpacity>
            </View>
            {selectedSlot && (
              <Text style={[styles.modalSubtitle, { color: colors.TEXT_SECONDARY }]}>
                {selectedSlot.shift} • {selectedSlot.date}
              </Text>
            )}

            <FlatList
              data={MOCK_MANAGEMENT_MEMBERS}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={[styles.memberRow, { borderBottomColor: colors.BORDER }]}>
                  <View style={[styles.memberAvatar, { backgroundColor: isDark ? "#3a3a3a" : "#F5F5F5" }]}>
                    <Text style={[styles.memberAvatarText, { color: colors.TEXT_PRIMARY }]}>
                      {item.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.memberName, { color: colors.TEXT_PRIMARY }]}>{item.name}</Text>
                    <Text style={[styles.memberStudentId, { color: colors.TEXT_SECONDARY }]}>{item.studentId}</Text>
                  </View>
                  {item.checkedIn ? (
                    <View style={styles.checkedBadge}>
                      <Ionicons name="checkmark-circle" size={24} color={COLORS.SUCCESS} />
                    </View>
                  ) : (
                    <TouchableOpacity style={[styles.markBtn, { backgroundColor: COLORS.PRIMARY }]}>
                      <Text style={styles.markBtnText}>Điểm danh</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />

            <TouchableOpacity
              style={[styles.closeModalBtn, { backgroundColor: COLORS.PRIMARY }]}
              onPress={() => setManagementModalVisible(false)}
            >
              <Text style={styles.closeModalBtnText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  weekHeader: {
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  weekTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  weekTitle: { fontSize: 17, fontWeight: "700" },
  weekNav: { flexDirection: "row", gap: 8 },
  navBtn: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: "center", alignItems: "center",
  },
  dayScroll: { paddingHorizontal: 12 },
  dayChip: {
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "transparent",
  },
  dayChipText: { fontSize: 13, fontWeight: "700" },
  dayDate: { fontSize: 11, marginTop: 2 },
  registerBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, margin: 14, paddingVertical: 12, borderRadius: 14,
    shadowColor: COLORS.PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  registerBtnText: { color: COLORS.WHITE, fontSize: 15, fontWeight: "700" },
  slotList: { paddingHorizontal: 14, paddingTop: 4 },
  emptyBox: { alignItems: "center", marginTop: 60, gap: 12 },
  emptyText: { fontSize: 15 },
  slotCard: {
    borderRadius: 16, borderWidth: 1.5, marginBottom: 14,
    overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  slotHeader: {
    flexDirection: "row", alignItems: "flex-start",
    padding: 14, gap: 8,
  },
  slotShift: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  slotDate: { fontSize: 13 },
  statusBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start",
  },
  statusText: { fontSize: 12, fontWeight: "600" },
  myShiftBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 14, paddingBottom: 8,
  },
  myShiftText: { fontSize: 12, fontWeight: "600" },
  membersRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1,
  },
  membersText: { fontSize: 13, flex: 1 },
  actionRow: {
    flexDirection: "row", gap: 10, padding: 12, paddingTop: 8,
  },
  checkInBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 10, borderRadius: 12,
  },
  checkInBtnText: { color: COLORS.WHITE, fontSize: 14, fontWeight: "700" },
  managementBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 10, borderRadius: 12,
  },
  managementBtnText: { color: COLORS.WHITE, fontSize: 14, fontWeight: "700" },
  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 6,
  },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  modalSubtitle: { fontSize: 13, marginBottom: 16 },
  memberRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 12, borderBottomWidth: 1,
  },
  memberAvatar: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: "center", alignItems: "center",
  },
  memberAvatarText: { fontSize: 16, fontWeight: "700" },
  memberName: { fontSize: 15, fontWeight: "600" },
  memberStudentId: { fontSize: 12 },
  checkedBadge: {},
  markBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
  },
  markBtnText: { color: COLORS.WHITE, fontSize: 13, fontWeight: "700" },
  closeModalBtn: {
    marginTop: 16, paddingVertical: 14, borderRadius: 14, alignItems: "center",
  },
  closeModalBtnText: { color: COLORS.WHITE, fontSize: 15, fontWeight: "700" },
});

export default DutyScreen;
