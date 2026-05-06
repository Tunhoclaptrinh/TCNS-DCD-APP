import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";
import { useTheme } from "@/src/hooks/useTheme";

const CRITERIA = [
  { id: "attendance", label: "Tham gia trực đủ số ca quy định", maxPoints: 5 },
  { id: "meeting", label: "Tham gia đủ các buổi họp đội", maxPoints: 3 },
  { id: "discipline", label: "Chấp hành kỷ luật, không bị phạt", maxPoints: 4 },
  { id: "extra", label: "Hoạt động ngoại khóa, đóng góp thêm", maxPoints: 3 },
];

const RegisterBonusScreen = ({ navigation, route }: any) => {
  const { colors, isDark } = useTheme();
  const [selectedCriteria, setSelectedCriteria] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");
  const [evidenceNote, setEvidenceNote] = useState("");

  const toggleCriteria = (id: string) => {
    setSelectedCriteria((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalPoints = CRITERIA
    .filter((c) => selectedCriteria.has(c.id))
    .reduce((acc, c) => acc + c.maxPoints, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Campaign Info */}
        <View style={[styles.campaignCard, { backgroundColor: COLORS.PRIMARY }]}>
          <Text style={styles.campaignTitle}>Đăng ký điểm rèn luyện HK2/2025-2026</Text>
          <View style={styles.campaignMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.metaText}>Hạn: 20/05/2026</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="star-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.metaText}>Tối đa 15 điểm</Text>
            </View>
          </View>
        </View>

        {/* Points Counter */}
        <View style={[styles.pointsBox, { backgroundColor: colors.CARD_BG, borderColor: COLORS.PRIMARY }]}>
          <Text style={[styles.pointsLabel, { color: colors.TEXT_SECONDARY }]}>Điểm dự kiến</Text>
          <Text style={[styles.pointsValue, { color: COLORS.PRIMARY }]}>{totalPoints} / 15</Text>
        </View>

        {/* Criteria Selection */}
        <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>Tiêu chí đăng ký</Text>
        {CRITERIA.map((c) => {
          const isSelected = selectedCriteria.has(c.id);
          return (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.criteriaItem,
                { backgroundColor: colors.CARD_BG, borderColor: isSelected ? COLORS.PRIMARY : colors.BORDER },
              ]}
              onPress={() => toggleCriteria(c.id)}
            >
              <View style={[
                styles.checkbox,
                isSelected
                  ? { backgroundColor: COLORS.PRIMARY, borderColor: COLORS.PRIMARY }
                  : { backgroundColor: "transparent", borderColor: colors.BORDER },
              ]}>
                {isSelected && <Ionicons name="checkmark" size={14} color={COLORS.WHITE} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.criteriaLabel, { color: colors.TEXT_PRIMARY }]}>{c.label}</Text>
              </View>
              <Text style={[styles.criteriaPoints, { color: isSelected ? COLORS.PRIMARY : colors.TEXT_SECONDARY }]}>
                +{c.maxPoints}đ
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Evidence */}
        <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>Minh chứng</Text>
        <TouchableOpacity style={[styles.uploadBox, { backgroundColor: colors.CARD_BG, borderColor: COLORS.PRIMARY }]}>
          <Ionicons name="cloud-upload-outline" size={36} color={COLORS.PRIMARY} />
          <Text style={[styles.uploadTitle, { color: colors.TEXT_PRIMARY }]}>Tải lên minh chứng</Text>
          <Text style={[styles.uploadHint, { color: colors.TEXT_SECONDARY }]}>
            Hỗ trợ ảnh hoặc PDF, tối đa 10MB/file
          </Text>
        </TouchableOpacity>

        <TextInput
          style={[styles.textArea, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER, color: colors.TEXT_PRIMARY }]}
          placeholder="Ghi chú về minh chứng (nếu có)..."
          placeholderTextColor={colors.TEXT_SECONDARY}
          multiline
          numberOfLines={3}
          value={evidenceNote}
          onChangeText={setEvidenceNote}
        />

        {/* Notes */}
        <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>Ghi chú thêm</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER, color: colors.TEXT_PRIMARY }]}
          placeholder="Nhập ghi chú thêm cho chuyên viên xét duyệt..."
          placeholderTextColor={colors.TEXT_SECONDARY}
          multiline
          numberOfLines={4}
          value={notes}
          onChangeText={setNotes}
        />

        {/* Submit */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            { backgroundColor: selectedCriteria.size > 0 ? COLORS.PRIMARY : colors.BORDER },
          ]}
          disabled={selectedCriteria.size === 0}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="send" size={18} color={selectedCriteria.size > 0 ? COLORS.WHITE : colors.TEXT_SECONDARY} />
          <Text style={[
            styles.submitText,
            { color: selectedCriteria.size > 0 ? COLORS.WHITE : colors.TEXT_SECONDARY },
          ]}>
            Nộp đơn đăng ký
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
  campaignCard: {
    borderRadius: 16, padding: 20, marginBottom: 16,
    shadowColor: COLORS.PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  campaignTitle: { color: COLORS.WHITE, fontSize: 16, fontWeight: "700", marginBottom: 12 },
  campaignMeta: { flexDirection: "row", gap: 16 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
  pointsBox: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 16, borderRadius: 14, borderWidth: 2, marginBottom: 20,
  },
  pointsLabel: { fontSize: 14, fontWeight: "600" },
  pointsValue: { fontSize: 24, fontWeight: "800" },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 10 },
  criteriaItem: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 12, borderWidth: 1.5, marginBottom: 10,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    justifyContent: "center", alignItems: "center",
  },
  criteriaLabel: { fontSize: 14, lineHeight: 20 },
  criteriaPoints: { fontSize: 15, fontWeight: "700" },
  uploadBox: {
    borderRadius: 14, borderWidth: 2, borderStyle: "dashed",
    padding: 24, alignItems: "center", gap: 8, marginBottom: 12,
  },
  uploadTitle: { fontSize: 15, fontWeight: "600" },
  uploadHint: { fontSize: 12 },
  textArea: {
    borderRadius: 12, borderWidth: 1, padding: 14,
    fontSize: 14, textAlignVertical: "top", marginBottom: 16,
    minHeight: 80,
  },
  submitBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 16, borderRadius: 14,
    shadowColor: COLORS.PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  submitText: { fontSize: 16, fontWeight: "700" },
});

export default RegisterBonusScreen;
