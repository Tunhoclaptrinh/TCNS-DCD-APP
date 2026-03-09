import { View, Text, ScrollView } from "react-native";
import { COLORS } from "@/src/styles/colors";
import { useTheme } from "@/src/hooks/useTheme";
import { useTranslation } from "@/src/utils/i18n";

export default function TermsPrivacyScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();

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
          {t("terms.aboutApp")}
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
          {t("terms.aboutContent")}
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
          {t("terms.devTeam")}
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
          {t("terms.versionMadeBy")}
        </Text>
      </View>
    </ScrollView>
  );
}
