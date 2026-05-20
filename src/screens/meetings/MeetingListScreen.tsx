import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";
import { useTheme } from "@/src/hooks/useTheme";
import { useAppSelector } from "@/src/store";
import { MeetingService, Meeting } from "@/src/services/meeting.service";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getRsvpStyle = (rsvpStatus: string | undefined | null) => {
  if (rsvpStatus === "accepted")
    return {
      color: COLORS.SUCCESS,
      label: "Đã xác nhận",
      icon: "checkmark-circle" as const,
    };
  if (rsvpStatus === "declined")
    return {
      color: COLORS.ERROR,
      label: "Từ chối",
      icon: "close-circle" as const,
    };
  return {
    color: COLORS.WARNING,
    label: "Chờ xác nhận",
    icon: "time" as const,
  };
};

const getMeetingStatusStyle = (status: string) => {
  if (status === "completed") return { color: COLORS.SUCCESS, label: "Đã hoàn thành" };
  if (status === "cancelled") return { color: COLORS.ERROR, label: "Đã hủy" };
  return { color: "#1976D2", label: "Đã lên lịch" };
};

// ─── Component ───────────────────────────────────────────────────────────────

const MeetingListScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const user = useAppSelector((s) => s.auth.user);

  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Fetch ───────────────────────────────────────────────────────────────

  const fetchMeetings = useCallback(async (isRefresh = false) => {
    if (!user?.id) {
      console.log("[MeetingListScreen] skip fetch - user not logged in yet");
      setLoading(false);
      return;
    }
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      console.log("[MeetingListScreen] fetching for userId:", user.id);
      const meetings = await MeetingService.listMeetings({ pageSize: 100 });
      console.log("[MeetingListScreen] meetings received:", meetings?.length ?? 0);
      setMeetings(Array.isArray(meetings) ? meetings : []);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        e?.message ??
        "Không thể tải lịch họp";
      console.error("[MeetingListScreen] error:", e?.response?.status, msg);
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // ← refetch khi user thay đổi (sau login)

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]); // cũng trigger lại khi user?.id thay đổi

  // Re-fetch khi quay lại màn hình (focus)
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchMeetings();
    });
    return unsubscribe;
  }, [navigation, fetchMeetings]);

  // ─── Filter ──────────────────────────────────────────────────────────────

  const filtered = meetings.filter((m) => {
    const past = MeetingService.isPast(m);
    return tab === "upcoming" ? !past : past;
  });

  // ─── Render ──────────────────────────────────────────────────────────────

  const renderItem = ({ item }: { item: Meeting }) => {
    const { date, time } = MeetingService.formatDateTime(item.meetingAt);
    const myRsvp = MeetingService.getMyRsvp(item, user?.id);
    const { color, label, icon } = getRsvpStyle(myRsvp?.rsvpStatus);
    const acceptedCount = MeetingService.getAcceptedCount(item);
    const totalCount = item.participantIds?.length ?? 0;

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}
        onPress={() =>
          navigation.navigate("MeetingDetail", { meetingId: String(item.id) })
        }
        activeOpacity={0.75}
      >
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: isDark ? "#1a2a3a" : "#E3F2FD" },
            ]}
          >
            <Ionicons name="people" size={24} color="#1976D2" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[styles.cardTitle, { color: colors.TEXT_PRIMARY }]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <View style={styles.badgeRow}>
              <View
                style={[styles.confirmBadge, { backgroundColor: color + "20" }]}
              >
                <Ionicons name={icon} size={12} color={color} />
                <Text style={[styles.confirmText, { color }]}>{label}</Text>
              </View>
              {item.status !== "scheduled" && (
                <View
                  style={[
                    styles.confirmBadge,
                    {
                      backgroundColor:
                        getMeetingStatusStyle(item.status).color + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.confirmText,
                      { color: getMeetingStatusStyle(item.status).color },
                    ]}
                  >
                    {getMeetingStatusStyle(item.status).label}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={[styles.metaRow, { borderTopColor: colors.BORDER }]}>
          <View style={styles.metaItem}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={colors.TEXT_SECONDARY}
            />
            <Text style={[styles.metaText, { color: colors.TEXT_SECONDARY }]}>
              {date} - {time}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons
              name="location-outline"
              size={14}
              color={colors.TEXT_SECONDARY}
            />
            <Text
              style={[styles.metaText, { color: colors.TEXT_SECONDARY }]}
              numberOfLines={1}
            >
              {item.location}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons
              name="people-outline"
              size={14}
              color={colors.TEXT_SECONDARY}
            />
            <Text style={[styles.metaText, { color: colors.TEXT_SECONDARY }]}>
              {acceptedCount}/{totalCount} người đã xác nhận
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    if (error) {
      return (
        <View style={styles.emptyBox}>
          <Ionicons name="cloud-offline-outline" size={56} color={COLORS.ERROR + "80"} />
          <Text style={[styles.emptyTitle, { color: colors.TEXT_PRIMARY }]}>Không thể tải dữ liệu</Text>
          <Text style={[styles.emptyText, { color: colors.TEXT_SECONDARY }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: COLORS.PRIMARY }]}
            onPress={() => fetchMeetings()}
          >
            <Ionicons name="refresh" size={16} color="#fff" />
            <Text style={[styles.retryText, { color: "#fff" }]}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }
    // Trường hợp có meeting nhưng tab kia có dữ liệu
    const otherTab = tab === "upcoming" ? "past" : "upcoming";
    const otherCount = meetings.filter((m) => {
      const p = MeetingService.isPast(m);
      return otherTab === "upcoming" ? !p : p;
    }).length;
    return (
      <View style={styles.emptyBox}>
        <Ionicons
          name={tab === "upcoming" ? "calendar-outline" : "checkmark-done-outline"}
          size={56}
          color={colors.BORDER}
        />
        <Text style={[styles.emptyTitle, { color: colors.TEXT_PRIMARY }]}>
          {tab === "upcoming" ? "Không có lịch họp sắp tới" : "Chưa có lịch họp đã qua"}
        </Text>
        <Text style={[styles.emptyText, { color: colors.TEXT_SECONDARY }]}>
          {meetings.length === 0
            ? "Bạn chưa được mời tham gia cuộc họp nào."
            : `Không có cuộc họp nào trong mục này.${otherCount > 0 ? ` (${otherCount} cuộc họp ở mục "${otherTab === "upcoming" ? "Sắp tới" : "Đã qua"}")` : ""}`}
        </Text>
        <TouchableOpacity
          style={[styles.retryBtn, { borderColor: colors.BORDER }]}
          onPress={() => fetchMeetings(true)}
        >
          <Ionicons name="refresh-outline" size={16} color={colors.TEXT_SECONDARY} />
          <Text style={[styles.retryText, { color: colors.TEXT_SECONDARY }]}>Làm mới</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      {/* Tabs */}
      <View
        style={[
          styles.tabBar,
          { backgroundColor: colors.CARD_BG, borderBottomColor: colors.BORDER },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.tabBtn,
            tab === "upcoming" && {
              borderBottomColor: COLORS.PRIMARY,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setTab("upcoming")}
        >
          <Text
            style={[
              styles.tabText,
              { color: tab === "upcoming" ? COLORS.PRIMARY : colors.TEXT_SECONDARY },
            ]}
          >
            Sắp tới
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            tab === "past" && {
              borderBottomColor: COLORS.PRIMARY,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setTab("past")}
        >
          <Text
            style={[
              styles.tabText,
              { color: tab === "past" ? COLORS.PRIMARY : colors.TEXT_SECONDARY },
            ]}
          >
            Đã qua
          </Text>
        </TouchableOpacity>


      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={[styles.loadingText, { color: colors.TEXT_SECONDARY }]}>
            Đang tải lịch họp...
          </Text>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.list, filtered.length === 0 && { flex: 1 }]}
        ListEmptyComponent={renderEmpty}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchMeetings(true)}
            colors={[COLORS.PRIMARY]}
            tintColor={COLORS.PRIMARY}
          />
        }
      />
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  tabBtn: { paddingVertical: 14, marginRight: 24 },
  tabText: { fontSize: 15, fontWeight: "600" },

  list: { padding: 16, gap: 14 },
  loadingBox: { alignItems: "center", marginTop: 60, gap: 12 },
  loadingText: { fontSize: 14 },
  emptyBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { fontSize: 15, textAlign: "center", paddingHorizontal: 32 },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 4,
  },
  retryText: { fontSize: 14, fontWeight: "600" },
  emptyTitle: { fontSize: 16, fontWeight: "700", textAlign: "center" },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    alignItems: "flex-start",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
    flex: 1,
  },
  badgeRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  confirmBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  confirmText: { fontSize: 12, fontWeight: "600" },
  metaRow: { borderTopWidth: 1, padding: 12, gap: 6 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 13, flex: 1 },
});

export default MeetingListScreen;
