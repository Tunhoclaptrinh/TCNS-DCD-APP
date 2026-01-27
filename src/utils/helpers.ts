import {Address} from "react-native-maps";

import {Linking, Platform, Alert} from "react-native";

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};



export const openMap = (lat?: number, lng?: number, label?: string) => {
  if (!lat || !lng) {
    Alert.alert("Lỗi", "Không tìm thấy tọa độ địa điểm này");
    return;
  }

  const scheme = Platform.select({ios: "maps:0,0?q=", android: "geo:0,0?q="});
  const latLng = `${lat},${lng}`;
  const labelText = label || "Vị trí giao hàng";
  const url = Platform.select({
    ios: `${scheme}${labelText}@${latLng}`,
    android: `${scheme}${latLng}(${labelText})`,
  });

  if (url) {
    Linking.openURL(url).catch(() => {
      Alert.alert("Lỗi", "Không thể mở ứng dụng bản đồ");
    });
  }
};
