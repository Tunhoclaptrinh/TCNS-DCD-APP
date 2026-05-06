import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";
import { useTheme } from "@/src/hooks/useTheme";

const ManageMeetingScreen = ({ navigation, route }: any) => {
  const { colors, isDark } = useTheme();
  const isEdit = !!route?.params?.meetingId;

  const [title, setTitle] = useState(isEdit ? "Họp tổng kết tháng 4" : "");
  const [date, setDate] = useState(isEdit ? "08/05/2026" : "");
  const [time, setTime] = useState(isEdit ? "14:00" : "");
  const [endTime, setEndTime] = useState(isEdit ? "16:00" : "");
  const [location, setLocation] = useState(isEdit ? "Phòng họp A, Tòa nhà A1" : "");
  const [content, setContent] = useState(isEdit ? "Tổng kết kết quả hoạt động tháng 4..." : "");

  const isValid = title.trim() && date.trim() && time.trim() && location.trim();

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Banner */}
        <View style={[styles.banner, { backgroundColor: COLORS.PRIMARY }]}>
          <Ionicons name={isEdit ? "create" : "add-circle"} size={32} color="rgba(255,255,255,0.9)" />
          <Text style={styles.bannerTitle}>{isEdit ? "Chỉnh sửa lịch họp" : "Tạo lịch họp mới"}</Text>
        </View>

        {/* Fields */}
        <Field label="Tiêu đề cuộc họp *" colors={colors}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER, color: colors.TEXT_PRIMARY }]}
            placeholder="VD: Họp tổng kết tháng 5"
            placeholderTextColor={colors.TEXT_SECONDARY}
            value={title}
            onChangeText={setTitle}
          />
        </Field>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Ngày họp *" colors={colors}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER, color: colors.TEXT_PRIMARY }]}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={colors.TEXT_SECONDARY}
                value={date}
                onChangeText={setDate}
              />
            </Field>
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Giờ bắt đầu *" colors={colors}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER, color: colors.TEXT_PRIMARY }]}
                placeholder="HH:MM"
                placeholderTextColor={colors.TEXT_SECONDARY}
                value={time}
                onChangeText={setTime}
              />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Giờ kết thúc" colors={colors}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER, color: colors.TEXT_PRIMARY }]}
                placeholder="HH:MM"
                placeholderTextColor={colors.TEXT_SECONDARY}
                value={endTime}
                onChangeText={setEndTime}
              />
            </Field>
          </View>
        </View>

        <Field label="Địa điểm *" colors={colors}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER, color: colors.TEXT_PRIMARY }]}
            placeholder="VD: Phòng họp A, Tòa nhà A1"
            placeholderTextColor={colors.TEXT_SECONDARY}
            value={location}
            onChangeText={setLocation}
          />
        </Field>

        <Field label="Nội dung / Chương trình họp" colors={colors}>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER, color: colors.TEXT_PRIMARY }]}
            placeholder="Mô tả nội dung và chương trình của cuộc họp..."
            placeholderTextColor={colors.TEXT_SECONDARY}
            multiline
            numberOfLines={5}
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />
        </Field>

        {/* Info */}
        <View style={[styles.infoBox, { backgroundColor: isDark ? "#1a2a3a" : "#EBF5FF" }]}>
          <Ionicons name="information-circle-outline" size={18} color="#1976D2" />
          <Text style={[styles.infoText, { color: isDark ? "#64B5F6" : "#1565C0" }]}>
            Sau khi tạo, thông báo tự động sẽ được gửi đến toàn bộ thành viên.
          </Text>
        </View>

        {/* Buttons */}
        {isEdit && (
          <TouchableOpacity style={[styles.deleteBtn, { borderColor: COLORS.ERROR }]} onPress={() => navigation.goBack()}>
            <Ionicons name="trash-outline" size={18} color={COLORS.ERROR} />
            <Text style={[styles.deleteBtnText, { color: COLORS.ERROR }]}>Xóa lịch họp này</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: isValid ? COLORS.PRIMARY : colors.BORDER }]}
          disabled={!isValid}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name={isEdit ? "save" : "send"} size={18} color={isValid ? COLORS.WHITE : colors.TEXT_SECONDARY} />
          <Text style={[styles.submitText, { color: isValid ? COLORS.WHITE : colors.TEXT_SECONDARY }]}>
            {isEdit ? "Lưu thay đổi" : "Tạo lịch họp"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const Field = ({ label, children, colors }: any) => (
  <View style={styles.fieldGroup}>
    <Text style={[styles.fieldLabel, { color: colors.TEXT_PRIMARY }]}>{label}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  banner: {
    borderRadius: 16, padding: 20, alignItems: "center", gap: 8, marginBottom: 20,
    shadowColor: COLORS.PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  bannerTitle: { color: COLORS.WHITE, fontSize: 18, fontWeight: "800" },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: {
    borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14,
  },
  textArea: {
    borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, minHeight: 120,
  },
  row: { flexDirection: "row", gap: 12 },
  infoBox: {
    flexDirection: "row", gap: 10, padding: 14, borderRadius: 12,
    alignItems: "flex-start", marginBottom: 16,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 20 },
  deleteBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, marginBottom: 12,
  },
  deleteBtnText: { fontSize: 15, fontWeight: "700" },
  submitBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 16, borderRadius: 14,
    shadowColor: COLORS.PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  submitText: { fontSize: 16, fontWeight: "700" },
});

export default ManageMeetingScreen;
