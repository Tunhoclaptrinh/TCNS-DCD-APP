import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";
import { useTheme } from "@/src/hooks/useTheme";
import { DutyService, DutySlot, DutyUser } from "@/src/services/duty.service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AttendanceModalProps {
  visible: boolean;
  slot: DutySlot | null;
  myUserId?: number;
  onClose: () => void;
  onSaved: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (isoString?: string): string => {
  if (!isoString) return "—";
  const d = new Date(isoString);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// ─── Sub-component: MemberRow ─────────────────────────────────────────────────

interface MemberRowProps {
  item: DutyUser;
  isAttended: boolean;
  isLeader: boolean;
  isSelf: boolean;
  isLoadingToggle: boolean;
  onToggle: (userId: number) => void;
  colors: any;
  isDark: boolean;
}

const MemberRow = React.memo(({
  item, isAttended, isLeader, isSelf, isLoadingToggle, onToggle, colors, isDark,
}: MemberRowProps) => {
  const avatarBg = isAttended
    ? COLORS.SUCCESS
    : isSelf
    ? COLORS.PRIMARY
    : isDark
    ? "#3a3a3a"
    : "#E8EAF6";

  const avatarTextColor = isAttended || isSelf ? COLORS.WHITE : colors.TEXT_PRIMARY;

  return (
    <View style={[styles.memberRow, { borderBottomColor: colors.BORDER }]}>
      {/* Avatar */}
      <View style={[styles.memberAvatar, { backgroundColor: avatarBg }]}>
        <Text style={[styles.memberAvatarText, { color: avatarTextColor }]}>
          {getInitials(item.name)}
        </Text>
        {isAttended && (
          <View style={styles.attendedBadge}>
            <Ionicons name="checkmark" size={8} color={COLORS.WHITE} />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={[styles.memberName, { color: colors.TEXT_PRIMARY }]} numberOfLines={1}>
            {item.name}
          </Text>
          {isSelf && (
            <View style={[styles.selfTag, { backgroundColor: isDark ? "#3a1a1a" : "#FFF0F0" }]}>
              <Text style={[styles.selfTagText, { color: COLORS.PRIMARY }]}>Bạn</Text>
            </View>
          )}
          {isLeader && (
            <View style={[styles.leaderTag, { backgroundColor: isDark ? "#2a2a1a" : "#FFF8E1" }]}>
              <Ionicons name="star" size={9} color={COLORS.WARNING} />
              <Text style={[styles.leaderTagText, { color: COLORS.WARNING }]}>KT</Text>
            </View>
          )}
        </View>
        <Text style={[styles.memberSubtext, { color: colors.TEXT_SECONDARY }]} numberOfLines={1}>
          {item.studentId ?? item.position ?? ""}
        </Text>
      </View>

      {/* Toggle Button */}
      <TouchableOpacity
        style={[
          styles.toggleBtn,
          { backgroundColor: isAttended ? COLORS.SUCCESS : isDark ? "#2a2a2a" : "#F5F5F5" },
        ]}
        onPress={() => onToggle(item.id)}
        disabled={isLoadingToggle}
        activeOpacity={0.7}
      >
        {isLoadingToggle ? (
          <ActivityIndicator size="small" color={isAttended ? COLORS.WHITE : colors.TEXT_SECONDARY} />
        ) : (
          <Ionicons
            name={isAttended ? "checkmark-circle" : "ellipse-outline"}
            size={22}
            color={isAttended ? COLORS.WHITE : colors.TEXT_SECONDARY}
          />
        )}
      </TouchableOpacity>
    </View>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────

const AttendanceModal: React.FC<AttendanceModalProps> = ({
  visible, slot, myUserId, onClose, onSaved,
}) => {
  const { colors, isDark } = useTheme();

  // ── State ──────────────────────────────────────────────────────────────────
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Sync pendingIds from slot whenever slot changes
  useEffect(() => {
    if (slot) {
      setPendingIds(new Set(slot.attendedUserIds));
      setShowLogs(false);
    }
  }, [slot]);

  // ── Toggle per-member (leaderMarkAttendance) ───────────────────────────────
  const handleToggleMember = useCallback(async (userId: number) => {
    if (!slot || togglingId !== null) return;
    setTogglingId(userId);
    try {
      const updated = await DutyService.leaderMarkAttendance(slot.id, userId);
      // Optimistically update local state
      setPendingIds((prev) => {
        const next = new Set(prev);
        if (next.has(userId)) next.delete(userId);
        else next.add(userId);
        return next;
      });
    } catch (err: any) {
      Alert.alert("Lỗi", err?.response?.data?.message || "Không thể cập nhật điểm danh.");
    } finally {
      setTogglingId(null);
    }
  }, [slot, togglingId]);

  // ── Load logs ──────────────────────────────────────────────────────────────
  const loadLogs = useCallback(async () => {
    if (!slot) return;
    setLoadingLogs(true);
    try {
      const result = await DutyService.getSlotLogs(slot.id);
      setLogs(Array.isArray(result) ? result.slice(0, 20) : []);
      setShowLogs(true);
    } catch {
      Alert.alert("Lỗi", "Không thể tải lịch sử điểm danh.");
    } finally {
      setLoadingLogs(false);
    }
  }, [slot]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const attendedCount = pendingIds.size;
  const totalCount = slot?.assignedUsers.length ?? 0;
  const attendanceRate = totalCount > 0 ? attendedCount / totalCount : 0;

  const isLeaderOfSlot = (userId: number): boolean => {
    if (!slot) return false;
    const firstId = slot.assignedUserIds[0];
    return userId === firstId || userId === slot.tempLeaderId;
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.CARD_BG }]}>
          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.TEXT_PRIMARY }]}>Quản lý điểm danh</Text>
              {slot && (
                <Text style={[styles.subtitle, { color: colors.TEXT_SECONDARY }]} numberOfLines={1}>
                  {slot.shiftLabel} · {new Date(slot.shiftDate).toLocaleDateString("vi-VN", {
                    day: "2-digit", month: "2-digit", timeZone: "UTC",
                  })}
                </Text>
              )}
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.TEXT_SECONDARY} />
            </TouchableOpacity>
          </View>

          {/* ── Progress Bar ── */}
          <View style={styles.progressSection}>
            <View style={[styles.progressBg, { backgroundColor: isDark ? "#2a2a2a" : "#F0F0F0" }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.round(attendanceRate * 100)}%`,
                    backgroundColor:
                      attendanceRate >= 1
                        ? COLORS.SUCCESS
                        : attendanceRate >= 0.5
                        ? COLORS.WARNING
                        : COLORS.PRIMARY,
                  },
                ]}
              />
            </View>
            <View style={styles.progressInfo}>
              <Text style={[styles.progressLabel, { color: colors.TEXT_SECONDARY }]}>
                Có mặt
              </Text>
              <Text style={[styles.progressCount, { color: colors.TEXT_PRIMARY }]}>
                <Text style={{ color: COLORS.PRIMARY, fontWeight: "800" }}>{attendedCount}</Text>
                /{totalCount} người
              </Text>
            </View>
          </View>

          {/* ── Tab: Danh sách / Lịch sử ── */}
          <View style={[styles.tabRow, { borderBottomColor: colors.BORDER }]}>
            <TouchableOpacity
              style={[styles.tab, !showLogs && { borderBottomColor: COLORS.PRIMARY, borderBottomWidth: 2 }]}
              onPress={() => setShowLogs(false)}
            >
              <Text style={[styles.tabText, { color: !showLogs ? COLORS.PRIMARY : colors.TEXT_SECONDARY }]}>
                Danh sách
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, showLogs && { borderBottomColor: COLORS.PRIMARY, borderBottomWidth: 2 }]}
              onPress={loadLogs}
            >
              {loadingLogs ? (
                <ActivityIndicator size="small" color={COLORS.PRIMARY} />
              ) : (
                <Text style={[styles.tabText, { color: showLogs ? COLORS.PRIMARY : colors.TEXT_SECONDARY }]}>
                  Lịch sử
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Content ── */}
          {showLogs ? (
            <ScrollView style={styles.logsContainer} showsVerticalScrollIndicator={false}>
              {logs.length === 0 ? (
                <View style={styles.emptyLogs}>
                  <Ionicons name="document-text-outline" size={36} color={colors.BORDER} />
                  <Text style={[{ color: colors.TEXT_SECONDARY, fontSize: 13, marginTop: 8 }]}>
                    Chưa có lịch sử điểm danh
                  </Text>
                </View>
              ) : (
                logs.map((log, idx) => (
                  <View key={idx} style={[styles.logRow, { borderBottomColor: colors.BORDER }]}>
                    <View style={[styles.logDot, {
                      backgroundColor: log.action === "attendance" ? COLORS.SUCCESS : COLORS.PRIMARY,
                    }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.logMsg, { color: colors.TEXT_PRIMARY }]} numberOfLines={2}>
                        {log.message ?? log.action ?? "—"}
                      </Text>
                      <Text style={[styles.logTime, { color: colors.TEXT_SECONDARY }]}>
                        {formatTime(log.createdAt ?? log.timestamp)}
                      </Text>
                    </View>
                  </View>
                ))
              )}
              <View style={{ height: 20 }} />
            </ScrollView>
          ) : (
            <FlatList
              data={slot?.assignedUsers ?? []}
              keyExtractor={(item) => item.id.toString()}
              style={styles.list}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyLogs}>
                  <Ionicons name="people-outline" size={36} color={colors.BORDER} />
                  <Text style={[{ color: colors.TEXT_SECONDARY, fontSize: 13, marginTop: 8 }]}>
                    Chưa có thành viên nào được phân công
                  </Text>
                </View>
              }
              renderItem={({ item }: { item: DutyUser }) => (
                <MemberRow
                  item={item}
                  isAttended={pendingIds.has(item.id)}
                  isLeader={isLeaderOfSlot(item.id)}
                  isSelf={item.id === myUserId}
                  isLoadingToggle={togglingId === item.id}
                  onToggle={handleToggleMember}
                  colors={colors}
                  isDark={isDark}
                />
              )}
            />
          )}

          {/* ── Done Button ── */}
          {!showLogs && (
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: COLORS.PRIMARY }]}
              onPress={() => { onSaved(); onClose(); }}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-done-outline" size={18} color={COLORS.WHITE} />
              <Text style={styles.saveBtnText}>
                Xong — {attendedCount}/{totalCount} có mặt
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 8,
    maxHeight: "85%",
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  // Progress
  progressSection: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 8,
  },
  progressBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    minWidth: 4,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 12,
  },
  progressCount: {
    fontSize: 13,
  },
  // Tabs
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    marginHorizontal: 20,
    marginBottom: 4,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  // List
  list: {
    maxHeight: 340,
    paddingHorizontal: 20,
  },
  // Member Row
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  memberAvatarText: {
    fontSize: 15,
    fontWeight: "800",
  },
  attendedBadge: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.SUCCESS,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  memberName: {
    fontSize: 15,
    fontWeight: "600",
  },
  memberSubtext: {
    fontSize: 12,
    marginTop: 1,
  },
  selfTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  selfTagText: {
    fontSize: 10,
    fontWeight: "700",
  },
  leaderTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  leaderTagText: {
    fontSize: 10,
    fontWeight: "700",
  },
  toggleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  // Logs
  logsContainer: {
    maxHeight: 320,
    paddingHorizontal: 20,
  },
  logRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  logDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  logMsg: {
    fontSize: 13,
  },
  logTime: {
    fontSize: 11,
    marginTop: 2,
  },
  emptyLogs: {
    alignItems: "center",
    paddingVertical: 32,
  },
  // Save
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 28,
    paddingVertical: 15,
    borderRadius: 16,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveBtnText: {
    color: COLORS.WHITE,
    fontSize: 15,
    fontWeight: "700",
  },
});

export default AttendanceModal;
