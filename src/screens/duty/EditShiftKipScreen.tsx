import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
  label, value, placeholder, colors, keyboardType = "default", editable = false,
}: any) => (
  <View style={styles.fieldGroup}>
    <Text style={[styles.fieldLabel, { color: colors.TEXT_SECONDARY }]}>{label}</Text>
    <TextInput
      value={value}
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
  const { shiftId, weekStart } = route.params as {
    shiftId: number;
    weekStart: string;
  };

  // ── State: Shift ────────────────────────────────────────────────────────────
  const [shiftName, setShiftName] = useState("");
  const [shiftStart, setShiftStart] = useState("");
  const [shiftEnd, setShiftEnd] = useState("");
  const [shiftNote, setShiftNote] = useState("");
  const [shiftStatus, setShiftStatus] = useState("open");

  // ── State: Kips ─────────────────────────────────────────────────────────────
  const [shiftKips, setShiftKips] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

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
        
        // Find slots for this shift
        const kips = slots.filter((s) => {
          const slotDateStr = s.shiftDate?.substring(0, 10);
          const shiftDateStr = shift.date?.substring(0, 10);
          return slotDateStr === shiftDateStr;
        });
        setShiftKips(kips);
      }
    } catch (err: any) {
      Alert.alert("Lỗi", "Không thể tải dữ liệu ca trực");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [shiftId, weekStart, navigation]);

  useEffect(() => {
    loadData();
  }, [loadData]);


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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* ── Shift Info ── */}
        <View style={styles.section}>
          <View style={[styles.card, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="sunny" size={20} color={COLORS.PRIMARY} />
              <Text style={[styles.cardTitle, { color: colors.TEXT_PRIMARY }]}>Thông tin Ca trực</Text>
            </View>

            <FormField label="Tên ca" value={shiftName} placeholder="Ví dụ: Ca Sáng" colors={colors} />

            <View style={styles.timeRow}>
              <View style={{ flex: 1 }}>
                <FormField label="Giờ bắt đầu" value={shiftStart} placeholder="07:00" colors={colors} />
              </View>
              <View style={styles.timeSep}>
                <Text style={[styles.timeSepText, { color: colors.TEXT_SECONDARY }]}>→</Text>
              </View>
              <View style={{ flex: 1 }}>
                <FormField label="Giờ kết thúc" value={shiftEnd} placeholder="11:00" colors={colors} />
              </View>
            </View>

            <FormField label="Ghi chú" value={shiftNote} placeholder="Không có ghi chú" colors={colors} />

            <View style={styles.switchRow}>
              <View>
                <Text style={[styles.switchLabel, { color: colors.TEXT_PRIMARY }]}>Trạng thái</Text>
                <Text style={[styles.switchDesc, { color: colors.TEXT_SECONDARY }]}>
                  {shiftStatus === "open" ? "Đang mở đăng ký" : "Đã khóa"}
                </Text>
              </View>
              <Switch
                value={shiftStatus === "open"}
                trackColor={{ false: colors.BORDER, true: COLORS.PRIMARY }}
                thumbColor={COLORS.WHITE}
                disabled={true}
              />
            </View>
          </View>
        </View>

        {/* ── Kips Info ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY, marginTop: 16 }]}>
            Danh sách Kíp trực ({shiftKips.length})
          </Text>
          
          {shiftKips.map((kip, index) => (
            <View key={kip.id || kip.kipId || index} style={[styles.card, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="time" size={20} color="#F57C00" />
                <Text style={[styles.cardTitle, { color: colors.TEXT_PRIMARY }]}>
                  {kip.shiftLabel || kip.name || `Kíp ${index + 1}`}
                </Text>
              </View>

              <View style={styles.timeRow}>
                <View style={{ flex: 1 }}>
                  <FormField label="Giờ bắt đầu" value={kip.startTime || ""} placeholder="07:00" colors={colors} />
                </View>
                <View style={styles.timeSep}>
                  <Text style={[styles.timeSepText, { color: colors.TEXT_SECONDARY }]}>→</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <FormField label="Giờ kết thúc" value={kip.endTime || ""} placeholder="09:00" colors={colors} />
                </View>
              </View>

              <View style={styles.twoCol}>
                <View style={{ flex: 1 }}>
                  <FormField
                    label="Sĩ số tối đa"
                    value={String(kip.capacity || 1)}
                    colors={colors}
                  />
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <FormField
                    label="Hệ số kíp"
                    value={String(kip.coefficient || 1)}
                    colors={colors}
                  />
                </View>
              </View>

              <FormField label="Ghi chú" value={kip.note || ""} placeholder="Không có ghi chú" colors={colors} />

              <View style={styles.switchRow}>
                <View>
                  <Text style={[styles.switchLabel, { color: colors.TEXT_PRIMARY }]}>Trạng thái kíp</Text>
                  <Text style={[styles.switchDesc, { color: colors.TEXT_SECONDARY }]}>
                    {kip.status === "open" ? "Đang mở đăng ký" : "Đã khóa"}
                  </Text>
                </View>
                <Switch
                  value={kip.status === "open"}
                  trackColor={{ false: colors.BORDER, true: COLORS.PRIMARY }}
                  thumbColor={COLORS.WHITE}
                  disabled={true}
                />
              </View>
            </View>
          ))}
          
          {shiftKips.length === 0 && (
            <Text style={[styles.emptyKipsText, { color: colors.TEXT_SECONDARY }]}>
              Không có kíp nào trong ca trực này.
            </Text>
          )}
        </View>

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
  section: { gap: 14, marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginLeft: 4, marginBottom: 4 },
  emptyKipsText: { fontSize: 14, fontStyle: "italic", textAlign: "center", marginTop: 20 },

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
});

export default EditShiftKipScreen;
