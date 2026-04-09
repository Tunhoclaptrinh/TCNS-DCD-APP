import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";
import { useTheme } from "@/src/hooks/useTheme";

const DutyScreen = () => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}>
          <Ionicons name="calendar-outline" size={80} color={colors.PRIMARY} style={{ alignSelf: 'center', marginBottom: 20 }} />
          <Text style={[styles.title, { color: colors.TEXT_PRIMARY }]}>Lịch trực</Text>
          <Text style={[styles.subtitle, { color: colors.TEXT_SECONDARY }]}>
             Chức năng xem lịch trực và đăng ký trực đang được đồng bộ từ bản Web.
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: colors.PRIMARY }]}
        >
          <Text style={styles.btnText}>Xem lịch tuần này</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  card: {
    width: '100%',
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  btn: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default DutyScreen;
