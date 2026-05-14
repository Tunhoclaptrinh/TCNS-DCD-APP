import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";
import { useTheme } from "@/src/hooks/useTheme";
import { useAuth } from "@/src/hooks/useAuth";
import { DutyService, DutySlot, DutyShift } from "@/src/services/duty.service";
import { ROUTE_NAMES } from "@/src/config/routes.config";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAY_LABELS: Record<number, string> = { 0: "CN", 1: "T2", 2: "T3", 3: "T4", 4: "T5", 5: "T6", 6: "T7" };

const formatDate = (isoStr: string) => {
  const d = new Date(isoStr.substring(0, 10));
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
};

const getDayLabel = (isoStr: string) => {
  const d = new Date(isoStr.substring(0, 10));
  return DAY_LABELS[d.getDay()] ?? "";
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShiftGroup {
  shift: DutyShift;
  slots: DutySlot[];
}

// ─── Component ───────────────────────────────────────────────────────────────

const RegisterDutyScreen = ({ navigation, route }: any) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();

  const initWeekStart = route?.params?.weekStart ?? DutyService.getWeekStartDate();
  const [weekStart, setWeekStart] = useState(initWeekStart);
  const [weekEnd, setWeekEnd] = useState("");
  const [weekDays, setWeekDays] = useState(DutyService.getWeekDays(initWeekStart));

  const [shiftGroups, setShiftGroups] = useState<ShiftGroup[]>([]);
  const [allSlots, setAllSlots] = useState<DutySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState<number | null>(null); // slotId đang xử lý

  const myUserId: number | undefined = user?.id !== undefined ? Number(user.id) : undefined;
  const userRole = (user as any)?.role;
  const isAdmin = true; // Bỏ phân quyền: userRole === "admin" || userRole === "staff";

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (ws: string, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const result = await DutyService.getWeeklySchedule(ws, myUserId);
      setWeekEnd(result.weekEnd);
      const slots: DutySlot[] = result.data?.slots ?? [];
      const shifts: DutyShift[] = result.data?.templates ?? [];
      setAllSlots(slots);

      // Group slots theo shift — dùng kipId để tránh trùng lặp khi 1 ngày có nhiều ca
      const grouped: ShiftGroup[] = shifts.map((shift) => ({
        shift,
        slots: slots.filter((s) => {
          // Ưu tiên 1: khớp shiftId trực tiếp
          if (s.shiftId !== undefined && s.shiftId !== null) {
            return Number(s.shiftId) === Number(shift.id);
          }
          // Ưu tiên 2: kiểm tra slot.kipId có thuộc shift.kips không
          if (shift.kips && shift.kips.length > 0) {
            return shift.kips.some((k) => Number(k.id) === Number(s.kipId));
          }
          // Fallback: match theo ngày (chỉ dùng khi không có kips data)
          return s.shiftDate?.substring(0, 10) === shift.date?.substring(0, 10);
        }).sort((a, b) => {
          const timeA = a.startTime || "24:00";
          const timeB = b.startTime || "24:00";
          return timeA.localeCompare(timeB);
        }),
      })).filter((g) => g.slots.length > 0)
      .sort((a, b) => {
        const dateA = (a.shift.date || "9999-12-31").substring(0, 10);
        const dateB = (b.shift.date || "9999-12-31").substring(0, 10);
        return dateA.localeCompare(dateB);
      });

      setShiftGroups(grouped);
    } catch (err: any) {
      console.error("[RegisterDuty]", err);
      setError(err?.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [myUserId]);

  useEffect(() => {
    fetchData(weekStart);
  }, [weekStart, fetchData]);

  // ── Week nav ───────────────────────────────────────────────────────────────
  const changeWeek = (delta: number) => {
    const [y, m, d] = weekStart.split("-").map(Number);
    const current = new Date(y, m - 1, d);
    current.setDate(current.getDate() + delta * 7);
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, "0");
    const dd = String(current.getDate()).padStart(2, "0");
    const newWS = `${yyyy}-${mm}-${dd}`;
    setWeekStart(newWS);
    setWeekDays(DutyService.getWeekDays(newWS));
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleRegister = async (slot: DutySlot) => {
    Alert.alert(
      "Xác nhận đăng ký",
      `Đăng ký kíp:\n${slot.shiftLabel}\n${getDayLabel(slot.shiftDate)} ${formatDate(slot.shiftDate)} · ${slot.startTime ?? ""} - ${slot.endTime ?? ""}`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng ký",
          onPress: async () => {
            setRegistering(slot.id);
            try {
              await DutyService.registerToSlot(slot.id);
              Alert.alert("✅ Thành công", "Đã đăng ký ca trực!");
              fetchData(weekStart, true);
            } catch (e: any) {
              Alert.alert("Lỗi", e?.response?.data?.message ?? e?.message ?? "Đăng ký thất bại");
            } finally {
              setRegistering(null);
            }
          },
        },
      ]
    );
  };

  const handleCancel = async (slot: DutySlot) => {
    Alert.alert(
      "Hủy đăng ký",
      `Bạn muốn hủy đăng ký kíp:\n${slot.shiftLabel}\n${getDayLabel(slot.shiftDate)} ${formatDate(slot.shiftDate)}?`,
      [
        { text: "Không", style: "cancel" },
        {
          text: "Hủy đăng ký",
          style: "destructive",
          onPress: async () => {
            setRegistering(slot.id);
            try {
              await DutyService.cancelRegistration(slot.id);
              Alert.alert("✅ Thành công", "Đã hủy đăng ký ca trực.");
              fetchData(weekStart, true);
            } catch (e: any) {
              Alert.alert("Lỗi", e?.response?.data?.message ?? e?.message ?? "Hủy đăng ký thất bại");
            } finally {
              setRegistering(null);
            }
          },
        },
      ]
    );
  };

  // ── Slot item helpers ──────────────────────────────────────────────────────
  const isMySlot = (slot: DutySlot) =>
    myUserId !== undefined && (slot.assignedUserIds ?? []).includes(myUserId);

  const isFull = (slot: DutySlot) =>
    (slot.assignedUserIds ?? []).length >= slot.capacity;

  const getSlotStatus = (slot: DutySlot) => {
    if (isMySlot(slot)) return "registered";
    if (slot.status === "locked") return "locked";
    if (isFull(slot)) return "full";
    return "open";
  };

  const STATUS_CONFIG = {
    registered: { label: "Đã đăng ký", color: COLORS.SUCCESS, bg: isDark ? "#1a3a1a" : "#E8F5E9", icon: "checkmark-circle" as const },
    locked: { label: "Đã khóa", color: COLORS.GRAY, bg: isDark ? "#2a2a2a" : "#F5F5F5", icon: "lock-closed" as const },
    full: { label: "Đã đầy", color: COLORS.WARNING, bg: isDark ? "#3a2a1a" : "#FFF3E0", icon: "people" as const },
    open: { label: "Còn chỗ", color: "#1976D2", bg: isDark ? "#1a2a3a" : "#E3F2FD", icon: "add-circle" as const },
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const formatWeekLabel = () => {
    if (!weekEnd) return weekStart;
    const s = new Date(weekStart).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    const e = new Date(weekEnd).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    return `${s} - ${e}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      {/* ── Week Header ── */}
      <View style={[styles.weekHeader, { backgroundColor: colors.CARD_BG, borderBottomColor: colors.BORDER }]}>
        <View style={styles.weekRow}>
          <TouchableOpacity style={[styles.navBtn, { backgroundColor: colors.BORDER }]} onPress={() => changeWeek(-1)}>
            <Ionicons name="chevron-back" size={18} color={colors.TEXT_PRIMARY} />
          </TouchableOpacity>
          <View style={styles.weekInfo}>
            <Text style={[styles.weekTitle, { color: colors.TEXT_PRIMARY }]}>{formatWeekLabel()}</Text>
            <Text style={[styles.weekSub, { color: colors.TEXT_SECONDARY }]}>
              {allSlots.filter((s) => isMySlot(s)).length} ca đã đăng ký · {allSlots.length} ca tổng
            </Text>
          </View>
          <TouchableOpacity style={[styles.navBtn, { backgroundColor: colors.BORDER }]} onPress={() => changeWeek(1)}>
            <Ionicons name="chevron-forward" size={18} color={colors.TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>

        {/* Day chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayRow}>
          {weekDays.map((day, i) => {
            const hasMySlot = allSlots.some((s) => {
              const slotDate = s.shiftDate?.substring(0, 10);
              const dayDate = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, "0")}-${String(day.date.getDate()).padStart(2, "0")}`;
              return slotDate === dayDate && isMySlot(s);
            });
            return (
              <View key={i} style={styles.dayChip}>
                <Text style={[styles.dayLabel, { color: colors.TEXT_SECONDARY }]}>{day.label}</Text>
                <Text style={[styles.dayDate, { color: colors.TEXT_PRIMARY }]}>{day.dateStr}</Text>
                {hasMySlot && <View style={[styles.dot, { backgroundColor: COLORS.SUCCESS }]} />}
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={[styles.hint, { color: colors.TEXT_SECONDARY }]}>Đang tải lịch trực...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={56} color={colors.BORDER} />
          <Text style={[styles.errorText, { color: COLORS.ERROR }]}>{error}</Text>
          <TouchableOpacity style={[styles.retryBtn, { backgroundColor: COLORS.PRIMARY }]} onPress={() => fetchData(weekStart)}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(weekStart, true)} colors={[COLORS.PRIMARY]} tintColor={COLORS.PRIMARY} />
          }
        >
          {/* Info banner */}
          <View style={[styles.infoBanner, { backgroundColor: isDark ? "#1a2a3a" : "#EBF5FF" }]}>
            <Ionicons name="information-circle-outline" size={18} color="#1976D2" />
            <Text style={[styles.infoText, { color: isDark ? "#64B5F6" : "#1565C0" }]}>
              Chọn kíp trực muốn đăng ký. Mỗi kíp hiển thị số chỗ còn lại.
            </Text>
          </View>

          {shiftGroups.length === 0 && (
            <View style={styles.emptyBox}>
              <Ionicons name="calendar-outline" size={56} color={colors.BORDER} />
              <Text style={[styles.emptyText, { color: colors.TEXT_SECONDARY }]}>Không có ca trực nào trong tuần này</Text>
            </View>
          )}

          {shiftGroups.map(({ shift, slots }) => (
            <View key={shift.id} style={styles.shiftBlock}>
              {/* Shift Header */}
              <View style={[styles.shiftHeader, { backgroundColor: COLORS.PRIMARY }]}>
                <View style={styles.shiftHeaderLeft}>
                  <Text style={styles.shiftName}>
                    {shift.name?.toLowerCase().startsWith("ca ") ? shift.name : `Ca ${shift.name}`}
                  </Text>
                  <Text style={styles.shiftTime}>
                    {getDayLabel(shift.date)} {formatDate(shift.date)}
                    {shift.startTime ? ` · ${shift.startTime} - ${shift.endTime}` : ""}
                  </Text>
                </View>
                {isAdmin && (
                  <TouchableOpacity
                    style={styles.editShiftBtn}
                    onPress={() => navigation.navigate(ROUTE_NAMES.DUTY.EDIT_SHIFT_KIP, {
                      shiftId: shift.id,
                      weekStart,
                    })}
                  >
                    <Ionicons name="information-circle-outline" size={18} color={COLORS.WHITE} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Kips/Slots */}
              {slots.map((slot) => {
                const status = getSlotStatus(slot);
                const cfg = STATUS_CONFIG[status];
                const isProcessing = registering === slot.id;
                const assigned = slot.assignedUserIds?.length ?? 0;

                return (
                  <View
                    key={slot.id}
                    style={[styles.slotRow, { backgroundColor: colors.CARD_BG, borderColor: isMySlot(slot) ? COLORS.PRIMARY : colors.BORDER }]}
                  >
                    {/* Kip info */}
                    <View style={styles.slotInfo}>
                      <View style={styles.slotTitleRow}>
                        <Text style={[styles.slotName, { color: colors.TEXT_PRIMARY }]} numberOfLines={1}>
                          {slot.shiftLabel}
                        </Text>

                      </View>

                      <View style={styles.slotMeta}>
                        {slot.startTime && (
                          <View style={styles.metaChip}>
                            <Ionicons name="time-outline" size={12} color={colors.TEXT_SECONDARY} />
                            <Text style={[styles.metaText, { color: colors.TEXT_SECONDARY }]}>
                              {slot.startTime} - {slot.endTime}
                            </Text>
                          </View>
                        )}
                        <View style={styles.metaChip}>
                          <Ionicons name="people-outline" size={12} color={colors.TEXT_SECONDARY} />
                          <Text style={[styles.metaText, { color: colors.TEXT_SECONDARY }]}>
                            {assigned}/{slot.capacity}
                          </Text>
                        </View>
                      </View>

                      {/* Capacity bar */}
                      <View style={[styles.capacityBar, { backgroundColor: colors.BORDER }]}>
                        <View
                          style={[
                            styles.capacityFill,
                            {
                              width: `${Math.min((assigned / slot.capacity) * 100, 100)}%` as any,
                              backgroundColor: assigned >= slot.capacity ? COLORS.ERROR : COLORS.PRIMARY,
                            },
                          ]}
                        />
                      </View>
                    </View>

                    {/* Status badge + action button */}
                    <View style={styles.slotAction}>
                      <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                        <Ionicons name={cfg.icon} size={12} color={cfg.color} />
                        <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                      </View>

                      {isProcessing ? (
                        <ActivityIndicator size="small" color={COLORS.PRIMARY} style={{ marginTop: 8 }} />
                      ) : status === "registered" ? (
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: isDark ? "#3a1a1a" : "#FFEBEE", borderColor: COLORS.ERROR }]}
                          onPress={() => handleCancel(slot)}
                        >
                          <Ionicons name="close" size={14} color={COLORS.ERROR} />
                          <Text style={[styles.actionBtnText, { color: COLORS.ERROR }]}>Hủy</Text>
                        </TouchableOpacity>
                      ) : status === "open" ? (
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: COLORS.PRIMARY }]}
                          onPress={() => handleRegister(slot)}
                        >
                          <Ionicons name="add" size={14} color={COLORS.WHITE} />
                          <Text style={[styles.actionBtnText, { color: COLORS.WHITE }]}>Đăng ký</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          ))}

          <View style={{ height: 60 }} />
        </ScrollView>
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  hint: { fontSize: 14 },
  errorText: { fontSize: 14, textAlign: "center" },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryText: { color: COLORS.WHITE, fontWeight: "700" },

  // Week Header
  weekHeader: { borderBottomWidth: 1 },
  weekRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  navBtn: { width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center" },
  weekInfo: { flex: 1, alignItems: "center" },
  weekTitle: { fontSize: 16, fontWeight: "700" },
  weekSub: { fontSize: 12, marginTop: 2 },
  dayRow: { flexDirection: "row", paddingHorizontal: 16, paddingBottom: 10, gap: 12 },
  dayChip: { alignItems: "center", gap: 2 },
  dayLabel: { fontSize: 11, fontWeight: "600" },
  dayDate: { fontSize: 12, fontWeight: "700" },
  dot: { width: 5, height: 5, borderRadius: 2.5 },

  // Content
  content: { padding: 16 },
  infoBanner: {
    flexDirection: "row", gap: 10, padding: 12, borderRadius: 12,
    marginBottom: 16, alignItems: "flex-start",
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 20 },
  emptyBox: { alignItems: "center", marginTop: 60, gap: 12 },
  emptyText: { fontSize: 15 },

  // Shift block
  shiftBlock: { marginBottom: 20 },
  shiftHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14,
    marginBottom: 8,
  },
  shiftHeaderLeft: { flex: 1 },
  shiftName: { color: COLORS.WHITE, fontSize: 15, fontWeight: "800" },
  shiftTime: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 2 },
  editShiftBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
  },

  // Slot row
  slotRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 14, borderWidth: 1.5,
    marginBottom: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  slotInfo: { flex: 1 },
  slotTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  slotName: { fontSize: 14, fontWeight: "700", flex: 1 },
  editKipBtn: {
    width: 24, height: 24, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
  },
  slotMeta: { flexDirection: "row", gap: 10, marginBottom: 8 },
  metaChip: { flexDirection: "row", alignItems: "center", gap: 3 },
  metaText: { fontSize: 12 },
  capacityBar: { height: 4, borderRadius: 2, overflow: "hidden" },
  capacityFill: { height: 4, borderRadius: 2 },

  // Action
  slotAction: { alignItems: "center", gap: 8, minWidth: 80 },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  statusText: { fontSize: 11, fontWeight: "600" },
  actionBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
    borderWidth: 1, borderColor: "transparent",
  },
  actionBtnText: { fontSize: 13, fontWeight: "700" },
});

export default RegisterDutyScreen;
