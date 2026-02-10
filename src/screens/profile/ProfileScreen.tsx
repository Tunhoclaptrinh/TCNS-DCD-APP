import React, {useState, useEffect} from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  RefreshControl,
  Dimensions,
} from "react-native";
import SafeAreaView from "@/src/components/common/SafeAreaView";
import {Ionicons} from "@expo/vector-icons";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useAuth} from "@hooks/useAuth";
import {apiClient} from "@config/api.client";
import {LinearGradient} from "expo-linear-gradient";
import {COLORS} from "@/src/styles/colors";
import {getImageUrl} from "@/src/utils/formatters";
import {ROUTE_NAMES} from "@/src/navigation";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/src/store";
import {fetchNotifications, fetchUnreadCount} from "@/src/store/slices/notificationSlice";
import {UserService} from "@/src/services/user.service";

interface UserStats {
  totalReviews: number;
  avgRating: number;
  totalFavorites: number;
  totalCollections?: number;
}

type TabType = "profile" | "activity" | "security";

const ProfileScreen = ({navigation}: any) => {
  const {user, signOut} = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [activities, setActivities] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const dispatch = useDispatch();
  const {unreadCount} = useSelector((state: RootState) => state.notifications);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadData();
    dispatch(fetchNotifications() as any);
    dispatch(fetchUnreadCount() as any);
  }, []);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // Mock data for Base Project
      setStats({
        totalReviews: 0,
        avgRating: 0,
        totalFavorites: 0,
        totalCollections: 0,
      });

      setActivities([
        {
          type: "login",
          title: "Welcome",
          description: "Welcome to your Base App!",
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Error loading profile data:", error);
    } finally {
      setLoading(false);
      setActivityLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      {text: "Cancel", style: "cancel"},
      {
        text: "Logout",
        onPress: async () => {
          await signOut();
        },
        style: "destructive",
      },
    ]);
  };

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === "profile" && styles.activeTabButton]}
        onPress={() => setActiveTab("profile")}
      >
        <Ionicons name="person-outline" size={18} color={activeTab === "profile" ? COLORS.PRIMARY : COLORS.GRAY} />
        <Text style={[styles.tabText, activeTab === "profile" && styles.activeTabText]}>Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === "activity" && styles.activeTabButton]}
        onPress={() => setActiveTab("activity")}
      >
        <Ionicons name="time-outline" size={18} color={activeTab === "activity" ? COLORS.PRIMARY : COLORS.GRAY} />
        <Text style={[styles.tabText, activeTab === "activity" && styles.activeTabText]}>Activity</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === "security" && styles.activeTabButton]}
        onPress={() => setActiveTab("security")}
      >
        <Ionicons
          name="shield-checkmark-outline"
          size={18}
          color={activeTab === "security" ? COLORS.PRIMARY : COLORS.GRAY}
        />
        <Text style={[styles.tabText, activeTab === "security" && styles.activeTabText]}>Security</Text>
      </TouchableOpacity>
    </View>
  );

  const renderProfileTab = () => (
    <>
      {/* Stats Grid */}
      {stats && (
        <View style={styles.statsGridSection}>
          <TouchableOpacity
            style={styles.statsCard}
            onPress={() => navigation.navigate("FavoritesList")}
            activeOpacity={0.7}
          >
            <View style={[styles.statsCardIcon, {backgroundColor: "#FFF0F5"}]}>
              <Ionicons name="heart" size={24} color="#E91E63" />
            </View>
            <Text style={styles.statsCardValue}>{stats.totalFavorites}</Text>
            <Text style={styles.statsCardLabel}>Favorites</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statsCard} activeOpacity={0.7}>
            <View style={[styles.statsCardIcon, {backgroundColor: "#E6F7FF"}]}>
              <Ionicons name="grid" size={24} color="#1890ff" />
            </View>
            <Text style={styles.statsCardValue}>{stats.totalCollections || 0}</Text>
            <Text style={styles.statsCardLabel}>Collections</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Menu Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("EditProfile")}>
            <View style={[styles.menuIcon, {backgroundColor: "#E8F5E9"}]}>
              <Ionicons name="person" size={20} color={COLORS.PRIMARY} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Edit Profile</Text>
              <Text style={styles.menuSubtitle}>Update personal information</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.GRAY} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate(ROUTE_NAMES.COMMON.NOTIFICATIONS)}
          >
            <View style={[styles.menuIcon, {backgroundColor: "#FFF3E0"}]}>
              <Ionicons name="notifications" size={20} color="#F57C00" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Notifications</Text>
              <Text style={styles.menuSubtitle}>{unreadCount} new alerts</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.GRAY} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Settings")}>
            <View style={[styles.menuIcon, {backgroundColor: "#F3E5F5"}]}>
              <Ionicons name="settings" size={20} color="#8E24AA" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Settings</Text>
              <Text style={styles.menuSubtitle}>Language, theme...</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.GRAY} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("TermsPrivacy")}>
            <View style={[styles.menuIcon, {backgroundColor: "#E3F2FD"}]}>
              <Ionicons name="document-text" size={20} color="#1976D2" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Terms & Privacy</Text>
              <Text style={styles.menuSubtitle}>Terms of use & Privacy policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.GRAY} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bio Section */}
      {user?.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <View style={styles.bioContainer}>
            <Text style={styles.bioText}>{user.bio}</Text>
          </View>
        </View>
      )}
    </>
  );

  const renderActivityTab = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {activityLoading ? (
        <ActivityIndicator color={COLORS.PRIMARY} style={{marginTop: 20}} />
      ) : (
        <View style={styles.timeline}>
          {activities.map((item, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View style={[styles.dot, {backgroundColor: getDotColor(item.type)}]} />
                {index !== activities.length - 1 && <View style={styles.connector} />}
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>{item.title}</Text>
                <Text style={styles.timelineDesc}>{item.description}</Text>
                <Text style={styles.timelineTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
            </View>
          ))}
          {activities.length === 0 && (
            <Text style={{textAlign: "center", color: COLORS.GRAY, marginTop: 20}}>No activity yet.</Text>
          )}
        </View>
      )}
    </View>
  );

  const getDotColor = (type: string) => {
    switch (type) {
      case "login":
        return "#4CAF50";
      case "profile":
        return "#2196F3";
      case "favorite":
        return "#E91E63";
      default:
        return COLORS.GRAY;
    }
  };

  const renderSecurityTab = () => (
    <View style={styles.section}>
      <View style={styles.securityCard}>
        <View style={styles.securityHeader}>
          <Ionicons name="shield-checkmark" size={32} color={COLORS.PRIMARY} />
          <View style={{flex: 1, marginLeft: 12}}>
            <Text style={styles.securityTitle}>Account Protected</Text>
            <Text style={styles.securityDesc}>Your password is strong and secure.</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.changePassBtn} onPress={() => navigation.navigate("ChangePassword")}>
          <Text style={styles.changePassText}>Change Password</Text>
        </TouchableOpacity>

        <View style={styles.loginHistory}>
          <Text style={styles.historyTitle}>Last Login:</Text>
          <Text style={styles.historyValue}>
            {user?.updatedAt ? new Date(user.updatedAt).toLocaleString() : "Just now"}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[COLORS.WHITE]}
          tintColor={COLORS.WHITE}
        />
      }
      contentContainerStyle={{backgroundColor: "#F8F9FA", minHeight: "100%"}}
    >
      <LinearGradient
        colors={[COLORS.PRIMARY, COLORS.PRIMARY]}
        style={[styles.headerGradient, {paddingTop: insets.top + 5}]}
      >
        <View style={styles.header}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {user?.avatar ? (
                <Image source={{uri: getImageUrl(user.avatar)}} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{user?.fullName?.charAt(0).toUpperCase() || "U"}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.editAvatarButton} onPress={() => navigation.navigate("EditProfile")}>
                <Ionicons name="camera" size={12} color={COLORS.PRIMARY} />
              </TouchableOpacity>
            </View>

            <View style={styles.userInfoContainer}>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.fullName ? user.fullName : user?.email}
              </Text>

              <View style={styles.roleBadge}>
                <Ionicons name="shield-checkmark" size={10} color={COLORS.PRIMARY} />
                <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
              </View>

              <Text style={styles.levelText}>Member</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.contentContainer}>
        {renderTabs()}

        <View style={styles.tabContent}>
          {activeTab === "profile" && renderProfileTab()}
          {activeTab === "activity" && renderActivityTab()}
          {activeTab === "security" && renderSecurityTab()}
        </View>
      </View>

      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.WHITE} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.versionSection}>
        <Text style={styles.versionText}>Base App v1.0.0</Text>
      </View>
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.GRAY,
  },
  headerGradient: {
    paddingBottom: 30, // Deep padding for balance
    borderBottomLeftRadius: 30, // Smooth curve matching image
    borderBottomRightRadius: 30,
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 20, // Increased horz padding slightly for better look
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8, // Reduced from 16
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.WHITE,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginTop: 20,
    paddingHorizontal: 24, // Optimized spacing
  },
  avatarContainer: {position: "relative"},
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.9)", // 80px matched
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.WHITE,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.9)",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
  },
  userInfoContainer: {justifyContent: "center", flex: 1},
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.WHITE,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.WHITE,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 6,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start", // Align left
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10, // Slimmer badge
    marginBottom: 4, // Space for Level
  },
  roleText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.PRIMARY,
    letterSpacing: 0.5,
  },
  levelText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "400",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.WHITE,
    padding: 4,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  activeTabButton: {
    backgroundColor: "#E8F5E9", // Light green
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.GRAY,
  },
  activeTabText: {
    color: COLORS.PRIMARY,
    fontWeight: "600",
  },
  tabContent: {
    minHeight: 300,
  },
  statsGridSection: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statsCard: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statsCardValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 2,
  },
  statsCardLabel: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.DARK,
    marginBottom: 12,
  },
  menuContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuContent: {flex: 1},
  menuTitle: {fontSize: 15, fontWeight: "600", color: COLORS.DARK, marginBottom: 2},
  menuSubtitle: {fontSize: 12, color: COLORS.GRAY},

  // Timeline Styles
  timeline: {paddingLeft: 10},
  timelineItem: {flexDirection: "row", paddingBottom: 24},
  timelineLeft: {alignItems: "center", marginRight: 16, width: 20},
  dot: {width: 12, height: 12, borderRadius: 6, zIndex: 1},
  connector: {width: 2, backgroundColor: "#E0E0E0", flex: 1, marginTop: -4, marginBottom: -4},
  timelineContent: {flex: 1, backgroundColor: COLORS.WHITE, padding: 12, borderRadius: 8},
  timelineTitle: {fontSize: 14, fontWeight: "700", color: COLORS.DARK, marginBottom: 4},
  timelineDesc: {fontSize: 13, color: COLORS.GRAY, marginBottom: 8},
  timelineTime: {fontSize: 11, color: "#999"},

  // Security Styles
  securityCard: {backgroundColor: COLORS.WHITE, borderRadius: 12, padding: 20, marginBottom: 16},
  securityHeader: {flexDirection: "row", marginBottom: 20},
  securityTitle: {fontSize: 16, fontWeight: "bold"},
  securityDesc: {fontSize: 13, color: COLORS.GRAY, marginTop: 4},
  changePassBtn: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  changePassText: {color: COLORS.WHITE, fontWeight: "600"},
  loginHistory: {borderTopWidth: 1, borderTopColor: "#F0F0F0", paddingTop: 16},
  historyTitle: {fontSize: 12, color: COLORS.GRAY},
  historyValue: {fontSize: 14, fontWeight: "500", marginTop: 4},

  bioContainer: {
    backgroundColor: COLORS.WHITE,
    padding: 16,
    borderRadius: 12,
  },
  bioText: {fontSize: 14, color: COLORS.DARK_GRAY, fontStyle: "italic", lineHeight: 22},

  logoutSection: {paddingHorizontal: 16, marginTop: 8},
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY,
    gap: 8,
  },
  logoutText: {fontSize: 15, fontWeight: "600", color: COLORS.WHITE},
  versionSection: {alignItems: "center", paddingVertical: 16},
  versionText: {fontSize: 12, color: COLORS.GRAY},
  bottomPadding: {height: 20},
});

export default ProfileScreen;
