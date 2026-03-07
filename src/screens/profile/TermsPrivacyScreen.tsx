import { View, Text, ScrollView } from "react-native";
import { COLORS } from "@/src/styles/colors";
import { useTheme } from "@/src/hooks/useTheme";

export default function TermsPrivacyScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.BACKGROUND }}>
      <View style={{ padding: 20 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 16,
            color: COLORS.PRIMARY,
          }}
        >
          Về Ứng dụng
        </Text>

        <Text
          style={{
            fontSize: 16,
            lineHeight: 28,
            marginBottom: 24,
            color: colors.TEXT_PRIMARY,
            textAlign: "justify",
          }}
        >
          Chào mừng bạn đến với{" "}
          <Text style={{ fontWeight: "bold", color: COLORS.PRIMARY }}>
            Base App
          </Text>{" "}
          - Một nền tảng khung (boilerplate) hiện đại cho ứng dụng mobile.
          {"\n"}
          Ứng dụng này cung cấp các tính năng nền tảng như xác thực, phân quyền,
          trợ lý AI và quản lý tài khoản, giúp bạn tập trung vào việc phát triển
          các tính năng nghiệp vụ chính.
          {"\n\n"}
          Với kiến trúc <Text style={{ fontWeight: "bold" }}>
            Module-based
          </Text>{" "}
          và tích hợp sẵn công nghệ{" "}
          <Text style={{ fontWeight: "bold", color: COLORS.PRIMARY }}>
            React Native & Expo
          </Text>
          , Base App mang đến trải nghiệm mượt mà, hiệu năng cao và dễ dàng tùy
          biến theo nhu cầu của bạn.
        </Text>

        <View
          style={{
            height: 1,
            backgroundColor: colors.BORDER,
            marginBottom: 24,
          }}
        />

        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 16,
            color: COLORS.PRIMARY,
          }}
        >
          Đội ngũ phát triển
        </Text>

        <View style={{ gap: 16 }}>
          {[
            {
              name: "Development Team",
              phone: "+84 123 456 789",
              email: "support@baseapp.com",
            },
          ].map((member, index) => (
            <View
              key={index}
              style={{
                backgroundColor: colors.CARD_BG,
                padding: 16,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: colors.TEXT_PRIMARY,
                  marginBottom: 4,
                }}
              >
                {member.name}
              </Text>
              <Text style={{ fontSize: 14, color: colors.TEXT_SECONDARY }}>
                📞 {member.phone}
              </Text>
              <Text style={{ fontSize: 14, color: colors.TEXT_SECONDARY }}>
                ✉️ {member.email}
              </Text>
            </View>
          ))}
        </View>

        <Text
          style={{
            fontSize: 14,
            color: colors.TEXT_SECONDARY,
            textAlign: "center",
            marginTop: 40,
            marginBottom: 20,
          }}
        >
          Phiên bản 2.1.0 - Made with ❤️ by Base Team
        </Text>
      </View>
    </ScrollView>
  );
}
