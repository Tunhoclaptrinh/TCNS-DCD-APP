import React from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";
import { useTheme } from "@/src/hooks/useTheme";

const FORM_TYPES = [
  {
    id: "leave",
    title: "Đơn xin nghỉ học",
    description: "Xin phép vắng mặt tại ca trực hoặc buổi học",
    icon: "document-text",
    color: "#1976D2",
    bg: "#E3F2FD",
  },
  {
    id: "shift_swap",
    title: "Đơn xin đổi ca",
    description: "Yêu cầu hoán đổi ca trực với thành viên khác",
    icon: "swap-horizontal",
    color: "#F57C00",
    bg: "#FFF3E0",
  },
  {
    id: "confirm",
    title: "Giấy xác nhận",
    description: "Yêu cầu cấp giấy xác nhận tham gia đội Cờ Đỏ",
    icon: "ribbon",
    color: "#8E24AA",
    bg: "#F3E5F5",
  },
  {
    id: "other",
    title: "Đơn khác",
    description: "Các loại đơn từ khác không có trong danh sách trên",
    icon: "create",
    color: COLORS.PRIMARY,
    bg: "#FFEBEE",
  },
];

const MY_FORMS = [
  { id: 1, type: "Đơn xin nghỉ học", date: "28/04/2026", status: "approved" },
  { id: 2, type: "Đơn xin đổi ca", date: "15/04/2026", status: "pending" },
  { id: 3, type: "Giấy xác nhận", date: "01/04/2026", status: "rejected" },
];

const FormListScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "approved": return { color: COLORS.SUCCESS, label: "Đã duyệt", icon: "checkmark-circle" as const };
      case "rejected": return { color: COLORS.ERROR, label: "Từ chối", icon: "close-circle" as const };
      default: return { color: COLORS.WARNING, label: "Đang xét", icon: "time" as const };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* New Form */}
        <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>Tạo đơn mới</Text>
        <View style={styles.formGrid}>
          {FORM_TYPES.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.formCard, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}
              onPress={() => navigation.navigate("SubmitForm", { formType: f.id })}
              activeOpacity={0.75}
            >
              <View style={[styles.formIconBox, { backgroundColor: isDark ? "#2a2a2a" : f.bg }]}>
                <Ionicons name={f.icon as any} size={28} color={f.color} />
              </View>
              <Text style={[styles.formTitle, { color: colors.TEXT_PRIMARY }]}>{f.title}</Text>
              <Text style={[styles.formDesc, { color: colors.TEXT_SECONDARY }]}>{f.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* My submitted forms */}
        <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>Đơn đã gửi</Text>
        {MY_FORMS.map((form) => {
          const { color, label, icon } = getStatusStyle(form.status);
          return (
            <View
              key={form.id}
              style={[styles.myFormCard, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.myFormType, { color: colors.TEXT_PRIMARY }]}>{form.type}</Text>
                <Text style={[styles.myFormDate, { color: colors.TEXT_SECONDARY }]}>Ngày gửi: {form.date}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: color + "20" }]}>
                <Ionicons name={icon} size={14} color={color} />
                <Text style={[styles.statusText, { color }]}>{label}</Text>
              </View>
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
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 14 },
  formGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  formCard: {
    width: "47%", padding: 16, borderRadius: 16, borderWidth: 1, gap: 10,
    alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  formIconBox: {
    width: 56, height: 56, borderRadius: 16, justifyContent: "center", alignItems: "center",
  },
  formTitle: { fontSize: 13, fontWeight: "700", textAlign: "center" },
  formDesc: { fontSize: 11, textAlign: "center", lineHeight: 16 },
  myFormCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10,
  },
  myFormType: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  myFormDate: { fontSize: 12 },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  statusText: { fontSize: 12, fontWeight: "600" },
});

export default FormListScreen;
