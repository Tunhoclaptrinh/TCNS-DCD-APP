import { COLORS } from "@/src/styles/colors";
import { StyleSheet } from "react-native";

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.BACKGROUND,
    },
    header: {
      alignItems: "center",
      paddingVertical: 32,
      paddingHorizontal: 16,
      backgroundColor: isDark ? "#2a2a2a" : COLORS.LIGHT_GRAY,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.CARD_BG,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.TEXT_PRIMARY,
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.TEXT_SECONDARY,
      textAlign: "center",
      lineHeight: 20,
    },
    formSection: {
      padding: 16,
    },
    inputContainer: {
      marginBottom: 24,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.TEXT_PRIMARY,
      marginBottom: 8,
    },
    passwordInputContainer: {
      position: "relative",
    },
    input: {
      marginVertical: 0,
    },
    eyeIcon: {
      position: "absolute",
      right: 12,
      top: 12,
      padding: 4,
    },
    strengthContainer: {
      marginTop: 12,
    },
    strengthBars: {
      flexDirection: "row",
      gap: 4,
      marginBottom: 8,
    },
    strengthBar: {
      flex: 1,
      height: 4,
      backgroundColor: isDark ? "#3a3a3a" : COLORS.LIGHT_GRAY,
      borderRadius: 2,
    },
    strengthLabel: {
      fontSize: 12,
      fontWeight: "600",
    },
    matchIndicator: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 8,
    },
    matchText: {
      fontSize: 12,
      fontWeight: "500",
    },
    requirementsContainer: {
      backgroundColor: isDark ? "#2a3a4a" : "#F0F9FF",
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? "#3a4a5a" : "#BFDBFE",
    },
    requirementsTitle: {
      fontSize: 13,
      fontWeight: "600",
      color: COLORS.INFO,
      marginBottom: 12,
    },
    requirement: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    requirementText: {
      fontSize: 13,
      color: colors.TEXT_PRIMARY,
    },
    buttonContainer: {
      paddingHorizontal: 16,
      paddingBottom: 24,
    },
    button: {
      width: "100%",
    },
  });

export default createStyles;
