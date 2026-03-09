import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
} from "react-native";
import { useAuth } from "@hooks/useAuth";
import Input from "@/src/components/common/Input/Input";
import Button from "@/src/components/common/Button";
import { COLORS } from "@/src/styles/colors";
import { useTranslation } from "@/src/utils/i18n";

const RegisterScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      await register(formData as any);
    } catch (error: any) {
      setErrors({
        general: error.response?.data?.message || t("auth.registerFailed"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{t("auth.baseApp")}</Text>
        <Text style={styles.subtitle}>{t("auth.createAccount")}</Text>
      </View>

      <Input
        label={t("auth.fullName")}
        value={formData.name}
        onChangeText={(name) => setFormData({ ...formData, name })}
        error={errors.name}
      />

      <Input
        label={t("auth.email")}
        value={formData.email}
        onChangeText={(email) => setFormData({ ...formData, email })}
        keyboardType="email-address"
        error={errors.email}
      />

      <Input
        label={t("auth.phone")}
        value={formData.phone}
        onChangeText={(phone) => setFormData({ ...formData, phone })}
        keyboardType="phone-pad"
        error={errors.phone}
      />

      <Input
        label={t("auth.password")}
        value={formData.password}
        onChangeText={(password) => setFormData({ ...formData, password })}
        secureTextEntry
        error={errors.password}
      />

      <Input
        label={t("auth.confirmPassword")}
        value={formData.confirmPassword}
        onChangeText={(confirmPassword) =>
          setFormData({ ...formData, confirmPassword })
        }
        secureTextEntry
        error={errors.confirmPassword}
      />

      <Button
        title={t("auth.register")}
        onPress={handleRegister}
        loading={loading}
        containerStyle={styles.button}
      />

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.linkText}>{t("auth.backToLogin")}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.WHITE },
  content: { padding: 20, justifyContent: "center", flexGrow: 1 },
  headerContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: COLORS.PRIMARY,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.GRAY,
    textAlign: "center",
  },
  button: { marginTop: 20, width: "100%" },
  footer: { marginTop: 20, alignItems: "center" },
  linkText: { color: COLORS.PRIMARY, fontWeight: "600", textAlign: "center" },
});

export default RegisterScreen;
