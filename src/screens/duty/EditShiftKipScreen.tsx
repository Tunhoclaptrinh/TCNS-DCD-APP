import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";
import { useTheme } from "@/src/hooks/useTheme";
import { DutyService } from "@/src/services/duty.service";

// ─── Field Component ──────────────────────────────────────────────────────────

const FormField = ({
  label, value, onChangeText, placeholder, colors, keyboardType = "default", editable = true,
}: any) => (
  <View style={styles.fieldGroup}>
    <Text style={[styles.fieldLabel, { color: colors.TEXT_SECONDARY }]}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.TEXT_SECONDARY}
      keyboardType={keyboardType}
      editable={editable}
      style={[
        styles.fieldInput,
        {
          color: colors.TEXT_PRIMARY,
          backgroundColor: editable ? colors.CARD_BG : (colors.BACKGROUND),
          borderColor: colors.BORDER,
        },
      ]}
    />
  </View>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const EditShiftKipScreen = ({ navigation, route }: any) => {
  const { colors, isDark } = useTheme();
  const { shiftId, kipId, weekStart } = route.params as {
    shiftId: number;
    kipId?: number;
    weekStart: string;
  };

  const isKipMode = !!kipId; // true = chỉnh kíp, false = chỉnh ca

  // ── State: Shift ────────────────────────────────────────────────────────────
  const [shiftName, setShiftName] = useState("");
  const [shiftStart, setShiftStart] = useState("");
  const [shiftEnd, setShiftEnd] = useState("");
  const [shiftNote, setShiftNote] = useState("");
  const [shiftStatus, setShiftStatus] = useState("open");

  // ── State: Kip ──────────────────────────────────────────────────────────────
  const [kipName, setKipName] = useState("");
  const [kipStart, setKipStart] = useState("");
  const [kipEnd, setKipEnd] = useState("");
  const [kipCapacity, setKipCapacity] = useState("1");
  const [kipCoefficient, setKipCoefficient] = useState("1");
  const [kipNote, setKipNote] = useState("");
  const [kipStatus, setKipStatus] = useState("open");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"shift" | "kip">(isKipMode ? "kip" : "shift");

  // ── Load existing data từ weekly schedule ──────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await DutyService.getWeeklySchedule(weekStart);
      const shifts: any[] = result.data?.templates ?? [];
      const slots: any[] = result.data?.slots ?? [];

      // Find shift
      const shift = shifts.find((s) => s.id === shiftId);
      if (shift) {
        setShiftName(shift.name ?? "");
        setShiftStart(shift.startTime ?? "");
        setShiftEnd(shift.endTime ?? "");
        setShiftNote(shift.note ?? "");
        setShiftStatus(shift.status ?? "open");
      }

      // Find kip via slot
      if (kipId) {
        const slot = slots.find((s) => s.kipId === kipId);
        // Find kip from shift.kips if available
        const kip = shift?.kips?.find((k: any) => k.id === kipId) || slot;
        if (kip) {
          setKipName(kip.name ?? kip.shiftLabel ?? "");
          setKipStart(kip.startTime ?? slot?.startTime ?? "");
          setKipEnd(kip.endTime ?? slot?.endTime ?? "");
          setKipCapacity(String(kip.capacity ?? slot?.capacity ?? 1));
          setKipCoefficient(String(kip.coefficient ?? 1));
          setKipNote(kip.note ?? "");
          setKipStatus(kip.status ?? "open");
        }
      }
    } catch (err: any) {
      Alert.alert("Lỗi", "Không thể tải dữ liệu ca trực");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [shiftId, kipId, weekStart]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Save shift ─────────────────────────────────────────────────────────────
  const saveShift = async () => {
    if (!shiftName.trim()) return Alert.alert("Lỗi", "Tên ca không được để trống");
    if (!shiftStart || !shiftEnd) return Alert.alert("Lỗi", "Vui lòng nhập giờ bắt đầu và kết thúc (HH:mm)");

    const timeRe = /^\d{2}:\d{2}$/;
    if (!timeRe.test(shiftStart) || !timeRe.test(shiftEnd))
      return Alert.alert("Lỗi", "Giờ phải có định dạng HH:mm (ví dụ: 07:00)");

    setSaving(true);
    try {
      await DutyService.updateShift(shiftId, {
        name: shiftName.trim(),
        startTime: shiftStart,
        endTime: shiftEnd,
        note: shiftNote.trim(),
        status: shiftStatus,
      });
      Alert.alert("✅ Thành công", "Đã cập nhật thông tin ca trực!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert("Lỗi", e?.response?.data?.message ?? e?.message ?? "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  // ── Save kip ───────────────────────────────────────────────────────────────
  const saveKip = async () => {
    if (!kipName.trim()) return Alert.alert("Lỗi", "Tên kíp không được để trống");
    const cap = parseInt(kipCapacity);
    const coef = parseFloat(kipCoefficient);
    if (isNaN(cap) || cap < 1) return Alert.alert("Lỗi", "Sĩ số phải lớn hơn 0");
    if (isNaN(coef) || coef <= 0) return Alert.alert("Lỗi", "Hệ số phải lớn hơn 0");

    const timeRe = /^\d{2}:\d{2}$/;
    if ((kipStart && !timeRe.test(kipStart)) || (kipEnd && !timeRe.test(kipEnd)))
      return Alert.alert("Lỗi", "Giờ phải có định dạng HH:mm");

    if (!kipId) return;
    setSaving(true);
    try {
      await DutyService.updateKip(kipId, {
        name: kipName.trim(),
        startTime: kipStart || undefined,
        endTime: kipEnd || undefined,
        capacity: cap,
        coefficient: coef,
        note: kipNote.trim(),
        status: kipStatus,
      });
      Alert.alert("✅ Thành công", "Đã cập nhật thông tin kíp!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert("Lỗi", e?.response?.data?.message ?? e?.message ?? "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete kip ─────────────────────────────────────────────────────────────
  const handleDeleteKip = () => {
    if (!kipId) return;
    Alert.alert(
      "Xóa kíp",
      `Bạn có chắc muốn xóa kíp "${kipName}"? Hành động này không thể hoàn tác.`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            setSaving(true);
            try {
              await DutyService.deleteKip(kipId);
              Alert.alert("✅ Đã xóa", "Kíp trực đã được xóa.", [
                { text: "OK", onPress: () => navigation.goBack() },
              ]);
            } catch (e: any) {
              Alert.alert("Lỗi", e?.response?.data?.message ?? "Xóa thất bại");
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.BACKGROUND }]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={[styles.loadingText, { color: colors.TEXT_SECONDARY }]}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.CARD_BG, borderBottomColor: colors.BORDER }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "shift" && { borderBottomColor: COLORS.PRIMARY }]}
          onPress={() => setActiveTab("shift")}
        >
          <Ionicons
            name="sunny-outline"
            size={18}
            color={activeTab === "shift" ? COLORS.PRIMARY : colors.TEXT_SECONDARY}
          />
          <Text style={[styles.tabText, { color: activeTab === "shift" ? COLORS.PRIMARY : colors.TEXT_SECONDARY }]}>
            Thông tin Ca
          </Text>
        </TouchableOpacity>
        {isKipMode && (
          <TouchableOpacity
            style={[styles.tab, activeTab === "kip" && { borderBottomColor: COLORS.PRIMARY }]}
            onPress={() => setActiveTab("kip")}
          >
            <Ionicons
              name="time-outline"
              size={18}
              color={activeTab === "kip" ? COLORS.PRIMARY : colors.TEXT_SECONDARY}
            />
            <Text style={[styles.tabText, { color: activeTab === "kip" ? COLORS.PRIMARY : colors.TEXT_SECONDARY }]}>
              Thông tin Kíp
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ── Shift Tab ── */}
        {activeTab === "shift" && (
          <View style={styles.section}>
            <View style={[styles.card, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="sunny" size={20} color={COLORS.PRIMARY} />
                <Text style={[styles.cardTitle, { color: colors.TEXT_PRIMARY }]}>Thông tin Ca trực</Text>
              </View>

              <FormField label="Tên ca *" value={shiftName} onChangeText={setShiftName} placeholder="Ví dụ: Ca Sáng" colors={colors} />

              <View style={styles.timeRow}>
                <View style={{ flex: 1 }}>
                  <FormField label="Giờ bắt đầu *" value={shiftStart} onChangeText={setShiftStart} placeholder="07:00" colors={colors} />
                </View>
                <View style={styles.timeSep}>
                  <Text style={[styles.timeSepText, { color: colors.TEXT_SECONDARY }]}>→</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <FormField label="Giờ kết thúc *" value={shiftEnd} onChangeText={setShiftEnd} placeholder="11:00" colors={colors} />
                </View>
              </View>

              <FormField label="Ghi chú" value={shiftNote} onChangeText={setShiftNote} placeholder="Ghi chú cho ca này..." colors={colors} />

              <View style={styles.switchRow}>
                <View>
                  <Text style={[styles.switchLabel, { color: colors.TEXT_PRIMARY }]}>Trạng thái</Text>
                  <Text style={[styles.switchDesc, { color: colors.TEXT_SECONDARY }]}>
                    {shiftStatus === "open" ? "Đang mở đăng ký" : "Đã khóa"}
                  </Text>
                </View>
                <Switch
                  value={shiftStatus === "open"}
                  onValueChange={(v) => setShiftStatus(v ? "open" : "locked")}
                  trackColor={{ false: colors.BORDER, true: COLORS.PRIMARY }}
                  thumbColor={COLORS.WHITE}
                />
              </View>
            </View>

            {/* Time hint */}
            <View style={[styles.hintBox, { backgroundColor: isDark ? "#1a2a1a" : "#E8F5E9" }]}>
              <Ionicons name="bulb-outline" size={16} color={COLORS.SUCCESS} />
              <Text style={[styles.hintText, { color: isDark ? COLORS.SUCCESS : "#2E7D32" }]}>
                Định dạng giờ: HH:mm (ví dụ: 07:00, 13:30). Giờ kíp phải nằm trong khung giờ ca.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: saving ? COLORS.GRAY : COLORS.PRIMARY }]}
              onPress={saveShift}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={COLORS.WHITE} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.WHITE} />
                  <Text style={styles.saveBtnText}>Lưu thông tin Ca</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ── Kip Tab ── */}
        {activeTab === "kip" && isKipMode && (
          <View style={styles.section}>
            <View style={[styles.card, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="time" size={20} color="#F57C00" />
                <Text style={[styles.cardTitle, { color: colors.TEXT_PRIMARY }]}>Thông tin Kíp trực</Text>
              </View>

              <FormField label="Tên kíp *" value={kipName} onChangeText={setKipName} placeholder="Ví dụ: Kíp 1" colors={colors} />

              <View style={styles.timeRow}>
                <View style={{ flex: 1 }}>
                  <FormField label="Giờ bắt đầu" value={kipStart} onChangeText={setKipStart} placeholder="07:00" colors={colors} />
                </View>
                <View style={styles.timeSep}>
                  <Text style={[styles.timeSepText, { color: colors.TEXT_SECONDARY }]}>→</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <FormField label="Giờ kết thúc" value={kipEnd} onChangeText={setKipEnd} placeholder="09:00" colors={colors} />
                </View>
              </View>

              <View style={styles.twoCol}>
                <View style={{ flex: 1 }}>
                  <FormField
                    label="Sĩ số tối đa *"
                    value={kipCapacity}
                    onChangeText={setKipCapacity}
                    placeholder="3"
                    keyboardType="numeric"
                    colors={colors}
                  />
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <FormField
                    label="Hệ số kíp *"
                    value={kipCoefficient}
                    onChangeText={setKipCoefficient}
                    placeholder="1.0"
                    keyboardType="decimal-pad"
                    colors={colors}
                  />
                </View>
              </View>

              <View style={[styles.hintBox, { backgroundColor: isDark ? "#1a2a3a" : "#E3F2FD" }]}>
                <Ionicons name="information-circle-outline" size={15} color="#1976D2" />
                <Text style={[styles.hintText, { color: isDark ? "#64B5F6" : "#1565C0" }]}>
                  Hệ số kíp tính vào hạn mức tuần (1 kíp = 1 hệ số). Kíp đặc biệt có thể là 0.5 hoặc 2.
                </Text>
              </View>

              <FormField label="Ghi chú" value={kipNote} onChangeText={setKipNote} placeholder="Ghi chú cho kíp này..." colors={colors} />

              <View style={styles.switchRow}>
                <View>
                  <Text style={[styles.switchLabel, { color: colors.TEXT_PRIMARY }]}>Trạng thái kíp</Text>
                  <Text style={[styles.switchDesc, { color: colors.TEXT_SECONDARY }]}>
                    {kipStatus === "open" ? "Đang mở đăng ký" : "Đã khóa"}
                  </Text>
                </View>
                <Switch
                  value={kipStatus === "open"}
                  onValueChange={(v) => setKipStatus(v ? "open" : "locked")}
                  trackColor={{ false: colors.BORDER, true: COLORS.PRIMARY }}
                  thumbColor={COLORS.WHITE}
                />
              </View>
            </View>

            {/* Action buttons */}
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: saving ? COLORS.GRAY : COLORS.PRIMARY }]}
              onPress={saveKip}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={COLORS.WHITE} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.WHITE} />
                  <Text style={styles.saveBtnText}>Lưu thông tin Kíp</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.deleteBtn, { borderColor: COLORS.ERROR }]}
              onPress={handleDeleteKip}
              disabled={saving}
            >
              <Ionicons name="trash-outline" size={18} color={COLORS.ERROR} />
              <Text style={[styles.deleteBtnText, { color: COLORS.ERROR }]}>Xóa kíp này</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  loadingText: { fontSize: 14 },
  scrollContent: { padding: 16 },
  section: { gap: 14 },

  // Tabs
  tabBar: { flexDirection: "row", borderBottomWidth: 1 },
  tab: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: "transparent",
  },
  tabText: { fontSize: 14, fontWeight: "600" },

  // Card
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 16 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: "700" },

  // Fields
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: "600" },
  fieldInput: {
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15,
  },

  // Layout helpers
  timeRow: { flexDirection: "row", alignItems: "flex-end", gap: 0 },
  timeSep: { width: 28, alignItems: "center", paddingBottom: 12 },
  timeSepText: { fontSize: 18 },
  twoCol: { flexDirection: "row" },

  // Switch
  switchRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingTop: 8,
  },
  switchLabel: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  switchDesc: { fontSize: 12 },

  // Hints
  hintBox: { flexDirection: "row", gap: 8, padding: 12, borderRadius: 10, alignItems: "flex-start" },
  hintText: { flex: 1, fontSize: 12, lineHeight: 18 },

  // Buttons
  saveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 16, borderRadius: 14,
    shadowColor: COLORS.PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  saveBtnText: { color: COLORS.WHITE, fontSize: 16, fontWeight: "700" },
  deleteBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5,
  },
  deleteBtnText: { fontSize: 15, fontWeight: "700" },
});

export default EditShiftKipScreen;
