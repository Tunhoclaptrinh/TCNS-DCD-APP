import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";
import { useTheme } from "@/src/hooks/useTheme";

const FORM_CONFIGS: Record<string, { title: string; fields: Array<{ key: string; label: string; placeholder: string; multiline?: boolean }> }> = {
  leave: {
    title: "Đơn xin nghỉ học",
    fields: [
      { key: "date", label: "Ngày xin nghỉ", placeholder: "VD: 10/05/2026" },
      { key: "shift", label: "Ca trực / Buổi học", placeholder: "VD: Ca sáng 7:00 - 11:00" },
      { key: "reason", label: "Lý do", placeholder: "Nêu rõ lý do xin nghỉ...", multiline: true },
    ],
  },
  shift_swap: {
    title: "Đơn xin đổi ca",
    fields: [
      { key: "my_shift", label: "Ca trực của tôi", placeholder: "VD: Ca sáng 07/05/2026" },
      { key: "swap_with", label: "Đổi với thành viên", placeholder: "Nhập tên hoặc MSSV" },
      { key: "swap_shift", label: "Ca trực đổi lại", placeholder: "VD: Ca chiều 08/05/2026" },
      { key: "reason", label: "Lý do", placeholder: "Nêu rõ lý do đổi ca...", multiline: true },
    ],
  },
  confirm: {
    title: "Giấy xác nhận",
    fields: [
      { key: "purpose", label: "Mục đích", placeholder: "VD: Xin học bổng, xét đặc cách..." },
      { key: "note", label: "Ghi chú thêm", placeholder: "Thông tin bổ sung nếu có...", multiline: true },
    ],
  },
  other: {
    title: "Đơn khác",
    fields: [
      { key: "title", label: "Tiêu đề đơn", placeholder: "VD: Đơn xin miễn giảm phạt" },
      { key: "content", label: "Nội dung", placeholder: "Trình bày nội dung chi tiết...", multiline: true },
    ],
  },
};

const SubmitFormScreen = ({ navigation, route }: any) => {
  const { colors, isDark } = useTheme();
  const formType = route?.params?.formType || "leave";
  const config = FORM_CONFIGS[formType] || FORM_CONFIGS["leave"];
  const [values, setValues] = useState<Record<string, string>>({});

  const setValue = (key: string, val: string) =>
    setValues((prev) => ({ ...prev, [key]: val }));

  const isValid = config.fields.every((f) => values[f.key]?.trim());

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Title Banner */}
        <View style={[styles.banner, { backgroundColor: COLORS.PRIMARY }]}>
          <Ionicons name="document-text" size={32} color="rgba(255,255,255,0.9)" />
          <Text style={styles.bannerTitle}>{config.title}</Text>
          <Text style={styles.bannerSub}>Điền đầy đủ thông tin và gửi để chuyên viên xét duyệt</Text>
        </View>

        {/* Auto-filled info */}
        <View style={[styles.autoFillCard, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}>
          <Text style={[styles.autoFillTitle, { color: colors.TEXT_SECONDARY }]}>Thông tin người gửi (tự động điền)</Text>
          <View style={styles.autoFillRow}>
            <Text style={[styles.autoFillLabel, { color: colors.TEXT_SECONDARY }]}>Họ tên:</Text>
            <Text style={[styles.autoFillValue, { color: colors.TEXT_PRIMARY }]}>Nguyễn Văn A</Text>
          </View>
          <View style={styles.autoFillRow}>
            <Text style={[styles.autoFillLabel, { color: colors.TEXT_SECONDARY }]}>MSSV:</Text>
            <Text style={[styles.autoFillValue, { color: colors.TEXT_PRIMARY }]}>B21DCDT001</Text>
          </View>
          <View style={styles.autoFillRow}>
            <Text style={[styles.autoFillLabel, { color: colors.TEXT_SECONDARY }]}>Ngày gửi:</Text>
            <Text style={[styles.autoFillValue, { color: colors.TEXT_PRIMARY }]}>06/05/2026</Text>
          </View>
        </View>

        {/* Form Fields */}
        {config.fields.map((field) => (
          <View key={field.key} style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.TEXT_PRIMARY }]}>
              {field.label} <Text style={{ color: COLORS.ERROR }}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER, color: colors.TEXT_PRIMARY },
                field.multiline && styles.textArea,
              ]}
              placeholder={field.placeholder}
              placeholderTextColor={colors.TEXT_SECONDARY}
              multiline={field.multiline}
              numberOfLines={field.multiline ? 4 : 1}
              value={values[field.key] || ""}
              onChangeText={(v) => setValue(field.key, v)}
            />
          </View>
        ))}

        {/* Info Note */}
        <View style={[styles.noteBox, { backgroundColor: isDark ? "#1a2a3a" : "#EBF5FF" }]}>
          <Ionicons name="information-circle-outline" size={18} color="#1976D2" />
          <Text style={[styles.noteText, { color: isDark ? "#64B5F6" : "#1565C0" }]}>
            Đơn sẽ được gửi đến chuyên viên phụ trách. Thời gian xét duyệt tối đa 3 ngày làm việc.
          </Text>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: isValid ? COLORS.PRIMARY : colors.BORDER }]}
          disabled={!isValid}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="send" size={18} color={isValid ? COLORS.WHITE : colors.TEXT_SECONDARY} />
          <Text style={[styles.submitText, { color: isValid ? COLORS.WHITE : colors.TEXT_SECONDARY }]}>
            Gửi đơn
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
  banner: {
    borderRadius: 16, padding: 20, alignItems: "center", gap: 8, marginBottom: 16,
    shadowColor: COLORS.PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  bannerTitle: { color: COLORS.WHITE, fontSize: 18, fontWeight: "800" },
  bannerSub: { color: "rgba(255,255,255,0.8)", fontSize: 13, textAlign: "center" },
  autoFillCard: {
    borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 16,
  },
  autoFillTitle: { fontSize: 12, fontWeight: "700", marginBottom: 10, textTransform: "uppercase" },
  autoFillRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  autoFillLabel: { fontSize: 13, width: 70 },
  autoFillValue: { fontSize: 13, fontWeight: "600" },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: {
    borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14,
  },
  textArea: {
    minHeight: 100, textAlignVertical: "top",
  },
  noteBox: {
    flexDirection: "row", gap: 10, padding: 14, borderRadius: 12,
    alignItems: "flex-start", marginBottom: 16,
  },
  noteText: { flex: 1, fontSize: 13, lineHeight: 20 },
  submitBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 16, borderRadius: 14,
    shadowColor: COLORS.PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  submitText: { fontSize: 16, fontWeight: "700" },
});

export default SubmitFormScreen;
