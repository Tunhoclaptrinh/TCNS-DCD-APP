import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";
import { useTheme } from "@/src/hooks/useTheme";

const BonusCampaignsScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();

  const CAMPAIGNS = [
    {
      id: 1,
      title: "Đăng ký điểm rèn luyện HK2/2025-2026",
      type: "ĐRL",
      deadline: "20/05/2026",
      maxPoints: 15,
      status: "open",
      registeredCount: 45,
      description: "Đăng ký cộng điểm rèn luyện cho học kỳ 2 năm học 2025-2026. Tối đa 15 điểm/học kỳ.",
    },
    {
      id: 2,
      title: "Xét học bổng khuyến khích học tập HK2",
      type: "ĐƯT",
      deadline: "15/05/2026",
      maxPoints: 20,
      status: "open",
      registeredCount: 30,
      description: "Đăng ký minh chứng tham gia hoạt động đội để xét học bổng học kỳ 2.",
    },
    {
      id: 3,
      title: "Đăng ký điểm rèn luyện HK1/2025-2026",
      type: "ĐRL",
      deadline: "10/12/2025",
      maxPoints: 15,
      status: "closed",
      registeredCount: 80,
      description: "Đợt đăng ký điểm rèn luyện học kỳ 1 đã kết thúc.",
    },
  ];

  const openCampaigns = CAMPAIGNS.filter((c) => c.status === "open");
  const closedCampaigns = CAMPAIGNS.filter((c) => c.status === "closed");

  const renderCard = (campaign: typeof CAMPAIGNS[0]) => {
    const isClosed = campaign.status === "closed";
    return (
      <View
        key={campaign.id}
        style={[
          styles.card,
          { backgroundColor: colors.CARD_BG, borderColor: isClosed ? colors.BORDER : COLORS.PRIMARY },
          isClosed && { opacity: 0.7 },
        ]}
      >
        <View style={styles.cardTop}>
          <View style={[styles.typeBadge, { backgroundColor: campaign.type === "ĐRL" ? "#E3F2FD" : "#F3E5F5" }]}>
            <Text style={[styles.typeText, { color: campaign.type === "ĐRL" ? "#1976D2" : "#8E24AA" }]}>
              {campaign.type}
            </Text>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: isClosed ? (isDark ? "#3a3a3a" : "#F5F5F5") : (isDark ? "#1a3a1a" : "#E8F5E9") },
          ]}>
            <Ionicons
              name={isClosed ? "lock-closed" : "lock-open"}
              size={12}
              color={isClosed ? COLORS.GRAY : COLORS.SUCCESS}
            />
            <Text style={[styles.statusText, { color: isClosed ? COLORS.GRAY : COLORS.SUCCESS }]}>
              {isClosed ? "Đã đóng" : "Đang mở"}
            </Text>
          </View>
        </View>

        <Text style={[styles.cardTitle, { color: colors.TEXT_PRIMARY }]}>{campaign.title}</Text>
        <Text style={[styles.cardDesc, { color: colors.TEXT_SECONDARY }]}>{campaign.description}</Text>

        <View style={[styles.cardMeta, { borderTopColor: colors.BORDER }]}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={colors.TEXT_SECONDARY} />
            <Text style={[styles.metaText, { color: colors.TEXT_SECONDARY }]}>Hạn: {campaign.deadline}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="star-outline" size={14} color={COLORS.WARNING} />
            <Text style={[styles.metaText, { color: colors.TEXT_SECONDARY }]}>Tối đa {campaign.maxPoints} điểm</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color={colors.TEXT_SECONDARY} />
            <Text style={[styles.metaText, { color: colors.TEXT_SECONDARY }]}>{campaign.registeredCount} đã đăng ký</Text>
          </View>
        </View>

        {!isClosed && (
          <TouchableOpacity
            style={[styles.registerBtn, { backgroundColor: COLORS.PRIMARY }]}
            onPress={() => navigation.navigate("RegisterBonus", { campaignId: campaign.id.toString() })}
          >
            <Text style={styles.registerBtnText}>Đăng ký ngay</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.WHITE} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Summary */}
        <View style={[styles.summaryRow, { backgroundColor: COLORS.PRIMARY }]}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{openCampaigns.length}</Text>
            <Text style={styles.summaryLabel}>Đợt đang mở</Text>
          </View>
          <View style={styles.summarySep} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>35</Text>
            <Text style={styles.summaryLabel}>Điểm của bạn</Text>
          </View>
          <View style={styles.summarySep} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>2</Text>
            <Text style={styles.summaryLabel}>Đã đăng ký</Text>
          </View>
        </View>

        {/* Open Campaigns */}
        <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>Đợt đang mở</Text>
        {openCampaigns.map(renderCard)}

        {/* Closed Campaigns */}
        {closedCampaigns.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>Đợt đã đóng</Text>
            {closedCampaigns.map(renderCard)}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  summaryRow: {
    flexDirection: "row", borderRadius: 16, padding: 20, marginBottom: 20,
    justifyContent: "space-around",
    shadowColor: COLORS.PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  summaryItem: { alignItems: "center" },
  summaryValue: { color: COLORS.WHITE, fontSize: 24, fontWeight: "800" },
  summaryLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 },
  summarySep: { width: 1, backgroundColor: "rgba(255,255,255,0.3)" },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12, marginTop: 4 },
  card: {
    borderRadius: 16, borderWidth: 1.5, padding: 16, marginBottom: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardTop: { flexDirection: "row", gap: 8, marginBottom: 10 },
  typeBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  typeText: { fontSize: 12, fontWeight: "700" },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  statusText: { fontSize: 12, fontWeight: "600" },
  cardTitle: { fontSize: 15, fontWeight: "700", marginBottom: 6 },
  cardDesc: { fontSize: 13, lineHeight: 20, marginBottom: 12 },
  cardMeta: { borderTopWidth: 1, paddingTop: 12, gap: 6, marginBottom: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 13 },
  registerBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 12, borderRadius: 12,
  },
  registerBtnText: { color: COLORS.WHITE, fontSize: 14, fontWeight: "700" },
});

export default BonusCampaignsScreen;
