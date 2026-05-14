import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp, Exam } from "@/context/AppContext";
import { STUDENTS } from "@/constants/students";
import { useColors } from "@/hooks/useColors";

export default function GradesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { exams, getGrade, setGrade } = useApp();
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [gradeModal, setGradeModal] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<
    (typeof STUDENTS)[0] | null
  >(null);
  const [scoreInput, setScoreInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");

  const openGrade = (student: (typeof STUDENTS)[0]) => {
    if (!selectedExam) return;
    setSelectedStudent(student);
    const g = getGrade(student.id, selectedExam.id);
    setScoreInput(g ? g.score.toString() : "");
    setFeedbackInput(g?.feedback || "");
    setGradeModal(true);
  };

  const handleSave = () => {
    if (!selectedExam || !selectedStudent) return;
    const score = parseFloat(scoreInput);
    if (isNaN(score) || score < 0 || score > selectedExam.maxScore) {
      Alert.alert("خطأ", `الدرجة يجب أن تكون بين 0 و ${selectedExam.maxScore}`);
      return;
    }
    setGrade(selectedStudent.id, selectedExam.id, score, feedbackInput.trim());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setGradeModal(false);
  };

  const getScoreColor = (score: number, max: number) => {
    const p = score / max;
    if (p >= 0.85) return "#10B981";
    if (p >= 0.6) return "#F9A825";
    return "#EF4444";
  };

  const gradedCount = selectedExam
    ? STUDENTS.filter((s) => !!getGrade(s.id, selectedExam.id)).length
    : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        style={[
          styles.examSelector,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
        onPress={() => setPickerVisible(true)}
      >
        <Feather name="book-open" size={20} color={colors.primary} />
        <Text
          style={[
            styles.selectorTxt,
            {
              color: selectedExam ? colors.foreground : colors.mutedForeground,
            },
          ]}
        >
          {selectedExam ? selectedExam.title : "اختر الامتحان"}
        </Text>
        <Feather name="chevron-down" size={20} color={colors.mutedForeground} />
      </TouchableOpacity>

      {selectedExam && (
        <View style={styles.progressRow}>
          <Text style={[styles.progressTxt, { color: colors.mutedForeground }]}>
            تم تصحيح {gradedCount} من {STUDENTS.length} طالب
          </Text>
          <View
            style={[styles.progBg, { backgroundColor: colors.muted }]}
          >
            <View
              style={[
                styles.progFill,
                {
                  width: `${(gradedCount / STUDENTS.length) * 100}%` as any,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
        </View>
      )}

      {selectedExam ? (
        <FlatList
          data={STUDENTS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.list,
            {
              paddingBottom:
                insets.bottom + 20 + (Platform.OS === "web" ? 34 : 0),
            },
          ]}
          renderItem={({ item }) => {
            const grade = getGrade(item.id, selectedExam.id);
            return (
              <TouchableOpacity
                style={[
                  styles.studentCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: grade
                      ? getScoreColor(grade.score, selectedExam.maxScore) + "40"
                      : colors.border,
                  },
                ]}
                onPress={() => openGrade(item)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: colors.secondary },
                  ]}
                >
                  <Text
                    style={[styles.avatarTxt, { color: colors.primary }]}
                  >
                    {item.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.studentInfo}>
                  <Text
                    style={[styles.studentName, { color: colors.foreground }]}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      styles.studentCode,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {item.code}
                  </Text>
                </View>
                {grade ? (
                  <View style={styles.gradeBlock}>
                    <Text
                      style={[
                        styles.gradeScore,
                        {
                          color: getScoreColor(
                            grade.score,
                            selectedExam.maxScore
                          ),
                        },
                      ]}
                    >
                      {grade.score}
                    </Text>
                    <Text
                      style={[styles.gradeMax, { color: colors.mutedForeground }]}
                    >
                      /{selectedExam.maxScore}
                    </Text>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.noGrade,
                      { backgroundColor: colors.muted },
                    ]}
                  >
                    <Text
                      style={[
                        styles.noGradeTxt,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      لم يُصحح
                    </Text>
                  </View>
                )}
                <Feather
                  name="edit-2"
                  size={16}
                  color={colors.mutedForeground}
                  style={{ marginLeft: 6 }}
                />
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        <View style={styles.noExam}>
          <Feather name="bar-chart-2" size={60} color={colors.mutedForeground} />
          <Text style={[styles.noExamTxt, { color: colors.mutedForeground }]}>
            {exams.length === 0
              ? "أضف امتحاناً أولاً من تبويب الامتحانات"
              : "اختر امتحاناً لعرض درجات الطلاب"}
          </Text>
        </View>
      )}

      <Modal visible={pickerVisible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: colors.card }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
                اختر الامتحان
              </Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)}>
                <Feather name="x" size={24} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            {exams.length === 0 ? (
              <Text
                style={[
                  styles.noExamTxt,
                  { color: colors.mutedForeground, textAlign: "center", padding: 24 },
                ]}
              >
                لا توجد امتحانات بعد
              </Text>
            ) : (
              exams.map((exam) => (
                <TouchableOpacity
                  key={exam.id}
                  style={[
                    styles.examOpt,
                    {
                      borderColor:
                        selectedExam?.id === exam.id
                          ? colors.primary
                          : colors.border,
                      backgroundColor:
                        selectedExam?.id === exam.id
                          ? colors.secondary
                          : "transparent",
                    },
                  ]}
                  onPress={() => {
                    setSelectedExam(exam);
                    setPickerVisible(false);
                  }}
                >
                  <Feather
                    name="file-text"
                    size={20}
                    color={
                      selectedExam?.id === exam.id
                        ? colors.primary
                        : colors.mutedForeground
                    }
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.examOptTitle, { color: colors.foreground }]}
                    >
                      {exam.title}
                    </Text>
                    <Text
                      style={[
                        styles.examOptSub,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {exam.date} — {exam.maxScore} درجة
                    </Text>
                  </View>
                  {selectedExam?.id === exam.id && (
                    <Feather name="check" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={gradeModal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: colors.card }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
                {selectedStudent?.name}
              </Text>
              <TouchableOpacity onPress={() => setGradeModal(false)}>
                <Feather name="x" size={24} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            <Text
              style={[styles.gradeSubtitle, { color: colors.mutedForeground }]}
            >
              {selectedExam?.title} — من {selectedExam?.maxScore} درجة
            </Text>
            <TextInput
              style={[
                styles.bigInput,
                {
                  backgroundColor: colors.muted,
                  color: colors.foreground,
                  borderColor: colors.border,
                },
              ]}
              placeholder={`0 — ${selectedExam?.maxScore}`}
              placeholderTextColor={colors.mutedForeground}
              value={scoreInput}
              onChangeText={setScoreInput}
              keyboardType="numeric"
              textAlign="center"
            />
            <TextInput
              style={[
                styles.feedbackInput,
                {
                  backgroundColor: colors.muted,
                  color: colors.foreground,
                  borderColor: colors.border,
                },
              ]}
              placeholder="ملاحظة للطالب (اختياري)"
              placeholderTextColor={colors.mutedForeground}
              value={feedbackInput}
              onChangeText={setFeedbackInput}
              textAlign="right"
              multiline
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Feather name="check-circle" size={18} color="#FFFFFF" />
              <Text style={styles.saveTxt}>حفظ الدرجة</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  examSelector: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectorTxt: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
  },
  progressRow: { paddingHorizontal: 16, marginBottom: 8, gap: 6 },
  progressTxt: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right" },
  progBg: { height: 5, borderRadius: 3, overflow: "hidden" },
  progFill: { height: 5, borderRadius: 3 },
  list: { paddingHorizontal: 16, gap: 10 },
  studentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: { fontSize: 18, fontFamily: "Inter_700Bold" },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  studentCode: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  gradeBlock: { flexDirection: "row", alignItems: "baseline" },
  gradeScore: { fontSize: 24, fontFamily: "Inter_700Bold" },
  gradeMax: { fontSize: 12, fontFamily: "Inter_400Regular" },
  noGrade: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  noGradeTxt: { fontSize: 12, fontFamily: "Inter_400Regular" },
  noExam: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 40,
  },
  noExamTxt: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
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
    marginBottom: 8,
  },
  sheetTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  gradeSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginBottom: 18,
  },
  bigInput: {
    borderRadius: 14,
    padding: 16,
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    borderWidth: 1,
    marginBottom: 12,
    textAlign: "center",
  },
  feedbackInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
    height: 80,
    textAlignVertical: "top",
    marginBottom: 18,
  },
  saveBtn: {
    backgroundColor: "#1565C0",
    borderRadius: 14,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  saveTxt: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  examOpt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  examOptTitle: { fontSize: 15, fontFamily: "Inter_500Medium" },
  examOptSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
