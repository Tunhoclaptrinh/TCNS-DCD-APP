import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";
import { useTranslation } from "@/src/utils/i18n";

export default function SupportScreen() {
  const { t } = useTranslation();

  const openEmail = () => Linking.openURL("mailto:support@baseapp.com");
  const openPhone = () => Linking.openURL("tel:0123456789");

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={{ padding: 20 }}
    >
      {/* HEADER */}
      <Text
        style={{
          fontSize: 26,
          fontWeight: "bold",
          color: "#FF7A00",
          marginBottom: 10,
        }}
      >
        {t("support.helpCenter")}
      </Text>

      <Text style={{ fontSize: 15, color: "#555", marginBottom: 25 }}>
        {t("support.helpDesc")}
      </Text>

      {/* SECTION 1 — CONTACT */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          marginBottom: 12,
          color: "#333",
        }}
      >
        {t("support.contactChannels")}
      </Text>

      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          padding: 18,
          marginBottom: 22,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 5,
          shadowOffset: { width: 0, height: 3 },
          elevation: 3,
        }}
      >
        {/* EMAIL */}
        <TouchableOpacity
          onPress={openEmail}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <Text style={{ fontSize: 28, marginRight: 12 }}>📧</Text>
          <View>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#FF7A00" }}>
              Email
            </Text>
            <Text style={{ fontSize: 14, color: "#555" }}>
              support@baseapp.com
            </Text>
          </View>
        </TouchableOpacity>

        {/* PHONE */}
        <TouchableOpacity
          onPress={openPhone}
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 28, marginRight: 12 }}>📞</Text>
          <View>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#FF7A00" }}>
              {t("support.hotline")}
            </Text>
            <Text style={{ fontSize: 14, color: "#555" }}>0123 456 789</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* FOOTER */}
      <Text
        style={{
          textAlign: "center",
          marginTop: 25,
          fontSize: 14,
          color: "#777",
          marginBottom: 40,
        }}
      >
        {t("support.alwaysReady")}
      </Text>
    </ScrollView>
  );
}
