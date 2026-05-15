import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";
import { useTheme } from "@/src/hooks/useTheme";
import { useAuth } from "@/src/hooks/useAuth";
import { DutyService, DutySlot, DutyUser, WeeklyScheduleResponse } from "@/src/services/duty.service";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

// ─── Component ───────────────────────────────────────────────────────────────

const DutyScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const myUserId = user?.id !== undefined ? Number(user.id) : undefined;

  // ── State ──────────────────────────────────────────────────────────────────
  const [weekStart, setWeekStart] = useState(() => DutyService.getWeekStartDate());
  const [weekDays, setWeekDays] = useState(DutyService.getWeekDays(DutyService.getWeekStartDate()));
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(-1);

  const [scheduleData, setScheduleData] = useState<WeeklyScheduleResponse | null>(null);
  const [weekEnd, setWeekEnd] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const tableScrollRef = useRef<ScrollView>(null);
  const [managementModalVisible, setManagementModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<DutySlot | null>(null);
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [pendingAttendance, setPendingAttendance] = useState<Set<number>>(new Set());

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const fetchSchedule = useCallback(async (ws: string, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const result = await DutyService.getWeeklySchedule(ws, myUserId);
      setScheduleData(result.data);
      setWeekEnd(result.weekEnd);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể tải lịch trực. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [myUserId]);

  useEffect(() => {
    fetchSchedule(weekStart);
  }, [weekStart, fetchSchedule]);

  // ── Week Navigation ────────────────────────────────────────────────────────
  const changeWeek = (delta: number) => {
    const [y, m, d] = weekStart.split("-").map(Number);
    const current = new Date(y, m - 1, d); // local time
    current.setDate(current.getDate() + delta * 7);
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, "0");
    const dd = String(current.getDate()).padStart(2, "0");
    const newWeekStart = `${yyyy}-${mm}-${dd}`;
    setWeekStart(newWeekStart);
    setWeekDays(DutyService.getWeekDays(newWeekStart));
    setSelectedDayIdx(-1);
  };

  // ── Derived Data ───────────────────────────────────────────────────────────
  const userRole = (user as any)?.role;
  const isLeaderOrAdmin = true; // Bỏ phân quyền: userRole === "admin" || userRole === "staff";

  const filteredSlots: DutySlot[] = (() => {
    if (!scheduleData?.slots) return [];

    // Debug: log tổng số slots nhận được
    console.log("[DutyScreen] Total slots from API:", scheduleData.slots.length);
    if (scheduleData.slots.length > 0) {
      console.log("[DutyScreen] First slot shiftDate:", scheduleData.slots[0].shiftDate);
    }

    let slots = [...scheduleData.slots];

    if (selectedDayIdx !== -1) {
      const targetDate = weekDays[selectedDayIdx]?.date;
      if (targetDate) {
        // So sánh theo local date (tránh lệch múi giờ +7)
        const targetStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}-${String(targetDate.getDate()).padStart(2, "0")}`;

        slots = slots.filter((s) => {
          // shiftDate có thể là ISO string "2026-05-07T00:00:00.000Z" hoặc "2026-05-07"
          // Lấy phần date (10 ký tự đầu) rồi so sánh
          const slotDateRaw = s.shiftDate?.toString() ?? "";
          const slotDateStr = slotDateRaw.substring(0, 10); // "YYYY-MM-DD"
          return slotDateStr === targetStr;
        });
      }
    } else {
      slots = slots.filter((s) => myUserId !== undefined && s.assignedUserIds.includes(myUserId));
    }

    return slots.sort((a, b) => {
      const dateA = (a.shiftDate?.toString() || "9999-12-31").substring(0, 10);
      const dateB = (b.shiftDate?.toString() || "9999-12-31").substring(0, 10);
      const timeA = a.startTime || "24:00";
      const timeB = b.startTime || "24:00";
      
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return timeA.localeCompare(timeB);
    });
  })();


  const isMySlot = (slot: DutySlot) =>
    myUserId !== undefined && slot.assignedUserIds.includes(myUserId);

  const isCheckedIn = (slot: DutySlot) =>
    myUserId !== undefined && slot.attendedUserIds.includes(myUserId);

  const canSelfCheckIn = (slot: DutySlot) =>
    isMySlot(slot) &&
    !isCheckedIn(slot) &&
    DutyService.isInCheckInWindow(slot.shiftDate, slot.startTime);

  const isLeaderOfSlot = (slot: DutySlot) =>
    myUserId !== undefined &&
    (slot.tempLeaderId === myUserId || isLeaderOrAdmin);

  const canManageSlot = (slot: DutySlot) =>
    isLeaderOfSlot(slot) && isMySlot(slot) && isCheckedIn(slot);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleSelfCheckIn = async (slot: DutySlot) => {
    Alert.alert(
      "Xác nhận điểm danh",
      `Bạn muốn tự điểm danh ca: ${slot.shiftLabel}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Điểm danh",
          onPress: async () => {
            try {
              await DutyService.selfCheckIn(slot.id);
              Alert.alert("✅ Thành công", "Điểm danh thành công!");
              fetchSchedule(weekStart);
            } catch (err: any) {
              Alert.alert("Lỗi", err?.response?.data?.message || "Điểm danh thất bại.");
            }
          },
        },
      ]
    );
  };

  const openManagementModal = (slot: DutySlot) => {
    setSelectedSlot(slot);
    // Pre-fill với người đã điểm danh
    setPendingAttendance(new Set(slot.attendedUserIds));
    setManagementModalVisible(true);
  };

  const toggleMemberAttendance = (userId: number) => {
    setPendingAttendance((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const saveAttendance = async () => {
    if (!selectedSlot) return;
    setMarkingAttendance(true);
    try {
      await DutyService.markAttendance(selectedSlot.id, Array.from(pendingAttendance));
      Alert.alert("✅ Thành công", "Đã lưu điểm danh!");
      setManagementModalVisible(false);
      fetchSchedule(weekStart);
    } catch (err: any) {
      Alert.alert("Lỗi", err?.response?.data?.message || "Lưu điểm danh thất bại.");
    } finally {
      setMarkingAttendance(false);
    }
  };

  // ── UI Helpers ─────────────────────────────────────────────────────────────
  const getStatusStyle = (slot: DutySlot) => {
    if (isCheckedIn(slot))
      return { bg: isDark ? "#1a3a1a" : "#E8F5E9", color: COLORS.SUCCESS, label: "Đã điểm danh" };
    if (slot.status === "locked")
      return { bg: isDark ? "#3a3a3a" : "#F5F5F5", color: COLORS.GRAY, label: "Đã khóa" };
    return { bg: isDark ? "#1a2a3a" : "#E3F2FD", color: "#1976D2", label: "Đang mở" };
  };

  const formatDate = (isoDate: string) => {
    const d = new Date(isoDate);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", timeZone: "UTC" });
  };

  const formatWeekLabel = () => {
    if (!weekEnd) return weekStart;
    const s = new Date(weekStart).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", timeZone: "UTC" });
    const e = new Date(weekEnd).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", timeZone: "UTC" });
    return `${s} - ${e}`;
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      {/* ── Week Header ── */}
      <View style={[styles.weekHeader, { backgroundColor: colors.CARD_BG, borderBottomColor: colors.BORDER }]}>
        <View style={styles.weekTitleRow}>
          <Text style={[styles.weekTitle, { color: colors.TEXT_PRIMARY }]}>{formatWeekLabel()}</Text>
          <View style={styles.weekNav}>
            <TouchableOpacity style={[styles.navBtn, { backgroundColor: colors.BORDER }]} onPress={() => changeWeek(-1)}>
              <Ionicons name="chevron-back" size={18} color={colors.TEXT_PRIMARY} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.navBtn, { backgroundColor: colors.BORDER }]} onPress={() => changeWeek(1)}>
              <Ionicons name="chevron-forward" size={18} color={colors.TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Day Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll}>
          <TouchableOpacity
            style={[
              styles.dayChip,
              styles.myChip,
              selectedDayIdx === -1 && { backgroundColor: COLORS.PRIMARY },
            ]}
            onPress={() => setSelectedDayIdx(-1)}
          >
            <Ionicons
              name="person"
              size={13}
              color={selectedDayIdx === -1 ? COLORS.WHITE : colors.TEXT_SECONDARY}
            />
            <Text style={[styles.dayChipText, { color: selectedDayIdx === -1 ? COLORS.WHITE : colors.TEXT_SECONDARY }]}>
              Của tôi
            </Text>
          </TouchableOpacity>
          {weekDays.map((day, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.dayChip, selectedDayIdx === idx && { backgroundColor: COLORS.PRIMARY }]}
              onPress={() => setSelectedDayIdx(idx)}
            >
              <Text style={[styles.dayChipText, { color: selectedDayIdx === idx ? COLORS.WHITE : colors.TEXT_SECONDARY }]}>
                {day.label}
              </Text>
              <Text style={[styles.dayDate, { color: selectedDayIdx === idx ? "rgba(255,255,255,0.8)" : colors.TEXT_SECONDARY }]}>
                {day.dateStr}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Register Button + View Toggle ── */}
      <View style={styles.topActionRow}>
        {isLeaderOrAdmin && (
          <TouchableOpacity
            style={[styles.registerBtn, { backgroundColor: COLORS.PRIMARY, flex: 1, margin: 0 }]}
            onPress={() => navigation.navigate("RegisterDuty")}
          >
            <Ionicons name="add-circle-outline" size={20} color={COLORS.WHITE} />
            <Text style={styles.registerBtnText}>Đăng ký lịch trực</Text>
          </TouchableOpacity>
        )}
        <View style={[styles.viewToggle, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === "card" && { backgroundColor: COLORS.PRIMARY }]}
            onPress={() => setViewMode("card")}
          >
            <Ionicons name="list" size={17} color={viewMode === "card" ? COLORS.WHITE : colors.TEXT_SECONDARY} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === "table" && { backgroundColor: COLORS.PRIMARY }]}
            onPress={() => setViewMode("table")}
          >
            <Ionicons name="grid" size={17} color={viewMode === "table" ? COLORS.WHITE : colors.TEXT_SECONDARY} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={[styles.loadingText, { color: colors.TEXT_SECONDARY }]}>Đang tải lịch trực...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={56} color={colors.BORDER} />
          <Text style={[styles.errorText, { color: COLORS.ERROR }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: COLORS.PRIMARY }]}
            onPress={() => fetchSchedule(weekStart)}
          >
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : viewMode === "table" ? (
        // ── TABLE VIEW ──
        (() => {
          const allSlots = scheduleData?.slots ?? [];
          // Collect unique shift labels (rows)
          const shiftKeys: string[] = [];
          allSlots.forEach((s) => {
            const key = `${s.shiftLabel}||${s.startTime}||${s.endTime}`;
            if (!shiftKeys.includes(key)) shiftKeys.push(key);
          });
          const SCREEN_W = Dimensions.get("window").width;
          const COL_W = SCREEN_W * 0.72;
          const ROW_H = 130;
          const HEAD_W = 100;
          return (
            <View style={{ flex: 1 }}>
              {/* Hint */}
              <View style={[styles.tableHint, { borderBottomColor: colors.BORDER }]}>
                <Ionicons name="swap-horizontal-outline" size={14} color={colors.TEXT_SECONDARY} />
                <Text style={[styles.tableHintText, { color: colors.TEXT_SECONDARY }]}>Vuốt ngang để xem các ngày tiếp theo</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                ref={tableScrollRef}
                style={{ flex: 1 }}
              >
                <View>
                  {/* Header row: empty + day columns */}
                  <View style={[styles.tableHeaderRow, { backgroundColor: colors.CARD_BG, borderBottomColor: colors.BORDER }]}>
                    <View style={[styles.tableCorner, { width: HEAD_W, borderRightColor: colors.BORDER }]}>
                      <Text style={[styles.tableCornerText, { color: colors.TEXT_SECONDARY }]}>Ca / Ngày</Text>
                    </View>
                    {weekDays.map((day, i) => (
                      <View key={i} style={[styles.tableColHeader, { width: COL_W, borderRightColor: colors.BORDER }]}>
                        <Text style={[styles.tableColDay, { color: COLORS.PRIMARY }]}>{day.label}</Text>
                        <Text style={[styles.tableColDate, { color: colors.TEXT_SECONDARY }]}>{day.dateStr}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Data rows */}
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                      <RefreshControl refreshing={refreshing} onRefresh={() => fetchSchedule(weekStart, true)} colors={[COLORS.PRIMARY]} tintColor={COLORS.PRIMARY} />
                    }
                  >
                    {shiftKeys.length === 0 ? (
                      <View style={[styles.emptyBox, { paddingTop: 40 }]}>
                        <Ionicons name="calendar-outline" size={48} color={colors.BORDER} />
                        <Text style={[styles.emptyText, { color: colors.TEXT_SECONDARY }]}>Không có ca trực trong tuần này</Text>
                      </View>
                    ) : (
                      shiftKeys.map((key, rowIdx) => {
                        const [shiftLabel, startTime, endTime] = key.split("||");
                        return (
                          <View key={key} style={[styles.tableRow, { borderBottomColor: colors.BORDER, backgroundColor: rowIdx % 2 === 0 ? (isDark ? "#1a1a2e" : "#FAFBFF") : colors.CARD_BG }]}>
                            {/* Row header */}
                            <View style={[styles.tableRowHeader, { width: HEAD_W, borderRightColor: colors.BORDER }]}>
                              <Text style={[styles.tableRowShift, { color: colors.TEXT_PRIMARY }]} numberOfLines={2}>
                                {(() => {
                                  const parts = shiftLabel.split(" - ");
                                  let name = parts[0].trim();
                                  if (!name.toLowerCase().startsWith("ca ")) name = `Ca ${name.toLowerCase()}`;
                                  return name;
                                })()}
                              </Text>
                              <Text style={[styles.tableRowTime, { color: colors.TEXT_SECONDARY }]}>
                                {startTime && endTime ? `${startTime}-${endTime}` : ""}
                              </Text>
                            </View>

                            {/* Day cells */}
                            {weekDays.map((day, colIdx) => {
                              const targetDate = day.date;
                              const targetStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}-${String(targetDate.getDate()).padStart(2, "0")}`;
                              const slot = allSlots.find((s) => {
                                const sd = (s.shiftDate?.toString() ?? "").substring(0, 10);
                                return sd === targetStr && s.shiftLabel === shiftLabel;
                              });

                              if (!slot) {
                                return (
                                  <View key={colIdx} style={[styles.tableCell, { width: COL_W, borderRightColor: colors.BORDER }]}>
                                    <Text style={[{ color: colors.TEXT_SECONDARY, fontSize: 12, textAlign: "center" }]}>—</Text>
                                  </View>
                                );
                              }

                              const isMine = myUserId !== undefined && slot.assignedUserIds.includes(myUserId);
                              const checkedIn = myUserId !== undefined && slot.attendedUserIds.includes(myUserId);
                              const isLocked = slot.status === "locked";
                              const fill = slot.assignedUserIds.length;
                              const cap = slot.capacity;
                              const pct = cap > 0 ? fill / cap : 0;
                              const barColor = pct >= 1 ? COLORS.SUCCESS : pct >= 0.5 ? COLORS.WARNING : COLORS.PRIMARY;

                              return (
                                <View
                                  key={colIdx}
                                  style={[
                                    styles.tableCell,
                                    {
                                      width: COL_W,
                                      borderRightColor: colors.BORDER,
                                      backgroundColor: isMine ? (isDark ? "#0d2240" : "#EBF3FF") : undefined,
                                      borderLeftWidth: isMine ? 3 : 0,
                                      borderLeftColor: isMine ? COLORS.PRIMARY : undefined,
                                    },
                                  ]}
                                >
                                  {/* Status badge */}
                                  <View style={[styles.tableCellBadge, { backgroundColor: isLocked ? (isDark ? "#3a3a3a" : "#F0F0F0") : checkedIn ? (isDark ? "#1a3a1a" : "#E8F5E9") : (isDark ? "#1a2a3a" : "#E3F2FD") }]}>
                                    <Text style={[styles.tableCellBadgeText, { color: isLocked ? COLORS.GRAY : checkedIn ? COLORS.SUCCESS : "#1976D2" }]}>
                                      {isLocked ? "Đã khóa" : checkedIn ? "✓ Đ.danh" : "Đang mở"}
                                    </Text>
                                  </View>

                                  {/* Capacity bar */}
                                  <View style={styles.tableCellCapRow}>
                                    <View style={[styles.tableCellBar, { backgroundColor: isDark ? "#2a2a2a" : "#E0E0E0" }]}>
                                      <View style={[styles.tableCellBarFill, { width: `${Math.min(pct, 1) * 100}%`, backgroundColor: barColor }]} />
                                    </View>
                                    <Text style={[styles.tableCellCapText, { color: colors.TEXT_SECONDARY }]}>{fill}/{cap}</Text>
                                  </View>

                                  {/* Assigned users list */}
                                  <ScrollView style={{ maxHeight: 60 }} showsVerticalScrollIndicator={false} nestedScrollEnabled>
                                    {slot.assignedUsers.length > 0 ? (
                                      slot.assignedUsers.map((u) => (
                                        <View key={u.id} style={styles.tableCellUser}>
                                          <View style={[styles.tableCellAvatar, { backgroundColor: u.id === myUserId ? COLORS.PRIMARY : (isDark ? "#3a3a3a" : "#E8EAF6") }]}>
                                            <Text style={[styles.tableCellAvatarText, { color: u.id === myUserId ? COLORS.WHITE : colors.TEXT_PRIMARY }]}>{u.name.charAt(0).toUpperCase()}</Text>
                                          </View>
                                          <Text style={[styles.tableCellUserName, { color: colors.TEXT_PRIMARY }]} numberOfLines={1}>{u.name}</Text>
                                          {slot.attendedUserIds.includes(u.id) && (
                                            <Ionicons name="checkmark-circle" size={13} color={COLORS.SUCCESS} />
                                          )}
                                        </View>
                                      ))
                                    ) : (
                                      <Text style={[{ color: colors.TEXT_SECONDARY, fontSize: 11, fontStyle: "italic" }]}>Chưa có ai đăng ký</Text>
                                    )}
                                  </ScrollView>

                                  {isMine && (
                                    <View style={styles.tableCellMine}>
                                      <Ionicons name="person" size={10} color={COLORS.PRIMARY} />
                                      <Text style={[styles.tableCellMineText, { color: COLORS.PRIMARY }]}>Ca của bạn</Text>
                                    </View>
                                  )}
                                </View>
                              );
                            })}
                          </View>
                        );
                      })
                    )}
                    <View style={{ height: 80 }} />
                  </ScrollView>
                </View>
              </ScrollView>
            </View>
          );
        })()
      ) : (
        <ScrollView
          contentContainerStyle={styles.slotList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchSchedule(weekStart, true)}
              colors={[COLORS.PRIMARY]}
              tintColor={COLORS.PRIMARY}
            />
          }
        >
          {/* My shifts stats */}
          {scheduleData?.userMetadata && (
            <View style={[styles.quotaCard, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}>
              <View style={styles.quotaItem}>
                <Text style={[styles.quotaValue, { color: COLORS.PRIMARY }]}>
                  {scheduleData.userMetadata.registeredKips}
                </Text>
                <Text style={[styles.quotaLabel, { color: colors.TEXT_SECONDARY }]}>Kíp đã đăng ký</Text>
              </View>
              <View style={[styles.quotaSep, { backgroundColor: colors.BORDER }]} />
              <View style={styles.quotaItem}>
                <Text style={[styles.quotaValue, { color: colors.TEXT_PRIMARY }]}>
                  {scheduleData.userMetadata.weeklyLimitEnabled ? scheduleData.userMetadata.weeklyQuota : "∞"}
                </Text>
                <Text style={[styles.quotaLabel, { color: colors.TEXT_SECONDARY }]}>
                  Hạn mức {scheduleData.userMetadata.weeklyLimitEnabled && scheduleData.userMetadata.registeredKips >= scheduleData.userMetadata.weeklyQuota
                    ? "🔴 Đã đầy"
                    : ""}
                </Text>
              </View>
            </View>
          )}

          {filteredSlots.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="calendar-outline" size={56} color={colors.BORDER} />
              <Text style={[styles.emptyText, { color: colors.TEXT_SECONDARY }]}>
                {selectedDayIdx === -1 
                  ? "Bạn không có ca trực nào trong tuần" 
                  : "Không có ca trực nào trong ngày này"}
              </Text>
            </View>
          ) : (
            filteredSlots.map((slot) => {
              const { bg, color, label } = getStatusStyle(slot);
              const mine = isMySlot(slot);
              const checkedIn = isCheckedIn(slot);
              const showCheckIn = canSelfCheckIn(slot);
              const showManagement = canManageSlot(slot);

              return (
                <View
                  key={slot.id}
                  style={[
                    styles.slotCard,
                    {
                      backgroundColor: colors.CARD_BG,
                      borderColor: mine ? COLORS.PRIMARY : colors.BORDER,
                    },
                  ]}
                >
                  {/* Card Header */}
                  <View style={styles.slotHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.slotShift, { color: colors.TEXT_PRIMARY }]}>
                        {(() => {
                          let label = slot.shiftLabel || "";
                          const parts = label.split(" - ");
                          if (parts.length > 0) {
                            let shiftName = parts[0].trim();
                            if (!shiftName.toLowerCase().startsWith("ca ")) {
                              shiftName = `Ca ${shiftName.toLowerCase()}`;
                            }
                            parts[0] = shiftName;
                            return parts.join(" - ");
                          }
                          return label;
                        })()}
                      </Text>
                      <Text style={[styles.slotTime, { color: colors.TEXT_SECONDARY }]}>
                        {slot.startTime && slot.endTime ? `${slot.startTime} - ${slot.endTime}` : ""}
                        {" · "}
                        {formatDate(slot.shiftDate)}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: bg }]}>
                      <Text style={[styles.statusText, { color }]}>{label}</Text>
                    </View>
                  </View>

                  {/* My shift badge */}
                  {mine && (
                    <View style={styles.myShiftBadge}>
                      <Ionicons name="person" size={12} color={COLORS.PRIMARY} />
                      <Text style={[styles.myShiftText, { color: COLORS.PRIMARY }]}>
                        Ca của bạn {checkedIn ? "· ✓ Đã điểm danh" : ""}
                      </Text>
                    </View>
                  )}

                  {/* Members */}
                  <View style={[styles.membersRow, { borderTopColor: colors.BORDER }]}>
                    <Ionicons name="people-outline" size={16} color={colors.TEXT_SECONDARY} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.membersText, { color: colors.TEXT_SECONDARY }]}>
                        {slot.assignedUsers.length > 0
                          ? slot.assignedUsers.map((u) => u.name).join(", ")
                          : `${slot.assignedUserIds.length}/${slot.capacity} người`}
                      </Text>
                    </View>
                    <Text style={[styles.capacityText, { color: colors.TEXT_SECONDARY }]}>
                      {slot.assignedUserIds.length}/{slot.capacity}
                    </Text>
                  </View>

                  {/* Action Buttons */}
                  {(showCheckIn || showManagement) && (
                    <View style={[styles.actionRow, { borderTopColor: colors.BORDER }]}>
                      {showCheckIn && (
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: COLORS.PRIMARY }]}
                          onPress={() => handleSelfCheckIn(slot)}
                        >
                          <Ionicons name="finger-print" size={16} color={COLORS.WHITE} />
                          <Text style={styles.actionBtnText}>Điểm danh</Text>
                        </TouchableOpacity>
                      )}
                      {showManagement && (
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: COLORS.WARNING }]}
                          onPress={() => openManagementModal(slot)}
                        >
                          <Ionicons name="shield-checkmark" size={16} color={COLORS.WHITE} />
                          <Text style={styles.actionBtnText}>Quản lý kíp</Text>
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
      )}

      {/* ── Management Modal ── */}
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
                {selectedSlot.shiftLabel} · {formatDate(selectedSlot.shiftDate)}
              </Text>
            )}

            <FlatList
              data={selectedSlot?.assignedUsers ?? []}
              keyExtractor={(item) => item.id.toString()}
              style={{ maxHeight: 320 }}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: colors.TEXT_SECONDARY, marginTop: 16 }]}>
                  Chưa có thành viên nào được phân công
                </Text>
              }
              renderItem={({ item }: { item: DutyUser }) => {
                const attended = pendingAttendance.has(item.id);
                return (
                  <View style={[styles.memberRow, { borderBottomColor: colors.BORDER }]}>
                    <View style={[styles.memberAvatar, { backgroundColor: isDark ? "#3a3a3a" : "#F5F5F5" }]}>
                      <Text style={[styles.memberAvatarText, { color: colors.TEXT_PRIMARY }]}>
                        {item.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.memberName, { color: colors.TEXT_PRIMARY }]}>{item.name}</Text>
                      <Text style={[styles.memberStudentId, { color: colors.TEXT_SECONDARY }]}>
                        {item.studentId ?? item.position ?? ""}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.attendBtn,
                        { backgroundColor: attended ? COLORS.SUCCESS : colors.BORDER },
                      ]}
                      onPress={() => toggleMemberAttendance(item.id)}
                    >
                      <Ionicons name={attended ? "checkmark" : "add"} size={18} color={attended ? COLORS.WHITE : colors.TEXT_SECONDARY} />
                    </TouchableOpacity>
                  </View>
                );
              }}
            />

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: COLORS.PRIMARY }]}
              onPress={saveAttendance}
              disabled={markingAttendance}
            >
              {markingAttendance ? (
                <ActivityIndicator color={COLORS.WHITE} />
              ) : (
                <Text style={styles.saveBtnText}>Lưu điểm danh ({pendingAttendance.size})</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Top action row
  topActionRow: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 14, marginVertical: 10 },
  viewToggle: { flexDirection: "row", borderRadius: 10, borderWidth: 1, overflow: "hidden" },
  toggleBtn: { width: 36, height: 36, justifyContent: "center", alignItems: "center" },
  // Table hint
  tableHint: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1 },
  tableHintText: { fontSize: 12 },
  // Table
  tableHeaderRow: { flexDirection: "row", borderBottomWidth: 1.5 },
  tableCorner: { justifyContent: "center", alignItems: "center", padding: 8, borderRightWidth: 1 },
  tableCornerText: { fontSize: 11, fontWeight: "700" },
  tableColHeader: { justifyContent: "center", alignItems: "center", paddingVertical: 10, borderRightWidth: 1 },
  tableColDay: { fontSize: 13, fontWeight: "800" },
  tableColDate: { fontSize: 11, marginTop: 2 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1 },
  tableRowHeader: { justifyContent: "center", padding: 8, borderRightWidth: 1 },
  tableRowShift: { fontSize: 11, fontWeight: "700", textAlign: "center" },
  tableRowTime: { fontSize: 10, textAlign: "center", marginTop: 2 },
  tableCell: { padding: 8, justifyContent: "flex-start", gap: 4, borderRightWidth: 1, minHeight: 110 },
  tableCellBadge: { alignSelf: "flex-start", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  tableCellBadgeText: { fontSize: 10, fontWeight: "700" },
  tableCellCapRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  tableCellBar: { flex: 1, height: 4, borderRadius: 2, overflow: "hidden" },
  tableCellBarFill: { height: "100%", borderRadius: 2 },
  tableCellCapText: { fontSize: 10, fontWeight: "600" },
  tableCellUser: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 },
  tableCellAvatar: { width: 16, height: 16, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  tableCellAvatarText: { fontSize: 9, fontWeight: "700" },
  tableCellUserName: { fontSize: 11, flex: 1 },
  tableCellMine: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 2 },
  tableCellMineText: { fontSize: 10, fontWeight: "600" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  loadingText: { fontSize: 14 },
  errorText: { fontSize: 14, textAlign: "center" },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryBtnText: { color: COLORS.WHITE, fontWeight: "700" },

  // Week Header
  weekHeader: { paddingBottom: 12, borderBottomWidth: 1 },
  weekTitleRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10,
  },
  weekTitle: { fontSize: 16, fontWeight: "700" },
  weekNav: { flexDirection: "row", gap: 8 },
  navBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  dayScroll: { paddingHorizontal: 12 },
  dayChip: { alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  myChip: { flexDirection: "column", gap: 2 },
  dayChipText: { fontSize: 13, fontWeight: "700" },
  dayDate: { fontSize: 11, marginTop: 2 },

  // Register button
  registerBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 12, borderRadius: 14,
    shadowColor: COLORS.PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  registerBtnText: { color: COLORS.WHITE, fontSize: 15, fontWeight: "700" },

  // Quota Card
  quotaCard: {
    flexDirection: "row", justifyContent: "space-around", alignItems: "center",
    margin: 14, marginBottom: 4, padding: 16, borderRadius: 14, borderWidth: 1,
  },
  quotaItem: { alignItems: "center" },
  quotaValue: { fontSize: 22, fontWeight: "800" },
  quotaLabel: { fontSize: 12, marginTop: 2 },
  quotaSep: { width: 1, height: 40 },

  // Slot List
  slotList: { paddingHorizontal: 14, paddingTop: 10 },
  emptyBox: { alignItems: "center", marginTop: 60, gap: 12 },
  emptyText: { fontSize: 15, textAlign: "center" },
  slotCard: {
    borderRadius: 16, borderWidth: 1.5, marginBottom: 14, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  slotHeader: { flexDirection: "row", alignItems: "flex-start", padding: 14, gap: 8 },
  slotShift: { fontSize: 15, fontWeight: "700", marginBottom: 3 },
  slotTime: { fontSize: 13 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start" },
  statusText: { fontSize: 12, fontWeight: "600" },
  myShiftBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 14, paddingBottom: 8 },
  myShiftText: { fontSize: 12, fontWeight: "600" },
  membersRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1,
  },
  membersText: { fontSize: 13 },
  capacityText: { fontSize: 12, fontWeight: "600" },
  actionRow: {
    flexDirection: "row", gap: 10, padding: 12, paddingTop: 10, borderTopWidth: 1,
  },
  actionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 10, borderRadius: 12,
  },
  actionBtnText: { color: COLORS.WHITE, fontSize: 14, fontWeight: "700" },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  modalSubtitle: { fontSize: 13, marginBottom: 16 },
  memberRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 12, borderBottomWidth: 1,
  },
  memberAvatar: { width: 42, height: 42, borderRadius: 21, justifyContent: "center", alignItems: "center" },
  memberAvatarText: { fontSize: 16, fontWeight: "700" },
  memberName: { fontSize: 15, fontWeight: "600" },
  memberStudentId: { fontSize: 12 },
  attendBtn: { width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center" },
  saveBtn: { marginTop: 16, paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  saveBtnText: { color: COLORS.WHITE, fontSize: 15, fontWeight: "700" },
});

export default DutyScreen;
