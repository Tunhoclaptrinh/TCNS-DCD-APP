import { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/store";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from "@/src/store/slices/notificationSlice";

import SafeAreaView from "@/src/components/common/SafeAreaView";
import { Ionicons } from "@expo/vector-icons";
import EmptyState from "@/src/components/common/EmptyState/EmptyState";
import { COLORS } from "@/src/styles/colors";
import { useTheme } from "@/src/hooks/useTheme";
import { useTranslation } from "@/src/utils/i18n";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import styles from "./styles";
import { Notification } from "@/src/services/notification.service";

const NotificationsScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<any>();
  const { colors, isDark } = useTheme();
  const { t, locale } = useTranslation();
  const { items, loading, unreadCount } = useSelector(
    (state: RootState) => state.notifications,
  );
  const [selectedTab, setSelectedTab] = useState<"all" | "unread">("all");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const loadData = async () => {
    await dispatch(fetchNotifications());
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      dispatch(markAsRead(notification.id));
    }

    // Navigate based on type
    if (notification.type === "order" && notification.refId) {
      // Legacy handling
      // navigation.navigate("OrderDetail", {orderId: notification.refId});
    } else if (notification.type === "promotion") {
      // navigation.navigate("Search");
    } else if (notification.type === "review" && notification.refId) {
    }
  };

  const handleDeleteNotification = (id: number, title: string) => {
    Alert.alert(
      t("notifications.deleteNotification"),
      t("notifications.deleteConfirm", { title }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          onPress: () => dispatch(deleteNotification(id)),
          style: "destructive",
        },
      ],
    );
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) {
      Alert.alert(t("notifications.notifications"), t("notifications.allRead"));
      return;
    }
    Alert.alert(
      t("notifications.markAllAsRead"),
      t("notifications.markAllAsRead") + "?",
      [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("common.confirm"), onPress: () => dispatch(markAllAsRead()) },
      ],
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      t("notifications.clearAll"),
      t("notifications.clearAllConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("notifications.clearAll"),
          onPress: () => dispatch(clearAllNotifications()),
          style: "destructive",
        },
      ],
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return "receipt";
      case "promotion":
        return "pricetag";
      case "system":
        return "notifications";
      case "review":
        return "star";
      default:
        return "information-circle";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "order":
        return COLORS.PRIMARY;
      case "promotion":
        return COLORS.WARNING;
      case "system":
        return COLORS.INFO;
      case "review":
        return COLORS.SUCCESS;
      default:
        return COLORS.GRAY;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return t("notifications.justNow");
    }
  };

  const filteredItems =
    selectedTab === "unread" ? items.filter((item) => !item.isRead) : items;

  if (loading && items.length === 0 && !refreshing) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.BACKGROUND }]}
      >
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={[styles.loadingText, { color: colors.TEXT_SECONDARY }]}>
            {t("notifications.loadingNotifications")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.BACKGROUND }]}
    >
      {/* Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: colors.CARD_BG }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: isDark ? "#3A3A3A" : COLORS.LIGHT_GRAY },
            selectedTab === "all" && styles.tabActive,
          ]}
          onPress={() => setSelectedTab("all")}
        >
          <Text
            style={[
              styles.tabText,
              { color: isDark ? colors.TEXT_PRIMARY : COLORS.DARK_GRAY },
              selectedTab === "all" && styles.tabTextActive,
            ]}
          >
            {t("notifications.all")} ({items.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: isDark ? "#3A3A3A" : COLORS.LIGHT_GRAY },
            selectedTab === "unread" && styles.tabActive,
          ]}
          onPress={() => setSelectedTab("unread")}
        >
          <Text
            style={[
              styles.tabText,
              { color: isDark ? colors.TEXT_PRIMARY : COLORS.DARK_GRAY },
              selectedTab === "unread" && styles.tabTextActive,
            ]}
          >
            {t("notifications.unread")} ({unreadCount})
          </Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[
              styles.headerButton,
              { backgroundColor: isDark ? "#3A3A3A" : COLORS.LIGHT_GRAY },
            ]}
            onPress={handleMarkAllAsRead}
          >
            <Ionicons name="checkmark-done" size={20} color={COLORS.PRIMARY} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.headerButton,
              { backgroundColor: isDark ? "#3A3A3A" : COLORS.LIGHT_GRAY },
            ]}
            onPress={handleClearAll}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.ERROR} />
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon="notifications-off-outline"
          title={
            selectedTab === "unread"
              ? t("notifications.noUnreadNotifications")
              : t("notifications.noNotifications")
          }
          subtitle={
            selectedTab === "unread"
              ? t("notifications.allRead")
              : t("notifications.youWillReceiveNotificationsHere")
          }
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.PRIMARY]}
              tintColor={COLORS.PRIMARY}
              progressBackgroundColor={colors.CARD_BG}
            />
          }
        >
          {filteredItems.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                { backgroundColor: colors.CARD_BG },
                !notification.isRead && styles.notificationUnread,
              ]}
              onPress={() => handleNotificationPress(notification)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.notificationIcon,
                  {
                    backgroundColor:
                      getNotificationColor(notification.type) + "20",
                  },
                ]}
              >
                <Ionicons
                  name={getNotificationIcon(notification.type) as any}
                  size={24}
                  color={getNotificationColor(notification.type)}
                />
              </View>

              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text
                    style={[
                      styles.notificationTitle,
                      { color: colors.TEXT_PRIMARY },
                    ]}
                    numberOfLines={1}
                  >
                    {notification.title}
                  </Text>
                  {!notification.isRead && <View style={styles.unreadDot} />}
                </View>
                <Text
                  style={[
                    styles.notificationMessage,
                    { color: colors.TEXT_SECONDARY },
                  ]}
                  numberOfLines={2}
                >
                  {notification.message}
                </Text>
                <Text
                  style={[
                    styles.notificationTime,
                    { color: colors.TEXT_SECONDARY },
                  ]}
                >
                  {formatTime(notification.createdAt)}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() =>
                  handleDeleteNotification(notification.id, notification.title)
                }
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={colors.TEXT_SECONDARY}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default NotificationsScreen;
