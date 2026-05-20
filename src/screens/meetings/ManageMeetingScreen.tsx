import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";
import { useTheme } from "@/src/hooks/useTheme";
import { MeetingService, Meeting } from "@/src/services/meeting.service";

// ─── Constants ────────────────────────────────────────────────────────────────

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

const MONTHS = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
  "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
  "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR + i);

// ─── Field Wrapper ────────────────────────────────────────────────────────────

const Field = ({
  label,
  required,
  children,
  colors,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  colors: any;
}) => (
  <View style={styles.fieldGroup}>
    <Text style={[styles.fieldLabel, { color: colors.TEXT_PRIMARY }]}>
      {label}
      {required && <Text style={{ color: COLORS.ERROR }}> *</Text>}
    </Text>
    {children}
  </View>
);

// ─── Date Picker Modal ────────────────────────────────────────────────────────

interface DatePickerModalProps {
  visible: boolean;
  value: Date;
  onConfirm: (date: Date) => void;
  onClose: () => void;
  colors: any;
  isDark: boolean;
}

const DatePickerModal = ({
  visible,
  value,
  onConfirm,
  onClose,
  colors,
  isDark,
}: DatePickerModalProps) => {
  const [day, setDay] = useState(value.getDate());
  const [month, setMonth] = useState(value.getMonth() + 1); // 1-12
  const [year, setYear] = useState(value.getFullYear());

  useEffect(() => {
    if (visible) {
      setDay(value.getDate());
      setMonth(value.getMonth() + 1);
      setYear(value.getFullYear());
    }
  }, [visible, value]);

  const maxDay = getDaysInMonth(month, year);
  const adjustedDay = Math.min(day, maxDay);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  const handleConfirm = () => {
    const d = Math.min(adjustedDay, maxDay);
    onConfirm(new Date(year, month - 1, d));
  };

  const ColPicker = ({
    items,
    selected,
    onSelect,
    formatLabel,
    width,
  }: {
    items: number[];
    selected: number;
    onSelect: (v: number) => void;
    formatLabel?: (v: number) => string;
    width?: number;
  }) => {
    const flatRef = useRef<FlatList>(null);
    const ITEM_H = 46;

    useEffect(() => {
      const idx = items.indexOf(selected);
      if (idx >= 0 && flatRef.current) {
        setTimeout(() => {
          flatRef.current?.scrollToIndex({ index: idx, animated: false });
        }, 50);
      }
    }, [selected, items]);

    return (
      <View style={[styles.colPicker, { width: width ?? 80 }]}>
        <FlatList
          ref={flatRef}
          data={items}
          keyExtractor={(item) => String(item)}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_H}
          decelerationRate="fast"
          getItemLayout={(_, index) => ({
            length: ITEM_H,
            offset: ITEM_H * index,
            index,
          })}
          onScrollToIndexFailed={() => {}}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(
              e.nativeEvent.contentOffset.y / ITEM_H
            );
            if (items[idx] !== undefined) onSelect(items[idx]);
          }}
          renderItem={({ item }) => {
            const active = item === selected;
            return (
              <TouchableOpacity
                style={[
                  styles.colItem,
                  { height: ITEM_H },
                  active && { backgroundColor: COLORS.PRIMARY + "15" },
                ]}
                onPress={() => onSelect(item)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.colItemText,
                    { color: active ? COLORS.PRIMARY : colors.TEXT_SECONDARY },
                    active && { fontWeight: "800", fontSize: 16 },
                  ]}
                >
                  {formatLabel ? formatLabel(item) : String(item).padStart(2, "0")}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
        {/* Highlight line */}
        <View
          pointerEvents="none"
          style={[styles.colHighlight, { borderColor: COLORS.PRIMARY + "50" }]}
        />
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.pickerOverlay}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
        <View
          style={[
            styles.pickerSheet,
            { backgroundColor: isDark ? "#1e1e2e" : "#ffffff" },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.pickerHeader,
              { borderBottomColor: colors.BORDER },
            ]}
          >
            <TouchableOpacity onPress={onClose} style={styles.pickerHeaderBtn}>
              <Text style={{ color: colors.TEXT_SECONDARY, fontSize: 15 }}>
                Hủy
              </Text>
            </TouchableOpacity>
            <Text style={[styles.pickerTitle, { color: colors.TEXT_PRIMARY }]}>
              Chọn ngày họp
            </Text>
            <TouchableOpacity
              onPress={handleConfirm}
              style={styles.pickerHeaderBtn}
            >
              <Text
                style={{ color: COLORS.PRIMARY, fontSize: 15, fontWeight: "700" }}
              >
                Xong
              </Text>
            </TouchableOpacity>
          </View>

          {/* Column pickers */}
          <View style={styles.pickerBody}>
            {/* Ngày */}
            <View style={styles.colWrapper}>
              <Text style={[styles.colLabel, { color: colors.TEXT_SECONDARY }]}>
                Ngày
              </Text>
              <ColPicker
                items={days}
                selected={adjustedDay}
                onSelect={setDay}
                width={64}
              />
            </View>

            <Text style={[styles.colSep, { color: colors.TEXT_SECONDARY }]}>/</Text>

            {/* Tháng */}
            <View style={styles.colWrapper}>
              <Text style={[styles.colLabel, { color: colors.TEXT_SECONDARY }]}>
                Tháng
              </Text>
              <ColPicker
                items={Array.from({ length: 12 }, (_, i) => i + 1)}
                selected={month}
                onSelect={(m) => {
                  setMonth(m);
                  setDay((d) => Math.min(d, getDaysInMonth(m, year)));
                }}
                formatLabel={(v) => String(v).padStart(2, "0")}
                width={64}
              />
            </View>

            <Text style={[styles.colSep, { color: colors.TEXT_SECONDARY }]}>/</Text>

            {/* Năm */}
            <View style={styles.colWrapper}>
              <Text style={[styles.colLabel, { color: colors.TEXT_SECONDARY }]}>
                Năm
              </Text>
              <ColPicker
                items={YEARS}
                selected={year}
                onSelect={setYear}
                formatLabel={(v) => String(v)}
                width={80}
              />
            </View>
          </View>

          {/* Preview */}
          <View
            style={[
              styles.datePreview,
              { backgroundColor: COLORS.PRIMARY + "12" },
            ]}
          >
            <Ionicons name="calendar" size={16} color={COLORS.PRIMARY} />
            <Text style={[styles.datePreviewText, { color: COLORS.PRIMARY }]}>
              {String(adjustedDay).padStart(2, "0")}/
              {String(month).padStart(2, "0")}/{year}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── Time Picker Modal ────────────────────────────────────────────────────────

interface TimePickerModalProps {
  visible: boolean;
  value: string; // "HH:MM"
  label: string;
  onConfirm: (time: string) => void;
  onClose: () => void;
  colors: any;
  isDark: boolean;
}

const TimePickerModal = ({
  visible,
  value,
  label,
  onConfirm,
  onClose,
  colors,
  isDark,
}: TimePickerModalProps) => {
  const [selectedHour, setSelectedHour] = useState("08");
  const [selectedMin, setSelectedMin] = useState("00");

  useEffect(() => {
    if (visible && value) {
      const parts = value.split(":");
      setSelectedHour(parts[0] ?? "08");
      // Snap về 00/15/30/45 gần nhất
      const rawMin = parseInt(parts[1] ?? "0", 10);
      const snapped = MINUTES.reduce((prev, cur) =>
        Math.abs(parseInt(cur, 10) - rawMin) <
        Math.abs(parseInt(prev, 10) - rawMin)
          ? cur
          : prev
      );
      setSelectedMin(snapped);
    }
  }, [visible, value]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.pickerOverlay}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
        <View
          style={[
            styles.pickerSheet,
            { backgroundColor: isDark ? "#1e1e2e" : "#ffffff" },
          ]}
        >
          {/* Header */}
          <View
            style={[styles.pickerHeader, { borderBottomColor: colors.BORDER }]}
          >
            <TouchableOpacity onPress={onClose} style={styles.pickerHeaderBtn}>
              <Text style={{ color: colors.TEXT_SECONDARY, fontSize: 15 }}>
                Hủy
              </Text>
            </TouchableOpacity>
            <Text style={[styles.pickerTitle, { color: colors.TEXT_PRIMARY }]}>
              {label}
            </Text>
            <TouchableOpacity
              onPress={() => {
                onConfirm(`${selectedHour}:${selectedMin}`);
              }}
              style={styles.pickerHeaderBtn}
            >
              <Text
                style={{
                  color: COLORS.PRIMARY,
                  fontSize: 15,
                  fontWeight: "700",
                }}
              >
                Xong
              </Text>
            </TouchableOpacity>
          </View>

          {/* Time display */}
          <View style={styles.timeDisplay}>
            <Text style={[styles.timeDisplayText, { color: COLORS.PRIMARY }]}>
              {selectedHour}:{selectedMin}
            </Text>
          </View>

          {/* Hour grid */}
          <View style={styles.timeSection}>
            <Text style={[styles.timeSectionLabel, { color: colors.TEXT_SECONDARY }]}>
              Giờ
            </Text>
            <View style={styles.hourGrid}>
              {HOURS.map((h) => {
                const active = h === selectedHour;
                return (
                  <TouchableOpacity
                    key={h}
                    style={[
                      styles.hourBtn,
                      {
                        backgroundColor: active
                          ? COLORS.PRIMARY
                          : isDark
                          ? "#2a2a3e"
                          : "#F5F5F5",
                        borderColor: active ? COLORS.PRIMARY : colors.BORDER,
                      },
                    ]}
                    onPress={() => setSelectedHour(h)}
                  >
                    <Text
                      style={[
                        styles.hourBtnText,
                        { color: active ? COLORS.WHITE : colors.TEXT_PRIMARY },
                      ]}
                    >
                      {h}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Minute grid */}
          <View style={styles.timeSection}>
            <Text
              style={[styles.timeSectionLabel, { color: colors.TEXT_SECONDARY }]}
            >
              Phút
            </Text>
            <View style={styles.minuteGrid}>
              {MINUTES.map((m) => {
                const active = m === selectedMin;
                return (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.minuteBtn,
                      {
                        backgroundColor: active
                          ? COLORS.PRIMARY
                          : isDark
                          ? "#2a2a3e"
                          : "#F5F5F5",
                        borderColor: active ? COLORS.PRIMARY : colors.BORDER,
                        flex: 1,
                      },
                    ]}
                    onPress={() => setSelectedMin(m)}
                  >
                    <Text
                      style={[
                        styles.minuteBtnText,
                        { color: active ? COLORS.WHITE : colors.TEXT_PRIMARY },
                      ]}
                    >
                      :{m}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const ManageMeetingScreen = ({ navigation, route }: any) => {
  const { colors, isDark } = useTheme();
  const meetingId: string | undefined = route?.params?.meetingId;
  const isEdit = !!meetingId;

  // ─── Form state ──────────────────────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [agenda, setAgenda] = useState("");
  const [note, setNote] = useState("");
  const [isAllParticipants, setIsAllParticipants] = useState(true);
  const [status, setStatus] = useState<"scheduled" | "completed" | "cancelled">(
    "scheduled"
  );

  // Picker visibility
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ─── Format helpers ──────────────────────────────────────────────────────────

  const formatDate = (d: Date) =>
    d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  // ─── Load meeting nếu đang Edit ──────────────────────────────────────────────

  const loadMeeting = useCallback(async () => {
    if (!meetingId) return;
    try {
      setLoading(true);
      const m: Meeting = await MeetingService.getMeetingById(meetingId);

      if (m.meetingAt) {
        const dt = new Date(m.meetingAt);
        setSelectedDate(dt);
        setStartTime(
          dt.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        );
      }
      if (m.endAt) {
        const et = new Date(m.endAt);
        setEndTime(
          et.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        );
      }

      setTitle(m.title ?? "");
      setLocation(m.location ?? "");
      setAgenda(m.agenda ?? "");
      setNote(m.note ?? "");
      setIsAllParticipants(m.isAllParticipants ?? true);
      setStatus(m.status ?? "scheduled");
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ?? e?.message ?? "Không thể tải dữ liệu";
      Alert.alert("Lỗi", msg, [
        { text: "Quay lại", onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [meetingId, navigation]);

  useEffect(() => {
    if (isEdit) loadMeeting();
  }, [isEdit, loadMeeting]);

  // ─── Validation & Submit ──────────────────────────────────────────────────────

  const isValid = title.trim() && startTime && location.trim();

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Kiểm tra lại", "Tiêu đề cuộc họp không được để trống");
      return;
    }
    if (!location.trim()) {
      Alert.alert("Kiểm tra lại", "Địa điểm không được để trống");
      return;
    }

    // Build ISO datetimes từ selectedDate + time strings
    const buildIso = (date: Date, time: string) => {
      const [h, m] = time.split(":").map(Number);
      const d = new Date(date);
      d.setHours(h, m, 0, 0);
      return d.toISOString();
    };

    const meetingAt = buildIso(selectedDate, startTime);
    const endAt = endTime ? buildIso(selectedDate, endTime) : undefined;

    const payload = {
      title: title.trim(),
      location: location.trim(),
      meetingAt,
      ...(endAt ? { endAt } : {}),
      agenda: agenda.trim() || undefined,
      note: note.trim() || undefined,
      isAllParticipants,
      status,
    };

    try {
      setSubmitting(true);
      if (isEdit && meetingId) {
        await MeetingService.updateMeeting(meetingId, payload);
        Alert.alert("Thành công", "Đã cập nhật lịch họp", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        await MeetingService.createMeeting(payload);
        Alert.alert(
          "Thành công",
          "Đã tạo lịch họp mới. Thông báo sẽ được gửi đến các thành viên.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ?? e?.message ?? "Không thể lưu lịch họp";
      Alert.alert("Lỗi", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Delete ──────────────────────────────────────────────────────────────────

  const handleDelete = () => {
    Alert.alert(
      "Xóa lịch họp",
      "Bạn có chắc muốn xóa cuộc họp này? Hành động này không thể hoàn tác.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            if (!meetingId) return;
            try {
              setDeleting(true);
              await MeetingService.deleteMeeting(meetingId);
              Alert.alert("Đã xóa", "Lịch họp đã được xóa", [
                { text: "OK", onPress: () => navigation.goBack() },
              ]);
            } catch (e: any) {
              const msg =
                e?.response?.data?.message ??
                e?.message ??
                "Không thể xóa lịch họp";
              Alert.alert("Lỗi", msg);
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.BACKGROUND,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={[{ color: colors.TEXT_SECONDARY, marginTop: 12 }]}>
          Đang tải...
        </Text>
      </View>
    );
  }

  const triggerStyle = [
    styles.trigger,
    {
      backgroundColor: colors.CARD_BG,
      borderColor: colors.BORDER,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Banner */}
        <View style={[styles.banner, { backgroundColor: COLORS.PRIMARY }]}>
          <Ionicons
            name={isEdit ? "create" : "add-circle"}
            size={32}
            color="rgba(255,255,255,0.9)"
          />
          <Text style={styles.bannerTitle}>
            {isEdit ? "Chỉnh sửa lịch họp" : "Tạo lịch họp mới"}
          </Text>
        </View>

        {/* Tiêu đề */}
        <Field label="Tiêu đề cuộc họp" required colors={colors}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.CARD_BG,
                borderColor: colors.BORDER,
                color: colors.TEXT_PRIMARY,
              },
            ]}
            placeholder="VD: Họp tổng kết tháng 5"
            placeholderTextColor={colors.TEXT_SECONDARY}
            value={title}
            onChangeText={setTitle}
          />
        </Field>

        {/* ── Ngày họp ── */}
        <Field label="Ngày họp" required colors={colors}>
          <TouchableOpacity
            style={triggerStyle}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={18} color={COLORS.PRIMARY} />
            <Text style={[styles.triggerText, { color: colors.TEXT_PRIMARY }]}>
              {formatDate(selectedDate)}
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={colors.TEXT_SECONDARY}
              style={{ marginLeft: "auto" as any }}
            />
          </TouchableOpacity>
        </Field>

        {/* ── Giờ bắt đầu & kết thúc ── */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Giờ bắt đầu" required colors={colors}>
              <TouchableOpacity
                style={triggerStyle}
                onPress={() => setShowStartTimePicker(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="time-outline" size={18} color={COLORS.PRIMARY} />
                <Text
                  style={[styles.triggerText, { color: colors.TEXT_PRIMARY }]}
                >
                  {startTime || "--:--"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={colors.TEXT_SECONDARY}
                  style={{ marginLeft: "auto" as any }}
                />
              </TouchableOpacity>
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Giờ kết thúc" colors={colors}>
              <TouchableOpacity
                style={triggerStyle}
                onPress={() => setShowEndTimePicker(true)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={endTime ? COLORS.PRIMARY : colors.TEXT_SECONDARY}
                />
                <Text
                  style={[
                    styles.triggerText,
                    {
                      color: endTime
                        ? colors.TEXT_PRIMARY
                        : colors.TEXT_SECONDARY,
                    },
                  ]}
                >
                  {endTime || "Tuỳ chọn"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={colors.TEXT_SECONDARY}
                  style={{ marginLeft: "auto" as any }}
                />
              </TouchableOpacity>
              {endTime ? (
                <TouchableOpacity
                  style={styles.clearTime}
                  onPress={() => setEndTime("")}
                >
                  <Text style={{ color: COLORS.ERROR, fontSize: 12 }}>
                    ✕ Xóa
                  </Text>
                </TouchableOpacity>
              ) : null}
            </Field>
          </View>
        </View>

        {/* Summary chip */}
        <View
          style={[
            styles.summaryChip,
            { backgroundColor: COLORS.PRIMARY + "12" },
          ]}
        >
          <Ionicons name="calendar" size={14} color={COLORS.PRIMARY} />
          <Text style={[styles.summaryText, { color: COLORS.PRIMARY }]}>
            {formatDate(selectedDate)} · {startTime}
            {endTime ? ` – ${endTime}` : ""}
          </Text>
        </View>

        {/* Địa điểm */}
        <Field label="Địa điểm" required colors={colors}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.CARD_BG,
                borderColor: colors.BORDER,
                color: colors.TEXT_PRIMARY,
              },
            ]}
            placeholder="VD: Phòng họp A, Tòa nhà A1"
            placeholderTextColor={colors.TEXT_SECONDARY}
            value={location}
            onChangeText={setLocation}
          />
        </Field>

        {/* Nội dung */}
        <Field label="Nội dung / Chương trình họp" colors={colors}>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: colors.CARD_BG,
                borderColor: colors.BORDER,
                color: colors.TEXT_PRIMARY,
              },
            ]}
            placeholder="Mô tả nội dung và chương trình của cuộc họp..."
            placeholderTextColor={colors.TEXT_SECONDARY}
            multiline
            numberOfLines={5}
            value={agenda}
            onChangeText={setAgenda}
            textAlignVertical="top"
          />
        </Field>

        {/* Ghi chú */}
        <Field label="Ghi chú bổ sung" colors={colors}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.CARD_BG,
                borderColor: colors.BORDER,
                color: colors.TEXT_PRIMARY,
              },
            ]}
            placeholder="Thông tin thêm cho thành viên..."
            placeholderTextColor={colors.TEXT_SECONDARY}
            value={note}
            onChangeText={setNote}
          />
        </Field>

        {/* Mời tất cả thành viên */}
        <View
          style={[
            styles.switchRow,
            { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.switchLabel, { color: colors.TEXT_PRIMARY }]}>
              Mời toàn bộ thành viên
            </Text>
            <Text style={[styles.switchSub, { color: colors.TEXT_SECONDARY }]}>
              {isAllParticipants
                ? "Tất cả thành viên sẽ được thêm vào cuộc họp"
                : "Chỉ mời các thành viên được chỉ định"}
            </Text>
          </View>
          <Switch
            value={isAllParticipants}
            onValueChange={setIsAllParticipants}
            trackColor={{ false: colors.BORDER, true: COLORS.PRIMARY + "80" }}
            thumbColor={isAllParticipants ? COLORS.PRIMARY : colors.BORDER}
          />
        </View>

        {/* Trạng thái (chỉ khi edit) */}
        {isEdit && (
          <Field label="Trạng thái cuộc họp" colors={colors}>
            <View style={styles.statusRow}>
              {(["scheduled", "completed", "cancelled"] as const).map((s) => {
                const labels: Record<string, string> = {
                  scheduled: "Đã lên lịch",
                  completed: "Hoàn thành",
                  cancelled: "Đã hủy",
                };
                const statusColors: Record<string, string> = {
                  scheduled: "#1976D2",
                  completed: COLORS.SUCCESS,
                  cancelled: COLORS.ERROR,
                };
                const active = status === s;
                return (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.statusBtn,
                      {
                        backgroundColor: active
                          ? statusColors[s]
                          : colors.CARD_BG,
                        borderColor: active ? statusColors[s] : colors.BORDER,
                      },
                    ]}
                    onPress={() => setStatus(s)}
                  >
                    <Text
                      style={{
                        color: active ? COLORS.WHITE : colors.TEXT_SECONDARY,
                        fontSize: 13,
                        fontWeight: "600",
                      }}
                    >
                      {labels[s]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Field>
        )}

        {/* Info box */}
        <View
          style={[
            styles.infoBox,
            { backgroundColor: isDark ? "#1a2a3a" : "#EBF5FF" },
          ]}
        >
          <Ionicons
            name="information-circle-outline"
            size={18}
            color="#1976D2"
          />
          <Text
            style={[styles.infoText, { color: isDark ? "#64B5F6" : "#1565C0" }]}
          >
            {isEdit
              ? "Sau khi lưu, thay đổi sẽ được cập nhật ngay cho các thành viên."
              : "Sau khi tạo, thông báo tự động sẽ được gửi đến toàn bộ thành viên."}
          </Text>
        </View>

        {/* Xóa (chỉ khi edit) */}
        {isEdit && (
          <TouchableOpacity
            style={[styles.deleteBtn, { borderColor: COLORS.ERROR }]}
            onPress={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator size="small" color={COLORS.ERROR} />
            ) : (
              <Ionicons name="trash-outline" size={18} color={COLORS.ERROR} />
            )}
            <Text style={[styles.deleteBtnText, { color: COLORS.ERROR }]}>
              {deleting ? "Đang xóa..." : "Xóa lịch họp này"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            {
              backgroundColor:
                isValid && !submitting ? COLORS.PRIMARY : colors.BORDER,
            },
          ]}
          disabled={!isValid || submitting}
          onPress={handleSubmit}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={COLORS.WHITE} />
          ) : (
            <Ionicons
              name={isEdit ? "save" : "send"}
              size={18}
              color={isValid ? COLORS.WHITE : colors.TEXT_SECONDARY}
            />
          )}
          <Text
            style={[
              styles.submitText,
              {
                color:
                  isValid && !submitting
                    ? COLORS.WHITE
                    : colors.TEXT_SECONDARY,
              },
            ]}
          >
            {submitting
              ? isEdit
                ? "Đang lưu..."
                : "Đang tạo..."
              : isEdit
              ? "Lưu thay đổi"
              : "Tạo lịch họp"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Modals ── */}
      <DatePickerModal
        visible={showDatePicker}
        value={selectedDate}
        onConfirm={(d) => {
          setSelectedDate(d);
          setShowDatePicker(false);
        }}
        onClose={() => setShowDatePicker(false)}
        colors={colors}
        isDark={isDark}
      />

      <TimePickerModal
        visible={showStartTimePicker}
        value={startTime}
        label="Giờ bắt đầu"
        onConfirm={(t) => {
          setStartTime(t);
          setShowStartTimePicker(false);
        }}
        onClose={() => setShowStartTimePicker(false)}
        colors={colors}
        isDark={isDark}
      />

      <TimePickerModal
        visible={showEndTimePicker}
        value={endTime || startTime}
        label="Giờ kết thúc"
        onConfirm={(t) => {
          setEndTime(t);
          setShowEndTimePicker(false);
        }}
        onClose={() => setShowEndTimePicker(false)}
        colors={colors}
        isDark={isDark}
      />
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  banner: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  bannerTitle: { color: COLORS.WHITE, fontSize: 18, fontWeight: "800" },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  textArea: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 120,
  },
  // Trigger button (date / time selector)
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  triggerText: { fontSize: 14, fontWeight: "500" },
  clearTime: { marginTop: 4, alignSelf: "flex-end" },
  summaryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 16,
    marginTop: -8,
  },
  summaryText: { fontSize: 13, fontWeight: "600" },
  row: { flexDirection: "row", gap: 12 },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  switchLabel: { fontSize: 14, fontWeight: "600" },
  switchSub: { fontSize: 12, marginTop: 2 },
  statusRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  statusBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  infoBox: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    alignItems: "flex-start",
    marginBottom: 16,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 20 },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  deleteBtnText: { fontSize: 15, fontWeight: "700" },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitText: { fontSize: 16, fontWeight: "700" },

  // ── Picker Sheet ──
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  pickerSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  pickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  pickerHeaderBtn: { paddingHorizontal: 4 },
  pickerTitle: { fontSize: 16, fontWeight: "700" },

  // Date column picker
  pickerBody: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 4,
    height: 230,
  },
  colWrapper: { alignItems: "center", gap: 6 },
  colLabel: { fontSize: 12, fontWeight: "600", marginBottom: 2 },
  colPicker: {
    height: 184,
    overflow: "hidden",
    position: "relative",
  },
  colItem: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginHorizontal: 2,
  },
  colItemText: { fontSize: 15, fontWeight: "500" },
  colHighlight: {
    position: "absolute",
    top: "50%",
    left: 2,
    right: 2,
    height: 46,
    marginTop: -23,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderRadius: 10,
    pointerEvents: "none",
  } as any,
  colSep: { fontSize: 22, fontWeight: "700", marginTop: 20, paddingHorizontal: 2 },
  datePreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 4,
  },
  datePreviewText: { fontSize: 16, fontWeight: "700" },

  // Time picker
  timeDisplay: { alignItems: "center", paddingVertical: 16 },
  timeDisplayText: { fontSize: 40, fontWeight: "800", letterSpacing: 2 },
  timeSection: { paddingHorizontal: 20, marginBottom: 16 },
  timeSectionLabel: { fontSize: 12, fontWeight: "700", marginBottom: 10, letterSpacing: 0.5, textTransform: "uppercase" },
  hourGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  hourBtn: {
    width: 44,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  hourBtnText: { fontSize: 14, fontWeight: "600" },
  minuteGrid: { flexDirection: "row", gap: 10 },
  minuteBtn: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  minuteBtnText: { fontSize: 16, fontWeight: "700" },
});

export default ManageMeetingScreen;
