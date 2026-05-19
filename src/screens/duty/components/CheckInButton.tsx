import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";
import { useTheme } from "@/src/hooks/useTheme";
import { DutyService, DutySlot } from "@/src/services/duty.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CHECKIN_WINDOW_SEC = 120; // ±2 phút = 120 giây

/** Tính số giây từ hiện tại đến giờ bắt đầu ca (âm = trước, dương = sau) */
const getSecondsDiff = (shiftDate: string, startTime?: string): number | null => {
  if (!startTime) return null;
  const raw = shiftDate.substring(0, 10);
  const [y, m, d] = raw.split("-").map(Number);
  const [h, min] = startTime.split(":").map(Number);
  const shiftStart = new Date(y, m - 1, d, h, min, 0, 0);
  return (Date.now() - shiftStart.getTime()) / 1000;
};

/** Format: "-01:45" hoặc "+00:30" */
const formatCountdown = (diffSec: number): string => {
  const abs = Math.abs(Math.round(diffSec));
  const m = Math.floor(abs / 60).toString().padStart(2, "0");
  const s = (abs % 60).toString().padStart(2, "0");
  return diffSec < 0 ? `-${m}:${s}` : `+${m}:${s}`;
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface CheckInButtonProps {
  slot: DutySlot;
  /** ID người dùng hiện tại */
  myUserId?: number;
  /** Callback khi điểm danh thành công */
  onSuccess: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const CheckInButton: React.FC<CheckInButtonProps> = ({ slot, myUserId, onSuccess }) => {
  const { colors, isDark } = useTheme();

  const [diffSec, setDiffSec] = useState<number | null>(
    () => getSecondsDiff(slot.shiftDate, slot.startTime)
  );
  const [loading, setLoading] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Derived state ─────────────────────────────────────────────────────────
  const isMySlot = myUserId !== undefined && slot.assignedUserIds.includes(myUserId);
  const isCheckedIn = myUserId !== undefined && slot.attendedUserIds.includes(myUserId);

  const inWindow =
    diffSec !== null &&
    diffSec >= -CHECKIN_WINDOW_SEC &&
    diffSec <= CHECKIN_WINDOW_SEC;

  // Time until window opens (negative diffSec, before shift)
  const beforeWindowSec = diffSec !== null && diffSec < -CHECKIN_WINDOW_SEC
    ? Math.abs(diffSec) - CHECKIN_WINDOW_SEC
    : null;

  // ── Countdown Timer ───────────────────────────────────────────────────────
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setDiffSec(getSecondsDiff(slot.shiftDate, slot.startTime));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [slot.shiftDate, slot.startTime]);

  // ── Pulse animation khi trong cửa sổ ─────────────────────────────────────
  useEffect(() => {
    if (inWindow && !isCheckedIn) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [inWindow, isCheckedIn]);

  // ── Self Check-in ─────────────────────────────────────────────────────────
  const handleCheckIn = useCallback(() => {
    Alert.alert(
      "Xác nhận điểm danh",
      `Bạn muốn tự điểm danh ca:\n${slot.shiftLabel}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Điểm danh ngay",
          style: "default",
          onPress: async () => {
            setLoading(true);
            try {
              await DutyService.selfCheckIn(slot.id);
              Alert.alert("✅ Điểm danh thành công!", `Ca: ${slot.shiftLabel}`);
              onSuccess();
            } catch (err: any) {
              Alert.alert(
                "Điểm danh thất bại",
                err?.response?.data?.message || "Vui lòng thử lại."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, [slot, onSuccess]);

  // ── Không hiển thị nếu không phải ca của mình ─────────────────────────────
  if (!isMySlot) return null;

  // ── Đã điểm danh ─────────────────────────────────────────────────────────
  if (isCheckedIn) {
    return (
      <View style={[styles.checkedInBadge, { backgroundColor: isDark ? "#0d2e1a" : "#E8F5E9" }]}>
        <Ionicons name="checkmark-circle" size={18} color={COLORS.SUCCESS} />
        <Text style={[styles.checkedInText, { color: COLORS.SUCCESS }]}>Đã điểm danh</Text>
      </View>
    );
  }

  // ── Trong cửa sổ điểm danh ───────────────────────────────────────────────
  if (inWindow) {
    return (
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          style={[styles.checkInBtn, { backgroundColor: COLORS.PRIMARY }]}
          onPress={handleCheckIn}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.WHITE} size="small" />
          ) : (
            <>
              <Ionicons name="finger-print" size={18} color={COLORS.WHITE} />
              <Text style={styles.checkInText}>Điểm danh ngay</Text>
            </>
          )}
          {diffSec !== null && (
            <View style={styles.countdownPill}>
              <Text style={styles.countdownText}>{formatCountdown(diffSec)}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // ── Chưa đến giờ nhưng sắp mở cửa sổ (trong 10 phút) ────────────────────
  if (beforeWindowSec !== null && beforeWindowSec < 600) {
    const totalRemain = Math.round(beforeWindowSec);
    const m = Math.floor(totalRemain / 60);
    const s = totalRemain % 60;
    const label = m > 0 ? `${m} phút ${s} giây` : `${s} giây`;

    return (
      <View style={[styles.countdownBox, { backgroundColor: isDark ? "#1a1a2e" : "#FFF3E0" }]}>
        <Ionicons name="time-outline" size={16} color={COLORS.WARNING} />
        <Text style={[styles.countdownBoxText, { color: COLORS.WARNING }]}>
          Mở điểm danh sau {label}
        </Text>
      </View>
    );
  }

  // ── Quá giờ hoặc chưa đến (không hiển thị gì) ────────────────────────────
  return null;
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  checkedInBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
  },
  checkedInText: {
    fontSize: 14,
    fontWeight: "700",
  },
  checkInBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 14,
    flex: 1,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  checkInText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: "700",
  },
  countdownPill: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 4,
  },
  countdownText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  countdownBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
  },
  countdownBoxText: {
    fontSize: 13,
    fontWeight: "600",
  },
});

export default CheckInButton;
