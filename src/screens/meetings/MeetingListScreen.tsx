import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";
import { useTheme } from "@/src/hooks/useTheme";

const MOCK_MEETINGS = [
  {
    id: 1,
    title: "Họp tổng kết tháng 4",
    date: "08/05/2026",
    time: "14:00",
    location: "Phòng họp A, Tòa nhà A1",
    attendees: 24,
    status: "upcoming",
    confirmed: null,
  },
  {
    id: 2,
    title: "Họp giao ban tuần 19",
    date: "06/05/2026",
    time: "09:00",
    location: "Phòng họp B, Tòa nhà A1",
    attendees: 12,
    status: "upcoming",
    confirmed: "yes",
  },
  {
    id: 3,
    title: "Họp triển khai kế hoạch học kỳ II",
    date: "28/04/2026",
    time: "15:30",
    location: "Hội trường lớn",
    attendees: 50,
    status: "past",
    confirmed: "yes",
  },
  {
    id: 4,
    title: "Họp ban chấp hành mở rộng",
    date: "20/04/2026",
    time: "14:00",
    location: "Phòng họp C",
    attendees: 8,
    status: "past",
    confirmed: "no",
  },
];

const MeetingListScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const filtered = MOCK_MEETINGS.filter((m) => m.status === tab);

  const getConfirmStyle = (confirmed: string | null) => {
    if (confirmed === "yes") return { color: COLORS.SUCCESS, label: "Đã xác nhận", icon: "checkmark-circle" as const };
    if (confirmed === "no") return { color: COLORS.ERROR, label: "Từ chối", icon: "close-circle" as const };
    return { color: COLORS.WARNING, label: "Chờ xác nhận", icon: "time" as const };
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.CARD_BG, borderBottomColor: colors.BORDER }]}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === "upcoming" && { borderBottomColor: COLORS.PRIMARY, borderBottomWidth: 2 }]}
          onPress={() => setTab("upcoming")}
        >
          <Text style={[styles.tabText, { color: tab === "upcoming" ? COLORS.PRIMARY : colors.TEXT_SECONDARY }]}>
            Sắp tới
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === "past" && { borderBottomColor: COLORS.PRIMARY, borderBottomWidth: 2 }]}
          onPress={() => setTab("past")}
        >
          <Text style={[styles.tabText, { color: tab === "past" ? COLORS.PRIMARY : colors.TEXT_SECONDARY }]}>
            Đã qua
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="calendar-outline" size={56} color={colors.BORDER} />
            <Text style={[styles.emptyText, { color: colors.TEXT_SECONDARY }]}>Không có cuộc họp</Text>
          </View>
        }
        renderItem={({ item }) => {
          const { color, label, icon } = getConfirmStyle(item.confirmed);
          return (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}
              onPress={() => navigation.navigate("MeetingDetail", { meetingId: item.id.toString() })}
              activeOpacity={0.75}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: isDark ? "#1a2a3a" : "#E3F2FD" }]}>
                  <Ionicons name="people" size={24} color="#1976D2" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: colors.TEXT_PRIMARY }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <View style={[styles.confirmBadge, { backgroundColor: color + "20" }]}>
                    <Ionicons name={icon} size={12} color={color} />
                    <Text style={[styles.confirmText, { color }]}>{label}</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.metaRow, { borderTopColor: colors.BORDER }]}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={14} color={colors.TEXT_SECONDARY} />
                  <Text style={[styles.metaText, { color: colors.TEXT_SECONDARY }]}>{item.date} - {item.time}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={14} color={colors.TEXT_SECONDARY} />
                  <Text style={[styles.metaText, { color: colors.TEXT_SECONDARY }]} numberOfLines={1}>{item.location}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="people-outline" size={14} color={colors.TEXT_SECONDARY} />
                  <Text style={[styles.metaText, { color: colors.TEXT_SECONDARY }]}>{item.attendees} người tham dự</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: {
    flexDirection: "row", borderBottomWidth: 1, paddingHorizontal: 16,
  },
  tabBtn: { paddingVertical: 14, marginRight: 24 },
  tabText: { fontSize: 15, fontWeight: "600" },
  list: { padding: 16, gap: 14 },
  emptyBox: { alignItems: "center", marginTop: 60, gap: 12 },
  emptyText: { fontSize: 15 },
  card: {
    borderRadius: 16, borderWidth: 1, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardHeader: { flexDirection: "row", gap: 12, padding: 14, alignItems: "flex-start" },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  cardTitle: { fontSize: 15, fontWeight: "700", marginBottom: 6, flex: 1 },
  confirmBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: "flex-start" },
  confirmText: { fontSize: 12, fontWeight: "600" },
  metaRow: { borderTopWidth: 1, padding: 12, gap: 6 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 13 },
});

export default MeetingListScreen;
