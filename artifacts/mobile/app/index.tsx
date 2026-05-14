import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [role, setRole] = useState<"teacher" | "student">("student");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!code.trim()) {
      setError("يرجى إدخال الرمز");
      return;
    }
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 300));
    const result = login(role, code.trim());
    setLoading(false);
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (role === "teacher") {
        router.replace("/(teacher)/exams");
      } else {
        router.replace("/(student)/grades");
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(result.error || "خطأ في الدخول");
    }
  };

  return (
    <LinearGradient
      colors={["#0D47A1", "#1565C0", "#1E88E5"]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20) },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <Feather name="book-open" size={52} color="#F9A825" />
            </View>
            <Text style={styles.appTitle}>EnglishApp</Text>
            <Text style={styles.teacherName}>Mustafa Khalid</Text>
          </View>

          <View
            style={[
              styles.card,
              { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 28) },
            ]}
          >
            <Text style={styles.cardTitle}>مرحباً بك</Text>
            <Text style={styles.cardSubtitle}>اختر نوع الدخول</Text>

            <View style={styles.roleRow}>
              <Pressable
                style={[
                  styles.roleBtn,
                  role === "student" && styles.roleBtnActive,
                ]}
                onPress={() => {
                  setRole("student");
                  setCode("");
                  setError("");
                }}
              >
                <Feather
                  name="user"
                  size={24}
                  color={role === "student" ? "#fff" : "#1565C0"}
                />
                <Text
                  style={[
                    styles.roleTxt,
                    role === "student" && styles.roleTxtActive,
                  ]}
                >
                  طالب
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.roleBtn,
                  role === "teacher" && styles.roleBtnActive,
                ]}
                onPress={() => {
                  setRole("teacher");
                  setCode("");
                  setError("");
                }}
              >
                <Feather
                  name="briefcase"
                  size={24}
                  color={role === "teacher" ? "#fff" : "#1565C0"}
                />
                <Text
                  style={[
                    styles.roleTxt,
                    role === "teacher" && styles.roleTxtActive,
                  ]}
                >
                  أستاذ
                </Text>
              </Pressable>
            </View>

            <View style={styles.inputWrap}>
              <Feather
                name={role === "teacher" ? "lock" : "hash"}
                size={20}
                color="#6B7280"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={
                  role === "teacher"
                    ? "كلمة المرور"
                    : "رمز الطالب (مثال: ENG001)"
                }
                placeholderTextColor="#9CA3AF"
                value={code}
                onChangeText={(t) => {
                  setCode(t);
                  setError("");
                }}
                secureTextEntry={role === "teacher"}
                autoCapitalize={role === "student" ? "characters" : "none"}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={15} color="#EF4444" />
                <Text style={styles.errorTxt}>{error}</Text>
              </View>
            ) : null}

            {role === "student" && (
              <View style={styles.hintBox}>
                <Feather name="info" size={13} color="#1565C0" />
                <Text style={styles.hintTxt}>
                  الرموز من ENG001 إلى ENG010
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.loginBtn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#1a1a2e" />
              ) : (
                <>
                  <Text style={styles.loginTxt}>دخول</Text>
                  <Feather name="arrow-left" size={20} color="#1a1a2e" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gradient: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "flex-end" },
  header: { alignItems: "center", paddingBottom: 40 },
  iconWrap: {
    width: 108,
    height: 108,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    borderWidth: 2,
    borderColor: "rgba(249,168,37,0.45)",
  },
  appTitle: {
    fontSize: 38,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  teacherName: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.72)",
    marginTop: 4,
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    padding: 28,
    paddingTop: 34,
  },
  cardTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#1a1a2e",
    textAlign: "center",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 26,
  },
  roleRow: { flexDirection: "row", gap: 12, marginBottom: 22 },
  roleBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#1565C0",
    gap: 8,
  },
  roleBtnActive: { backgroundColor: "#1565C0" },
  roleTxt: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#1565C0",
  },
  roleTxtActive: { color: "#FFFFFF" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4FF",
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    height: 54,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#1a1a2e",
    textAlign: "right",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  errorTxt: {
    color: "#EF4444",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  hintBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EEF2FF",
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  hintTxt: {
    fontSize: 12,
    color: "#1565C0",
    fontFamily: "Inter_400Regular",
  },
  loginBtn: {
    backgroundColor: "#F9A825",
    borderRadius: 16,
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#F9A825",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  loginTxt: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#1a1a2e",
  },
});
