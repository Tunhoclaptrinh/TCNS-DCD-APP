import React, {useCallback, useState} from "react";
import {View, Text, StyleSheet, StatusBar, ScrollView, RefreshControl, TouchableOpacity} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {COLORS} from "@/src/styles/colors";
import {useAuth} from "@/src/hooks/useAuth";
import {ROUTE_NAMES} from "@/src/config/routes.config";

const HomeScreen = ({navigation}: any) => {
  const {user} = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.headerTitle}>{user?.fullName || "Guest"}</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate(ROUTE_NAMES.COMMON.NOTIFICATIONS)}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.PRIMARY} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.PRIMARY]} />}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.mainCard}>
          <Text style={styles.cardTitle}>Base App Project</Text>
          <Text style={styles.cardText}>
            This is a solid foundation for your mobile application. Start building your unique features by adding new
            screens and logic.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate(ROUTE_NAMES.TABS.PROFILE)}>
            <View style={[styles.actionIcon, {backgroundColor: "#E3F2FD"}]}>
              <Ionicons name="person-outline" size={24} color="#1976D2" />
            </View>
            <Text style={styles.actionLabel}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate(ROUTE_NAMES.COMMON.NOTIFICATIONS)}
          >
            <View style={[styles.actionIcon, {backgroundColor: "#FFF3E0"}]}>
              <Ionicons name="notifications-outline" size={24} color="#F57C00" />
            </View>
            <Text style={styles.actionLabel}>Alerts</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.WHITE,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  greeting: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.DARK,
  },
  iconBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    padding: 20,
  },
  mainCard: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.WHITE,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionItem: {
    width: "48%",
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.DARK,
  },
});

export default HomeScreen;
