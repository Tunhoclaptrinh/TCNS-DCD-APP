import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";
import { useTheme } from "@/src/hooks/useTheme";

const MOCK_MEETING = {
  id: 1,
  title: "Họp tổng kết tháng 4",
  date: "08/05/2026",
  time: "14:00 - 16:00",
  location: "Phòng họp A, Tòa nhà A1",
  organizer: "Nguyễn Văn An - Chuyên viên",
  content: "Tổng kết kết quả hoạt động tháng 4, đánh giá tình hình thực hiện nhiệm vụ và triển khai kế hoạch tháng 5. Các thành viên cần chuẩn bị báo cáo cá nhân trước buổi họp.",
  attendeesConfirmed: 18,
  attendeesTotal: 24,
  confirmed: null as null | "yes" | "no",
};

const MeetingDetailScreen = ({ navigation, route }: any) => {
  const { colors, isDark } = useTheme();
  const [confirmed, setConfirmed] = useState<null | "yes" | "no">(MOCK_MEETING.confirmed);

  const handleConfirm = (value: "yes" | "no") => {
    Alert.alert(
      value === "yes" ? "Xác nhận tham gia" : "Từ chối tham gia",
      value === "yes" ? "Bạn xác nhận sẽ tham gia cuộc họp này?" : "Bạn xác nhận sẽ không tham gia cuộc họp này?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xác nhận", onPress: () => setConfirmed(value) },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header Card */}
        <View style={[styles.headerCard, { backgroundColor: COLORS.PRIMARY }]}>
          <Ionicons name="people" size={36} color="rgba(255,255,255,0.9)" />
          <Text style={styles.headerTitle}>{MOCK_MEETING.title}</Text>
          <View style={styles.headerMeta}>
            <Ionicons name="calendar" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.headerMetaText}>{MOCK_MEETING.date} • {MOCK_MEETING.time}</Text>
          </View>
        </View>

        {/* Info Section */}
        <View style={[styles.infoCard, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}>
          <InfoRow icon="location" label="Địa điểm" value={MOCK_MEETING.location} colors={colors} />
          <InfoRow icon="person" label="Người tổ chức" value={MOCK_MEETING.organizer} colors={colors} />
          <View style={styles.attendeeRow}>
            <View style={styles.infoItem}>
              <Ionicons name="people-outline" size={16} color={COLORS.PRIMARY} />
              <Text style={[styles.infoLabel, { color: colors.TEXT_SECONDARY }]}>Đã xác nhận</Text>
            </View>
            <View style={styles.attendeeStats}>
              <Text style={[styles.attendeeNumber, { color: colors.TEXT_PRIMARY }]}>
                <Text style={{ color: COLORS.SUCCESS }}>{MOCK_MEETING.attendeesConfirmed}</Text>/{MOCK_MEETING.attendeesTotal}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(MOCK_MEETING.attendeesConfirmed / MOCK_MEETING.attendeesTotal) * 100}%` as any },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={[styles.contentCard, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}>
          <Text style={[styles.contentTitle, { color: colors.TEXT_PRIMARY }]}>Nội dung cuộc họp</Text>
          <Text style={[styles.contentBody, { color: colors.TEXT_SECONDARY }]}>{MOCK_MEETING.content}</Text>
        </View>

        {/* Confirm Status */}
        {confirmed && (
          <View style={[
            styles.confirmedBanner,
            { backgroundColor: confirmed === "yes" ? (isDark ? "#1a3a1a" : "#E8F5E9") : (isDark ? "#3a1a1a" : "#FFEBEE") },
          ]}>
            <Ionicons
              name={confirmed === "yes" ? "checkmark-circle" : "close-circle"}
              size={20}
              color={confirmed === "yes" ? COLORS.SUCCESS : COLORS.ERROR}
            />
            <Text style={{ color: confirmed === "yes" ? COLORS.SUCCESS : COLORS.ERROR, fontSize: 14, fontWeight: "600" }}>
              {confirmed === "yes" ? "Bạn đã xác nhận tham gia" : "Bạn đã từ chối tham gia"}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { borderColor: COLORS.ERROR, backgroundColor: confirmed === "no" ? COLORS.ERROR : "transparent" },
            ]}
            onPress={() => handleConfirm("no")}
          >
            <Ionicons name="close" size={18} color={confirmed === "no" ? COLORS.WHITE : COLORS.ERROR} />
            <Text style={[styles.actionBtnText, { color: confirmed === "no" ? COLORS.WHITE : COLORS.ERROR }]}>
              Từ chối
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { borderColor: COLORS.PRIMARY, backgroundColor: confirmed === "yes" ? COLORS.PRIMARY : "transparent" },
            ]}
            onPress={() => handleConfirm("yes")}
          >
            <Ionicons name="checkmark" size={18} color={confirmed === "yes" ? COLORS.WHITE : COLORS.PRIMARY} />
            <Text style={[styles.actionBtnText, { color: confirmed === "yes" ? COLORS.WHITE : COLORS.PRIMARY }]}>
              Tham gia
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const InfoRow = ({ icon, label, value, colors }: any) => (
  <View style={styles.infoItem}>
    <Ionicons name={icon as any} size={16} color={COLORS.PRIMARY} />
    <View style={{ flex: 1 }}>
      <Text style={[styles.infoLabel, { color: colors.TEXT_SECONDARY }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.TEXT_PRIMARY }]}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 14 },
  headerCard: {
    borderRadius: 20, padding: 24, alignItems: "center", gap: 10,
    shadowColor: COLORS.PRIMARY, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  headerTitle: {
    color: COLORS.WHITE, fontSize: 20, fontWeight: "800", textAlign: "center",
  },
  headerMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerMetaText: { color: "rgba(255,255,255,0.85)", fontSize: 14 },
  infoCard: {
    borderRadius: 16, borderWidth: 1, padding: 16, gap: 14,
  },
  infoItem: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  infoLabel: { fontSize: 12, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: "600" },
  attendeeRow: { gap: 8 },
  attendeeStats: { gap: 6 },
  attendeeNumber: { fontSize: 15, fontWeight: "700" },
  progressBar: {
    height: 6, backgroundColor: "#E0E0E0", borderRadius: 3, overflow: "hidden",
  },
  progressFill: {
    height: 6, backgroundColor: COLORS.SUCCESS, borderRadius: 3,
  },
  contentCard: { borderRadius: 16, borderWidth: 1, padding: 16 },
  contentTitle: { fontSize: 15, fontWeight: "700", marginBottom: 8 },
  contentBody: { fontSize: 14, lineHeight: 22 },
  confirmedBanner: {
    flexDirection: "row", alignItems: "center", gap: 10,
    padding: 12, borderRadius: 12,
  },
  actionRow: { flexDirection: "row", gap: 12, marginTop: 4 },
  actionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 2,
  },
  actionBtnText: { fontSize: 15, fontWeight: "700" },
});

export default MeetingDetailScreen;
