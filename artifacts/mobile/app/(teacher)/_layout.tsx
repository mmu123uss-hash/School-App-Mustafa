import { Feather } from "@expo/vector-icons";
import { Tabs, router } from "expo-router";
import React from "react";
import { Platform, TouchableOpacity } from "react-native";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

export default function TeacherLayout() {
  const colors = useColors();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerStyle: { backgroundColor: "#1565C0" },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontFamily: "Inter_600SemiBold",
          fontSize: 18,
        },
        headerRight: () => (
          <TouchableOpacity
            onPress={handleLogout}
            style={{ marginRight: 16, padding: 4 }}
          >
            <Feather name="log-out" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        ),
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          ...(Platform.OS === "web" ? { height: 84 } : {}),
        },
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="exams"
        options={{
          title: "الامتحانات",
          tabBarIcon: ({ color }) => (
            <Feather name="book-open" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="grades"
        options={{
          title: "الدرجات",
          tabBarIcon: ({ color }) => (
            <Feather name="bar-chart-2" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "التبليغات",
          tabBarIcon: ({ color }) => (
            <Feather name="bell" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
