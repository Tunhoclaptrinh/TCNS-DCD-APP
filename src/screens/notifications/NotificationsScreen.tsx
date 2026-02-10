import {useEffect, useState} from "react";
import {View, ScrollView, Text, TouchableOpacity, RefreshControl, ActivityIndicator, Alert} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllNotifications 
} from "@/src/store/slices/notificationSlice";

import SafeAreaView from "@/src/components/common/SafeAreaView";
import {Ionicons} from "@expo/vector-icons";
import EmptyState from "@/src/components/common/EmptyState/EmptyState";
import {COLORS} from "@/src/styles/colors";
import {formatDistanceToNow} from "date-fns";
import {vi} from "date-fns/locale";
import styles from "./styles";
import { Notification } from "@/src/services/notification.service";

const NotificationsScreen = ({navigation}: any) => {
  const dispatch = useDispatch<any>();
  const { items, loading, unreadCount } = useSelector((state: RootState) => state.notifications);
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
       // Legacy handling or new heritage logic
      // navigation.navigate("OrderDetail", {orderId: notification.refId});
    } else if (notification.type === "promotion") {
      // navigation.navigate("Search");
    } else if (notification.type === "review" && notification.refId) {
      // navigation.navigate("RestaurantDetail", {restaurantId: notification.refId});
    }
  };

  const handleDeleteNotification = (id: number, title: string) => {
    Alert.alert("Xóa thông báo", `Bạn có chắc muốn xóa "${title}"?`, [
      {text: "Hủy", style: "cancel"},
      {
        text: "Xóa",
        onPress: () => dispatch(deleteNotification(id)),
        style: "destructive",
      },
    ]);
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) {
      Alert.alert("Thông báo", "Tất cả thông báo đã được đọc");
      return;
    }
    Alert.alert("Đánh dấu đã đọc", "Đánh dấu tất cả thông báo là đã đọc?", [
      {text: "Hủy", style: "cancel"},
      {text: "Đồng ý", onPress: () => dispatch(markAllAsRead())},
    ]);
  };

  const handleClearAll = () => {
    Alert.alert("Xóa tất cả", "Bạn có chắc muốn xóa tất cả thông báo?", [
      {text: "Hủy", style: "cancel"},
      {
        text: "Xóa tất cả",
        onPress: () => dispatch(clearAllNotifications()),
        style: "destructive",
      },
    ]);
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
      return "Vừa xong";
    }
  };

  const filteredItems = selectedTab === "unread" ? items.filter((item) => !item.isRead) : items;

  if (loading && items.length === 0 && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "all" && styles.tabActive]}
          onPress={() => setSelectedTab("all")}
        >
          <Text style={[styles.tabText, selectedTab === "all" && styles.tabTextActive]}>Tất cả ({items.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "unread" && styles.tabActive]}
          onPress={() => setSelectedTab("unread")}
        >
          <Text style={[styles.tabText, selectedTab === "unread" && styles.tabTextActive]}>
            Chưa đọc ({unreadCount})
          </Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleMarkAllAsRead}>
            <Ionicons name="checkmark-done" size={20} color={COLORS.PRIMARY} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleClearAll}>
            <Ionicons name="trash-outline" size={20} color={COLORS.ERROR} />
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon="notifications-off-outline"
          title={selectedTab === "unread" ? "Không có thông báo chưa đọc" : "Chưa có thông báo"}
          subtitle={selectedTab === "unread" ? "Tất cả thông báo đã được đọc" : "Bạn sẽ nhận được thông báo ở đây"}
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
            />
          }
        >
          {filteredItems.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[styles.notificationCard, !notification.isRead && styles.notificationUnread]}
              onPress={() => handleNotificationPress(notification)}
              activeOpacity={0.7}
            >
              <View
                style={[styles.notificationIcon, {backgroundColor: getNotificationColor(notification.type) + "20"}]}
              >
                <Ionicons
                  name={getNotificationIcon(notification.type) as any}
                  size={24}
                  color={getNotificationColor(notification.type)}
                />
              </View>

              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle} numberOfLines={1}>
                    {notification.title}
                  </Text>
                  {!notification.isRead && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notificationMessage} numberOfLines={2}>
                  {notification.message}
                </Text>
                <Text style={styles.notificationTime}>{formatTime(notification.createdAt)}</Text>
              </View>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteNotification(notification.id, notification.title)}
              >
                <Ionicons name="close" size={20} color={COLORS.GRAY} />
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
