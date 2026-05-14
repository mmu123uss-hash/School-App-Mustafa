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
import { useApp, Exam } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function ExamsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { exams, addExam, deleteExam } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [maxScore, setMaxScore] = useState("100");
  const [description, setDescription] = useState("");

  const resetForm = () => {
    setTitle("");
    setMaxScore("100");
    setDescription("");
  };

  const handleAdd = () => {
    if (!title.trim()) {
      Alert.alert("تنبيه", "يرجى إدخال اسم الامتحان");
      return;
    }
    const score = parseInt(maxScore);
    if (isNaN(score) || score <= 0) {
      Alert.alert("تنبيه", "يرجى إدخال درجة صحيحة");
      return;
    }
    addExam({
      title: title.trim(),
      date: new Date().toLocaleDateString("ar-IQ"),
      maxScore: score,
      description: description.trim(),
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    resetForm();
    setModalVisible(false);
  };

  const handleDelete = (exam: Exam) => {
    Alert.alert("حذف الامتحان", `هل تريد حذف "${exam.title}"؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => {
          deleteExam(exam.id);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={exams}
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
            <Feather name="book" size={60} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              لا توجد امتحانات
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              اضغط + لإضافة امتحان جديد
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
            <View
              style={[styles.examIcon, { backgroundColor: colors.secondary }]}
            >
              <Feather name="file-text" size={26} color={colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.examTitle, { color: colors.foreground }]}>
                {item.title}
              </Text>
              <Text style={[styles.examDate, { color: colors.mutedForeground }]}>
                {item.date}
              </Text>
              {item.description ? (
                <Text
                  style={[styles.examDesc, { color: colors.mutedForeground }]}
                  numberOfLines={1}
                >
                  {item.description}
                </Text>
              ) : null}
            </View>
            <View style={styles.cardRight}>
              <View style={[styles.scoreBadge, { backgroundColor: "#F9A82520" }]}>
                <Text style={[styles.scoreNum, { color: "#F9A825" }]}>
                  {item.maxScore}
                </Text>
                <Text style={[styles.scoreLbl, { color: "#F9A825" }]}>
                  درجة
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                style={styles.deleteBtn}
              >
                <Feather name="trash-2" size={18} color={colors.destructive} />
              </TouchableOpacity>
            </View>
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
                امتحان جديد
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
                اسم الامتحان *
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
                placeholder="مثال: امتحان الفصل الأول"
                placeholderTextColor={colors.mutedForeground}
                value={title}
                onChangeText={setTitle}
                textAlign="right"
              />
              <Text style={[styles.label, { color: colors.foreground }]}>
                الدرجة الكاملة *
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
                placeholder="100"
                placeholderTextColor={colors.mutedForeground}
                value={maxScore}
                onChangeText={setMaxScore}
                keyboardType="numeric"
                textAlign="right"
              />
              <Text style={[styles.label, { color: colors.foreground }]}>
                وصف (اختياري)
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
                placeholder="وصف مختصر للامتحان..."
                placeholderTextColor={colors.mutedForeground}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlign="right"
                textAlignVertical="top"
              />
              <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
                <Feather name="plus-circle" size={18} color="#FFFFFF" />
                <Text style={styles.addBtnTxt}>إضافة الامتحان</Text>
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
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  examIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: { flex: 1 },
  examTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  examDate: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3 },
  examDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  cardRight: { alignItems: "flex-end", gap: 8 },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignItems: "center",
  },
  scoreNum: { fontSize: 20, fontFamily: "Inter_700Bold" },
  scoreLbl: { fontSize: 10, fontFamily: "Inter_400Regular" },
  deleteBtn: { padding: 4 },
  fab: {
    position: "absolute",
    right: 20,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#1565C0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1565C0",
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
    maxHeight: "85%",
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
    marginTop: 14,
    textAlign: "right",
  },
  input: {
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
  },
  textArea: { height: 88, textAlignVertical: "top" },
  addBtn: {
    backgroundColor: "#1565C0",
    borderRadius: 14,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 22,
  },
  addBtnTxt: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
