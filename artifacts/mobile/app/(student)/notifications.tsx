import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function StudentNotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { notifications } = useApp();

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return (
      d.toLocaleDateString("ar-IQ") +
      "  " +
      d.toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          {
            paddingBottom:
              insets.bottom + 20 + (Platform.OS === "web" ? 34 : 0),
          },
        ]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="bell-off" size={60} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              لا توجد تبليغات
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              ستظهر هنا رسائل الأستاذ
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={[styles.bellWrap, { backgroundColor: "#F9A82520" }]}>
              <Feather name="bell" size={22} color="#F9A825" />
            </View>
            <View style={styles.content}>
              <Text style={[styles.notifTitle, { color: colors.foreground }]}>
                {item.title}
              </Text>
              <Text
                style={[styles.notifMsg, { color: colors.mutedForeground }]}
              >
                {item.message}
              </Text>
              <Text
                style={[styles.notifDate, { color: colors.mutedForeground }]}
              >
                {formatDate(item.date)}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, gap: 12 },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_600SemiBold" },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bellWrap: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  content: { flex: 1 },
  notifTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  notifMsg: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 5,
    lineHeight: 20,
  },
  notifDate: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 8,
  },
});
