import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Text,
  TextInput,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { updateUser } from "@/src/store/slices/authSlice";

import SafeAreaView from "@/src/components/common/SafeAreaView";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { apiClient } from "@config/api.client";
import { API_CONFIG } from "@config/api.config";
import { useTheme } from "@/src/hooks/useTheme";
import Input from "@/src/components/common/Input/Input";
import Button from "@/src/components/common/Button";
import { COLORS } from "@/src/styles/colors";
import styles from "./styles";
import { getImageUrl } from "@/src/utils/formatters";
import { useTranslation } from "@/src/utils/i18n";

const EditProfileScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<any>();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || user?.fullName || "",
    avatar: user?.avatar || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t("profile.nameRequired");
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = t("profile.invalidPhone");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setFormData({ ...formData, avatar: result.assets[0].uri });
    }
  };

  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setFormData({ ...formData, avatar: result.assets[0].uri });
    }
  };

  const handleAvatarPress = () => {
    Alert.alert(t("profile.changeAvatar"), t("profile.chooseOption"), [
      { text: t("profile.takePhoto"), onPress: handleTakePhoto },
      { text: t("profile.chooseFromLibrary"), onPress: handlePickImage },
      { text: t("common.cancel"), style: "cancel" },
    ]);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let updatedUser = { ...user };

      // 1. Cập nhật thông tin văn bản
      const updateData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
      };

      const textRes = await apiClient.put<any>("/users/profile", updateData);

      if (textRes.data && textRes.data.success) {
        updatedUser = { ...updatedUser, ...textRes.data.data };
      }

      // 2. Upload Avatar
      const isNewImage =
        formData.avatar &&
        !formData.avatar.startsWith("http") &&
        !formData.avatar.startsWith("/");

      if (isNewImage) {
        const uploadData = new FormData();
        const uriParts = formData.avatar.split(".");
        const fileType = uriParts[uriParts.length - 1];

        // @ts-ignore: Bỏ qua lỗi check kiểu của FormData trên React Native
        uploadData.append("image", {
          uri: formData.avatar,
          name: `avatar.${fileType}`,
          type: `image/${fileType === "png" ? "png" : "jpeg"}`,
        });

        // Dùng fetch để tránh lỗi boundary của axios
        const uploadRes = await fetch(`${API_CONFIG.BASE_URL}/upload/avatar`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadData,
        });

        const uploadJson = await uploadRes.json();

        if (uploadJson.success && uploadJson.data?.user) {
          updatedUser = uploadJson.data.user;
        } else if (uploadJson.success && uploadJson.data) {
          if (uploadJson.data.avatar)
            updatedUser.avatar = uploadJson.data.avatar;
        }
      }

      // 3. Cập nhật Store
      if (updatedUser) {
        // Ensure new fields are in the user object before dispatching
        updatedUser.phone = formData.phone;
        updatedUser.bio = formData.bio;
        await dispatch(updateUser(updatedUser as any));
      }

      Alert.alert(t("common.success"), t("profile.saveProfileSuccess"), [
        { text: t("common.ok"), onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert(
        t("common.error"),
        error.message || t("profile.saveProfileFailed"),
      );
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    return (
      formData.name !== (user?.name || user?.fullName) ||
      formData.avatar !== user?.avatar ||
      formData.phone !== (user?.phone || "") ||
      formData.bio !== (user?.bio || "")
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.BACKGROUND }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.avatarSection,
            { backgroundColor: isDark ? "#2a2a2a" : COLORS.LIGHT_GRAY },
          ]}
        >
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleAvatarPress}
          >
            {formData.avatar ? (
              <Image
                source={{ uri: getImageUrl(formData.avatar) }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {formData.name?.charAt(0).toUpperCase() || "U"}
                </Text>
              </View>
            )}
            <View style={styles.cameraIconContainer}>
              <Ionicons name="camera" size={20} color={COLORS.WHITE} />
            </View>
          </TouchableOpacity>
          <Text
            style={[
              styles.avatarHint,
              { color: isDark ? colors.TEXT_SECONDARY : COLORS.GRAY },
            ]}
          >
            {t("profile.tapToChangeAvatar")}
          </Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={isDark ? colors.TEXT_SECONDARY : COLORS.GRAY}
              />
              <Text
                style={[
                  styles.label,
                  { color: isDark ? colors.TEXT_PRIMARY : COLORS.DARK },
                ]}
              >
                {t("auth.email")}
              </Text>
            </View>
            <View
              style={[
                styles.readonlyInput,
                {
                  backgroundColor: isDark ? "#3a3a3a" : COLORS.LIGHT_GRAY,
                  borderColor: isDark ? "#4a4a4a" : "#E5E7EB",
                },
              ]}
            >
              <Text
                style={[
                  styles.readonlyText,
                  { color: isDark ? colors.TEXT_SECONDARY : COLORS.GRAY },
                ]}
              >
                {user?.email}
              </Text>
              <View style={styles.readonlyBadge}>
                <Text style={styles.readonlyBadgeText}>
                  {t("profile.verified")}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color={isDark ? colors.TEXT_SECONDARY : COLORS.GRAY}
              />
              <Text
                style={[
                  styles.label,
                  { color: isDark ? colors.TEXT_PRIMARY : COLORS.DARK },
                ]}
              >
                {t("auth.fullName")} *
              </Text>
            </View>
            <Input
              value={formData.name}
              onChangeText={(name) => setFormData({ ...formData, name })}
              placeholder={t("auth.fullName")}
              error={errors.name}
              containerStyle={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Ionicons
                name="call-outline"
                size={20}
                color={isDark ? colors.TEXT_SECONDARY : COLORS.GRAY}
              />
              <Text
                style={[
                  styles.label,
                  { color: isDark ? colors.TEXT_PRIMARY : COLORS.DARK },
                ]}
              >
                {t("auth.phone")}
              </Text>
            </View>
            <Input
              value={formData.phone}
              onChangeText={(phone) => setFormData({ ...formData, phone })}
              placeholder={t("auth.phone")}
              error={errors.phone}
              containerStyle={styles.input}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={isDark ? colors.TEXT_SECONDARY : COLORS.GRAY}
              />
              <Text
                style={[
                  styles.label,
                  { color: isDark ? colors.TEXT_PRIMARY : COLORS.DARK },
                ]}
              >
                {t("profile.bio")}
              </Text>
            </View>
            <TextInput
              style={[
                styles.bioInput,
                styles.input,
                {
                  height: 100,
                  textAlignVertical: "top",
                  paddingTop: 10,
                  backgroundColor: isDark ? "#3a3a3a" : COLORS.LIGHT_GRAY,
                  borderColor: isDark ? "#4a4a4a" : "#E5E7EB",
                  color: isDark ? colors.TEXT_PRIMARY : COLORS.DARK,
                },
              ]}
              value={formData.bio}
              onChangeText={(bio) => setFormData({ ...formData, bio })}
              placeholder={t("profile.bioPlaceholder")}
              placeholderTextColor={
                isDark ? colors.TEXT_SECONDARY : COLORS.GRAY
              }
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomButtons,
          {
            backgroundColor: colors.CARD_BG,
            borderTopColor: isDark ? "#4a4a4a" : COLORS.LIGHT_GRAY,
          },
        ]}
      >
        <Button
          title={t("common.cancel")}
          onPress={() => navigation.goBack()}
          variant="outline"
          containerStyle={styles.actionButton}
        />
        <Button
          title={loading ? t("profile.saving") : t("profile.save")}
          onPress={handleSave}
          loading={loading}
          disabled={loading || !hasChanges()}
          containerStyle={styles.actionButton}
        />
      </View>
    </SafeAreaView>
  );
};

export default EditProfileScreen;
