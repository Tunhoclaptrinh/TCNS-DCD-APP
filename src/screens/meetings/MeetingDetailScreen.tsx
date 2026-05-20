import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";
import { useTheme } from "@/src/hooks/useTheme";
import { useAppSelector } from "@/src/store";
import { MeetingService, Meeting } from "@/src/services/meeting.service";

// ─── InfoRow ──────────────────────────────────────────────────────────────────

const InfoRow = ({ icon, label, value, colors }: any) => (
  <View style={styles.infoItem}>
    <Ionicons name={icon as any} size={16} color={COLORS.PRIMARY} />
    <View style={{ flex: 1 }}>
      <Text style={[styles.infoLabel, { color: colors.TEXT_SECONDARY }]}>
        {label}
      </Text>
      <Text style={[styles.infoValue, { color: colors.TEXT_PRIMARY }]}>
        {value}
      </Text>
    </View>
  </View>
);

// ─── Decline Modal ────────────────────────────────────────────────────────────

const DeclineModal = ({
  visible,
  onClose,
  onConfirm,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  colors: any;
}) => {
  const [reason, setReason] = useState("");

  // Reset khi mở lại
  useEffect(() => {
    if (visible) setReason("");
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalBox, { backgroundColor: colors.CARD_BG }]}>
          {/* Icon */}
          <View style={styles.modalIconWrap}>
            <Ionicons name="close-circle" size={36} color={COLORS.ERROR} />
          </View>

          <Text style={[styles.modalTitle, { color: colors.TEXT_PRIMARY }]}>
            Từ chối tham gia
          </Text>
          <Text style={[styles.modalSub, { color: colors.TEXT_SECONDARY }]}>
            Vui lòng cho biết lý do bạn không thể tham gia cuộc họp này.
          </Text>

          <TextInput
            style={[
              styles.modalInput,
              {
                backgroundColor: colors.BACKGROUND,
                borderColor: colors.BORDER,
                color: colors.TEXT_PRIMARY,
              },
            ]}
            placeholder="Nhập lý do..."
            placeholderTextColor={colors.TEXT_SECONDARY}
            multiline
            numberOfLines={3}
            value={reason}
            onChangeText={setReason}
            textAlignVertical="top"
            autoFocus
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalBtn, { borderColor: colors.BORDER }]}
              onPress={onClose}
            >
              <Text style={{ color: colors.TEXT_SECONDARY, fontWeight: "600" }}>
                Hủy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalBtn,
                {
                  backgroundColor: COLORS.ERROR,
                  borderColor: COLORS.ERROR,
                  opacity: reason.trim() ? 1 : 0.4,
                },
              ]}
              disabled={!reason.trim()}
              onPress={() => onConfirm(reason.trim())}
            >
              <Text style={{ color: COLORS.WHITE, fontWeight: "700" }}>
                Xác nhận từ chối
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const MeetingDetailScreen = ({ navigation, route }: any) => {
  const { colors, isDark } = useTheme();
  const user = useAppSelector((s) => s.auth.user);
  const meetingId: string = route?.params?.meetingId ?? "";

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);

  // ─── Fetch ─────────────────────────────────────────────────────────────────

  const fetchMeeting = useCallback(async () => {
    if (!meetingId) return;
    try {
      setLoading(true);
      const data = await MeetingService.getMeetingById(meetingId);
      setMeeting(data);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ?? e?.message ?? "Không thể tải dữ liệu";
      Alert.alert("Lỗi", msg, [
        { text: "Quay lại", onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  useEffect(() => {
    fetchMeeting();
  }, [fetchMeeting]);

  // ─── RSVP ──────────────────────────────────────────────────────────────────

  const handleRsvp = async (
    status: "accepted" | "declined",
    reason?: string
  ) => {
    if (!meeting) return;
    try {
      setRsvpLoading(true);
      const updated = await MeetingService.rsvpMeeting(meeting.id, {
        rsvpStatus: status,
        reason,
      });
      setMeeting(updated);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ??
        e?.message ??
        "Không thể ghi nhận phản hồi";
      Alert.alert("Lỗi", msg);
    } finally {
      setRsvpLoading(false);
    }
  };

  const onPressAccept = () => {
    if (myRsvpStatus === "accepted") return; // Đã xác nhận rồi
    Alert.alert(
      "Xác nhận tham gia",
      "Bạn xác nhận sẽ tham gia cuộc họp này?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xác nhận", onPress: () => handleRsvp("accepted") },
      ]
    );
  };

  const onPressDecline = () => {
    setShowDeclineModal(true);
  };

  // ─── Loading / Error states ─────────────────────────────────────────────────

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.BACKGROUND,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={{ color: colors.TEXT_SECONDARY, marginTop: 12 }}>
          Đang tải chi tiết cuộc họp...
        </Text>
      </View>
    );
  }

  if (!meeting) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.BACKGROUND,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Ionicons
          name="alert-circle-outline"
          size={56}
          color={colors.BORDER}
        />
        <Text
          style={{ color: colors.TEXT_SECONDARY, marginTop: 12, fontSize: 15 }}
        >
          Không tìm thấy cuộc họp
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginTop: 8 }}
        >
          <Text style={{ color: COLORS.PRIMARY, fontWeight: "600" }}>
            Quay lại
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Derived values ─────────────────────────────────────────────────────────

  const { date, time } = MeetingService.formatDateTime(meeting.meetingAt);
  const { time: endTime } = MeetingService.formatDateTime(meeting.endAt);
  const myRsvp = MeetingService.getMyRsvp(meeting, user?.id);
  const myRsvpStatus = myRsvp?.rsvpStatus ?? "pending";
  const acceptedCount = MeetingService.getAcceptedCount(meeting);
  const totalCount = meeting.participantIds?.length ?? 0;

  const meetingIsPast = MeetingService.isPast(meeting);
  const canRsvp =
    meeting.status === "scheduled" && !meetingIsPast;

  const meetingStatusLabel: Record<string, { label: string; color: string }> = {
    scheduled: { label: "Đã lên lịch", color: "#1976D2" },
    completed:  { label: "Đã hoàn thành", color: COLORS.SUCCESS },
    cancelled:  { label: "Đã hủy", color: COLORS.ERROR },
  };
  const statusInfo = meetingStatusLabel[meeting.status] ?? meetingStatusLabel.scheduled;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header Card ── */}
        <View style={[styles.headerCard, { backgroundColor: COLORS.PRIMARY }]}>
          <View style={styles.headerIconWrap}>
            <Ionicons name="people" size={28} color={COLORS.WHITE} />
          </View>
          <Text style={styles.headerTitle}>{meeting.title}</Text>
          <View style={styles.headerMeta}>
            <Ionicons
              name="calendar"
              size={14}
              color="rgba(255,255,255,0.8)"
            />
            <Text style={styles.headerMetaText}>
              {date} • {time}
              {meeting.endAt ? ` – ${endTime}` : ""}
            </Text>
          </View>
          {/* Badge trạng thái cuộc họp */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: "rgba(255,255,255,0.2)" },
            ]}
          >
            <Text style={styles.statusBadgeText}>{statusInfo.label}</Text>
          </View>
        </View>

        {/* ── Thông tin ── */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER },
          ]}
        >
          <InfoRow
            icon="location"
            label="Địa điểm"
            value={meeting.location}
            colors={colors}
          />

          {/* Tỷ lệ tham gia */}
          <View style={styles.attendeeBlock}>
            <View style={styles.attendeeHeader}>
              <Ionicons
                name="people-outline"
                size={16}
                color={COLORS.PRIMARY}
              />
              <Text
                style={[styles.attendeeLabel, { color: colors.TEXT_SECONDARY }]}
              >
                Tỷ lệ xác nhận tham gia
              </Text>
              <Text
                style={[styles.attendeeCount, { color: colors.TEXT_PRIMARY }]}
              >
                <Text style={{ color: COLORS.SUCCESS }}>{acceptedCount}</Text>/
                {totalCount}
              </Text>
            </View>
            <View
              style={[
                styles.progressBar,
                { backgroundColor: isDark ? "#2a2a2a" : "#E0E0E0" },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: totalCount
                      ? `${Math.round((acceptedCount / totalCount) * 100)}%`
                      : "0%",
                  } as any,
                ]}
              />
            </View>
            <Text
              style={[styles.progressLabel, { color: colors.TEXT_SECONDARY }]}
            >
              {totalCount
                ? `${Math.round((acceptedCount / totalCount) * 100)}% đã xác nhận`
                : "Chưa có thành viên"}
            </Text>
          </View>
        </View>

        {/* ── Nội dung / Chương trình ── */}
        {!!meeting.agenda && (
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Ionicons
                name="document-text-outline"
                size={16}
                color={COLORS.PRIMARY}
              />
              <Text
                style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}
              >
                Nội dung / Chương trình họp
              </Text>
            </View>
            <Text style={[styles.sectionBody, { color: colors.TEXT_SECONDARY }]}>
              {meeting.agenda}
            </Text>
          </View>
        )}

        {/* ── Ghi chú ── */}
        {!!meeting.note && (
          <View
            style={[
              styles.noteCard,
              {
                backgroundColor: isDark ? "#1a2d1a" : "#F1F8E9",
                borderColor: isDark ? "#2a4a2a" : "#C8E6C9",
              },
            ]}
          >
            <Ionicons
              name="information-circle"
              size={18}
              color={COLORS.SUCCESS}
            />
            <Text
              style={[
                styles.noteText,
                { color: isDark ? "#A5D6A7" : "#2E7D32" },
              ]}
            >
              {meeting.note}
            </Text>
          </View>
        )}

        {/* ── Trạng thái RSVP của tôi ── */}
        <View
          style={[
            styles.myRsvpCard,
            {
              backgroundColor:
                myRsvpStatus === "accepted"
                  ? isDark ? "#1a3a1a" : "#E8F5E9"
                  : myRsvpStatus === "declined"
                  ? isDark ? "#3a1a1a" : "#FFEBEE"
                  : isDark ? "#2a2a1a" : "#FFF8E1",
              borderColor:
                myRsvpStatus === "accepted"
                  ? COLORS.SUCCESS + "60"
                  : myRsvpStatus === "declined"
                  ? COLORS.ERROR + "60"
                  : COLORS.WARNING + "60",
            },
          ]}
        >
          <Ionicons
            name={
              myRsvpStatus === "accepted"
                ? "checkmark-circle"
                : myRsvpStatus === "declined"
                ? "close-circle"
                : "help-circle"
            }
            size={22}
            color={
              myRsvpStatus === "accepted"
                ? COLORS.SUCCESS
                : myRsvpStatus === "declined"
                ? COLORS.ERROR
                : COLORS.WARNING
            }
          />
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.myRsvpTitle,
                {
                  color:
                    myRsvpStatus === "accepted"
                      ? COLORS.SUCCESS
                      : myRsvpStatus === "declined"
                      ? COLORS.ERROR
                      : COLORS.WARNING,
                },
              ]}
            >
              {myRsvpStatus === "accepted"
                ? "Bạn đã xác nhận tham gia"
                : myRsvpStatus === "declined"
                ? "Bạn đã từ chối tham gia"
                : "Bạn chưa phản hồi"}
            </Text>
            {myRsvpStatus === "declined" && myRsvp?.reason && (
              <Text
                style={[styles.myRsvpSub, { color: colors.TEXT_SECONDARY }]}
              >
                Lý do: {myRsvp.reason}
              </Text>
            )}
            {myRsvpStatus === "pending" && canRsvp && (
              <Text
                style={[styles.myRsvpSub, { color: colors.TEXT_SECONDARY }]}
              >
                Vui lòng xác nhận tham gia hoặc từ chối bên dưới.
              </Text>
            )}
          </View>
        </View>

        {/* ── Nút RSVP ── */}
        {canRsvp ? (
          <View style={styles.actionRow}>
            {/* Từ chối */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                {
                  borderColor: COLORS.ERROR,
                  backgroundColor:
                    myRsvpStatus === "declined" ? COLORS.ERROR : "transparent",
                  flex: 1,
                },
              ]}
              onPress={onPressDecline}
              disabled={rsvpLoading}
              activeOpacity={0.8}
            >
              {rsvpLoading && myRsvpStatus !== "accepted" ? (
                <ActivityIndicator
                  size="small"
                  color={
                    myRsvpStatus === "declined" ? COLORS.WHITE : COLORS.ERROR
                  }
                />
              ) : (
                <Ionicons
                  name="close-circle-outline"
                  size={20}
                  color={
                    myRsvpStatus === "declined" ? COLORS.WHITE : COLORS.ERROR
                  }
                />
              )}
              <Text
                style={[
                  styles.actionBtnText,
                  {
                    color:
                      myRsvpStatus === "declined" ? COLORS.WHITE : COLORS.ERROR,
                  },
                ]}
              >
                Từ chối
              </Text>
            </TouchableOpacity>

            {/* Tham gia */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                {
                  borderColor: COLORS.PRIMARY,
                  backgroundColor:
                    myRsvpStatus === "accepted"
                      ? COLORS.PRIMARY
                      : "transparent",
                  flex: 1,
                },
              ]}
              onPress={onPressAccept}
              disabled={rsvpLoading || myRsvpStatus === "accepted"}
              activeOpacity={0.8}
            >
              {rsvpLoading && myRsvpStatus !== "declined" ? (
                <ActivityIndicator
                  size="small"
                  color={
                    myRsvpStatus === "accepted" ? COLORS.WHITE : COLORS.PRIMARY
                  }
                />
              ) : (
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color={
                    myRsvpStatus === "accepted" ? COLORS.WHITE : COLORS.PRIMARY
                  }
                />
              )}
              <Text
                style={[
                  styles.actionBtnText,
                  {
                    color:
                      myRsvpStatus === "accepted"
                        ? COLORS.WHITE
                        : COLORS.PRIMARY,
                  },
                ]}
              >
                {myRsvpStatus === "accepted" ? "Đã xác nhận ✓" : "Tham gia"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Meeting đã qua hoặc cancelled */
          !canRsvp && meeting.status !== "scheduled" && (
            <View
              style={[
                styles.closedNote,
                { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={16}
                color={colors.TEXT_SECONDARY}
              />
              <Text
                style={[styles.closedNoteText, { color: colors.TEXT_SECONDARY }]}
              >
                {meeting.status === "cancelled"
                  ? "Cuộc họp đã bị hủy"
                  : "Cuộc họp đã kết thúc — không thể thay đổi phản hồi"}
              </Text>
            </View>
          )
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Decline Modal */}
      <DeclineModal
        visible={showDeclineModal}
        onClose={() => setShowDeclineModal(false)}
        onConfirm={(reason) => {
          setShowDeclineModal(false);
          handleRsvp("declined", reason);
        }}
        colors={colors}
      />
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 32 },

  // Header
  headerCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 10,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  headerIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 28,
  },
  headerMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerMetaText: { color: "rgba(255,255,255,0.85)", fontSize: 14 },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 2,
  },
  statusBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  // Info card
  infoCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 14 },
  infoItem: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  infoLabel: { fontSize: 12, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: "600" },
  attendeeBlock: { gap: 8 },
  attendeeHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  attendeeLabel: { flex: 1, fontSize: 12 },
  attendeeCount: { fontSize: 14, fontWeight: "700" },
  progressBar: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: {
    height: 8,
    backgroundColor: COLORS.SUCCESS,
    borderRadius: 4,
  },
  progressLabel: { fontSize: 12 },

  // Section card
  sectionCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  sectionBody: { fontSize: 14, lineHeight: 22 },

  // Note
  noteCard: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  noteText: { flex: 1, fontSize: 13, lineHeight: 20 },

  // My RSVP
  myRsvpCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  myRsvpTitle: { fontSize: 14, fontWeight: "700" },
  myRsvpSub: { fontSize: 13, marginTop: 3, lineHeight: 18 },

  // Action buttons
  actionRow: { flexDirection: "row", gap: 12 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 2,
  },
  actionBtnText: { fontSize: 15, fontWeight: "700" },

  // Closed note
  closedNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  closedNoteText: { flex: 1, fontSize: 13 },

  // Decline Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalBox: {
    borderRadius: 20,
    padding: 24,
    width: "100%",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  modalIconWrap: { alignItems: "center", marginBottom: 4 },
  modalTitle: { fontSize: 18, fontWeight: "800", textAlign: "center" },
  modalSub: { fontSize: 13, lineHeight: 20, textAlign: "center" },
  modalInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 90,
  },
  modalButtons: { flexDirection: "row", gap: 10, marginTop: 4 },
  modalBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
});

export default MeetingDetailScreen;
