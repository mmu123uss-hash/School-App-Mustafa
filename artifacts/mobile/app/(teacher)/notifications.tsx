import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp, AppNotification } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { notifications, sendNotification, deleteNotification } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [messageInput, setMessageInput] = useState("");

  const handleSend = () => {
    if (!titleInput.trim()) {
      Alert.alert("تنبيه", "يرجى إدخال عنوان التبليغ");
      return;
    }
    if (!messageInput.trim()) {
      Alert.alert("تنبيه", "يرجى إدخال نص التبليغ");
      return;
    }
    sendNotification(titleInput.trim(), messageInput.trim());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTitleInput("");
    setMessageInput("");
    setModalVisible(false);
  };

  const handleDelete = (n: AppNotification) => {
    Alert.alert("حذف التبليغ", `هل تريد حذف "${n.title}"؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => {
          deleteNotification(n.id);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        },
      },
    ]);
  };

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
              insets.bottom + 100 + (Platform.OS === "web" ? 34 : 0),
          },
        ]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="bell-off" size={60} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              لا توجد تبليغات
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              اضغط + لإرسال تبليغ جديد للطلاب
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
            <View style={[styles.bellWrap, { backgroundColor: "#1565C015" }]}>
              <Feather name="bell" size={22} color={colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.notifTitle, { color: colors.foreground }]}>
                {item.title}
              </Text>
              <Text
                style={[styles.notifMsg, { color: colors.mutedForeground }]}
                numberOfLines={2}
              >
                {item.message}
              </Text>
              <Text
                style={[styles.notifDate, { color: colors.mutedForeground }]}
              >
                {formatDate(item.date)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDelete(item)}
              style={styles.deleteBtn}
            >
              <Feather name="trash-2" size={18} color={colors.destructive} />
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity
        style={[
          styles.fab,
          {
            bottom:
              insets.bottom + 20 + (Platform.OS === "web" ? 84 : 0),
          },
        ]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <Feather name="plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: colors.card }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
                تبليغ جديد
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.label, { color: colors.foreground }]}>
                عنوان التبليغ *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.muted,
                    color: colors.foreground,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="عنوان التبليغ"
                placeholderTextColor={colors.mutedForeground}
                value={titleInput}
                onChangeText={setTitleInput}
                textAlign="right"
              />
              <Text style={[styles.label, { color: colors.foreground }]}>
                نص الرسالة *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: colors.muted,
                    color: colors.foreground,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="اكتب رسالتك للطلاب هنا..."
                placeholderTextColor={colors.mutedForeground}
                value={messageInput}
                onChangeText={setMessageInput}
                multiline
                numberOfLines={5}
                textAlign="right"
                textAlignVertical="top"
              />
              <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                <Feather name="send" size={18} color="#FFFFFF" />
                <Text style={styles.sendTxt}>إرسال للجميع</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  cardContent: { flex: 1 },
  notifTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  notifMsg: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
    lineHeight: 20,
  },
  notifDate: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 8,
  },
  deleteBtn: { padding: 4, marginTop: 2 },
  fab: {
    position: "absolute",
    right: 20,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#F9A825",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F9A825",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 44,
    maxHeight: "80%",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  sheetTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  label: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    marginBottom: 8,
    marginTop: 12,
    textAlign: "right",
  },
  input: {
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
  },
  textArea: { height: 120, textAlignVertical: "top" },
  sendBtn: {
    backgroundColor: "#1565C0",
    borderRadius: 14,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 22,
  },
  sendTxt: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
