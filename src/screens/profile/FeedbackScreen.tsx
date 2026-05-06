import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";
import { useTheme } from "@/src/hooks/useTheme";

const CATEGORIES = [
  { id: "operation", label: "Vận hành đội", icon: "settings-outline" },
  { id: "activity", label: "Hoạt động & sự kiện", icon: "calendar-outline" },
  { id: "welfare", label: "Đời sống thành viên", icon: "heart-outline" },
  { id: "other", label: "Khác", icon: "chatbubble-outline" },
];

const FeedbackScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const isValid = selectedCategory && content.trim().length >= 10;

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={[styles.headerCard, { backgroundColor: COLORS.PRIMARY }]}>
          <Ionicons name="megaphone" size={36} color="rgba(255,255,255,0.9)" />
          <Text style={styles.headerTitle}>Đóng góp ý kiến</Text>
          <Text style={styles.headerSub}>
            Ý kiến của bạn sẽ giúp đội Cờ Đỏ hoạt động ngày càng tốt hơn.
          </Text>
        </View>

        {/* Category */}
        <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>Lĩnh vực</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.catItem,
                  {
                    backgroundColor: isSelected ? COLORS.PRIMARY : colors.CARD_BG,
                    borderColor: isSelected ? COLORS.PRIMARY : colors.BORDER,
                  },
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={22}
                  color={isSelected ? COLORS.WHITE : colors.TEXT_SECONDARY}
                />
                <Text style={[styles.catLabel, { color: isSelected ? COLORS.WHITE : colors.TEXT_PRIMARY }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Content */}
        <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>
          Nội dung <Text style={{ color: COLORS.ERROR }}>*</Text>
        </Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER, color: colors.TEXT_PRIMARY }]}
          placeholder="Nhập ý kiến, đề xuất hoặc phản hồi của bạn tại đây (tối thiểu 10 ký tự)..."
          placeholderTextColor={colors.TEXT_SECONDARY}
          multiline
          numberOfLines={6}
          value={content}
          onChangeText={setContent}
          textAlignVertical="top"
        />
        <Text style={[styles.charCount, { color: content.length >= 10 ? COLORS.SUCCESS : colors.TEXT_SECONDARY }]}>
          {content.length} ký tự {content.length < 10 && `(tối thiểu 10)`}
        </Text>

        {/* Anonymous toggle */}
        <TouchableOpacity
          style={[styles.anonRow, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}
          onPress={() => setIsAnonymous(!isAnonymous)}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.anonTitle, { color: colors.TEXT_PRIMARY }]}>Gửi ẩn danh</Text>
            <Text style={[styles.anonDesc, { color: colors.TEXT_SECONDARY }]}>
              Tên của bạn sẽ không hiển thị với ban quản lý
            </Text>
          </View>
          <View style={[
            styles.toggleTrack,
            { backgroundColor: isAnonymous ? COLORS.PRIMARY : colors.BORDER },
          ]}>
            <View style={[styles.toggleThumb, { left: isAnonymous ? 22 : 2 }]} />
          </View>
        </TouchableOpacity>

        {/* Note */}
        <View style={[styles.noteBox, { backgroundColor: isDark ? "#1a2a3a" : "#EBF5FF" }]}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#1976D2" />
          <Text style={[styles.noteText, { color: isDark ? "#64B5F6" : "#1565C0" }]}>
            Mọi ý kiến đều được ghi nhận và xem xét nghiêm túc. Không sử dụng ngôn từ không phù hợp.
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
            Gửi ý kiến
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
  headerCard: {
    borderRadius: 20, padding: 24, alignItems: "center", gap: 8, marginBottom: 20,
    shadowColor: COLORS.PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  headerTitle: { color: COLORS.WHITE, fontSize: 20, fontWeight: "800" },
  headerSub: { color: "rgba(255,255,255,0.8)", fontSize: 13, textAlign: "center" },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 12 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  catItem: {
    width: "47%", padding: 14, borderRadius: 14, borderWidth: 1.5,
    alignItems: "center", gap: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  catLabel: { fontSize: 13, fontWeight: "600", textAlign: "center" },
  textArea: {
    borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 14,
    minHeight: 120, marginBottom: 6,
  },
  charCount: { fontSize: 12, textAlign: "right", marginBottom: 16 },
  anonRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 16,
  },
  anonTitle: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  anonDesc: { fontSize: 12 },
  toggleTrack: {
    width: 48, height: 26, borderRadius: 13, position: "relative",
  },
  toggleThumb: {
    position: "absolute", top: 3,
    width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.WHITE,
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

export default FeedbackScreen;
