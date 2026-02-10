import React, {useState} from "react";
import {View, ScrollView, TouchableOpacity, Alert, Image, Text, TextInput} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { updateUser } from "@/src/store/slices/authSlice";

import SafeAreaView from "@/src/components/common/SafeAreaView";
import {Ionicons} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {apiClient} from "@config/api.client";
import {API_CONFIG} from "@config/api.config";
import Input from "@/src/components/common/Input/Input";
import Button from "@/src/components/common/Button";
import {COLORS} from "@/src/styles/colors";
import styles from "./styles";
import {getImageUrl} from "@/src/utils/formatters";

const EditProfileScreen = ({navigation}: any) => {
  const dispatch = useDispatch<any>();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    avatar: user?.avatar || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Tên là bắt buộc";
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
        newErrors.phone = "Số điện thoại không hợp lệ";
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
      setFormData({...formData, avatar: result.assets[0].uri});
    }
  };

  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setFormData({...formData, avatar: result.assets[0].uri});
    }
  };

  const handleAvatarPress = () => {
    Alert.alert("Thay đổi ảnh đại diện", "Chọn một tùy chọn", [
      {text: "Chụp ảnh", onPress: handleTakePhoto},
      {text: "Chọn từ thư viện", onPress: handlePickImage},
      {text: "Hủy", style: "cancel"},
    ]);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let updatedUser = {...user};

      // 1. Cập nhật thông tin văn bản
      const updateData = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
      };

      const textRes = await apiClient.put<any>("/users/profile", updateData);

      if (textRes.data && textRes.data.success) { 
          updatedUser = {...updatedUser, ...textRes.data.data};
      } 

      // 2. Upload Avatar
      const isNewImage = formData.avatar && !formData.avatar.startsWith("http") && !formData.avatar.startsWith("/"); 

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
             if (uploadJson.data.avatar) updatedUser.avatar = uploadJson.data.avatar;
        }
      }

      // 3. Cập nhật Store
      if (updatedUser) {
        // Ensure new fields are in the user object before dispatching
        updatedUser.phone = formData.phone;
        updatedUser.bio = formData.bio;
        await dispatch(updateUser(updatedUser as any)); 
      }

      Alert.alert("Thành công", "Cập nhật hồ sơ thành công", [{text: "OK", onPress: () => navigation.goBack()}]);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert("Lỗi", error.message || "Không thể cập nhật hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    return (
      formData.fullName !== user?.fullName ||
      formData.avatar !== user?.avatar ||
      formData.phone !== (user?.phone || "") ||
      formData.bio !== (user?.bio || "")
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarPress}>
            {formData.avatar ? (
              <Image source={{uri: getImageUrl(formData.avatar)}} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{formData.fullName?.charAt(0).toUpperCase() || "U"}</Text>
              </View>
            )}
            <View style={styles.cameraIconContainer}>
              <Ionicons name="camera" size={20} color={COLORS.WHITE} />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Nhấn để đổi ảnh đại diện</Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Ionicons name="mail-outline" size={20} color={COLORS.GRAY} />
              <Text style={styles.label}>Email</Text>
            </View>
            <View style={styles.readonlyInput}>
              <Text style={styles.readonlyText}>{user?.email}</Text>
              <View style={styles.readonlyBadge}>
                <Text style={styles.readonlyBadgeText}>Đã xác thực</Text>
              </View>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Ionicons name="person-outline" size={20} color={COLORS.GRAY} />
              <Text style={styles.label}>Họ và tên *</Text>
            </View>
            <Input
              value={formData.fullName}
              onChangeText={(fullName) => setFormData({...formData, fullName})}
              placeholder="Nhập họ tên của bạn"
              error={errors.fullName}
              containerStyle={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Ionicons name="call-outline" size={20} color={COLORS.GRAY} />
              <Text style={styles.label}>Số điện thoại</Text>
            </View>
            <Input
              value={formData.phone}
              onChangeText={(phone) => setFormData({...formData, phone})}
              placeholder="Nhập số điện thoại"
              error={errors.phone}
              containerStyle={styles.input}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Ionicons name="information-circle-outline" size={20} color={COLORS.GRAY} />
              <Text style={styles.label}>Giới thiệu</Text>
            </View>
            <TextInput
              style={[styles.bioInput, styles.input, {height: 100, textAlignVertical: 'top', paddingTop: 10}]}
              value={formData.bio}
              onChangeText={(bio) => setFormData({...formData, bio})}
              placeholder="Giới thiệu ngắn gọn về bạn..."
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomButtons}>
        <Button
          title="Hủy"
          onPress={() => navigation.goBack()}
          variant="outline"
          containerStyle={styles.actionButton}
        />
        <Button
          title={loading ? "Đang lưu..." : "Lưu thay đổi"}
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
