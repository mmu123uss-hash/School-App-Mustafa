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
import { useAuth } from "@/context/AuthContext";
import { STUDENTS } from "@/constants/students";
import { useColors } from "@/hooks/useColors";

export default function StudentGradesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { studentId } = useAuth();
  const { getStudentGrades, exams } = useApp();
  const student = STUDENTS.find((s) => s.id === studentId);
  const myGrades = getStudentGrades(studentId || "");

  const getScoreColor = (score: number, max: number) => {
    const p = score / max;
    if (p >= 0.85) return "#10B981";
    if (p >= 0.6) return "#F9A825";
    return "#EF4444";
  };

  const getScoreLabel = (score: number, max: number) => {
    const p = score / max;
    if (p >= 0.9) return "امتياز";
    if (p >= 0.75) return "جيد جداً";
    if (p >= 0.6) return "جيد";
    if (p >= 0.5) return "مقبول";
    return "راسب";
  };

  const avgScore =
    myGrades.length > 0
      ? Math.round(
          myGrades.reduce((acc, g) => acc + (g.score / g.exam.maxScore) * 100, 0) /
            myGrades.length
        )
      : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerBanner, { backgroundColor: "#1565C0" }]}>
        <View style={styles.bannerLeft}>
          <View style={[styles.avatar, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Text style={styles.avatarTxt}>{student?.name.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.bannerName}>{student?.name}</Text>
            <Text style={styles.bannerCode}>{student?.code}</Text>
          </View>
        </View>
        <View style={styles.bannerStats}>
          {avgScore !== null ? (
            <>
              <Text style={styles.statNum}>{avgScore}%</Text>
              <Text style={styles.statLbl}>المعدل</Text>
            </>
          ) : (
            <>
              <Text style={styles.statNum}>{exams.length}</Text>
              <Text style={styles.statLbl}>امتحان</Text>
            </>
          )}
        </View>
      </View>

      <FlatList
        data={myGrades}
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
            <Feather name="award" size={60} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              لا توجد درجات بعد
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              ستظهر درجاتك هنا بعد تصحيح الامتحانات
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const pct = item.score / item.exam.maxScore;
          const scoreColor = getScoreColor(item.score, item.exam.maxScore);
          return (
            <View
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.cardTop}>
                <View
                  style={[
                    styles.examIcon,
                    { backgroundColor: scoreColor + "15" },
                  ]}
                >
                  <Feather name="file-text" size={22} color={scoreColor} />
                </View>
                <View style={styles.examInfo}>
                  <Text
                    style={[styles.examTitle, { color: colors.foreground }]}
                  >
                    {item.exam.title}
                  </Text>
                  <Text
                    style={[styles.examDate, { color: colors.mutedForeground }]}
                  >
                    {item.exam.date}
                  </Text>
                </View>
                <View style={styles.scoreBlock}>
                  <Text style={[styles.scoreNum, { color: scoreColor }]}>
                    {item.score}
                  </Text>
                  <Text
                    style={[styles.scoreMax, { color: colors.mutedForeground }]}
                  >
                    /{item.exam.maxScore}
                  </Text>
                </View>
              </View>

              <View
                style={[styles.progressBg, { backgroundColor: colors.muted }]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${pct * 100}%` as any,
                      backgroundColor: scoreColor,
                    },
                  ]}
                />
              </View>

              <View style={styles.cardBottom}>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: scoreColor + "15" },
                  ]}
                >
                  <Text style={[styles.badgeTxt, { color: scoreColor }]}>
                    {getScoreLabel(item.score, item.exam.maxScore)}
                  </Text>
                </View>
                {item.feedback ? (
                  <Text
                    style={[
                      styles.feedback,
                      { color: colors.mutedForeground },
                    ]}
                    numberOfLines={1}
                  >
                    {item.feedback}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 20,
  },
  bannerLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  bannerName: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  bannerCode: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.72)",
    marginTop: 2,
  },
  bannerStats: { alignItems: "center" },
  statNum: { fontSize: 30, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  statLbl: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.72)",
  },
  list: { padding: 16, gap: 12 },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
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
    borderWidth: 1,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  examIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  examInfo: { flex: 1 },
  examTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  examDate: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  scoreBlock: { flexDirection: "row", alignItems: "baseline" },
  scoreNum: { fontSize: 28, fontFamily: "Inter_700Bold" },
  scoreMax: { fontSize: 13, fontFamily: "Inter_400Regular" },
  progressBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeTxt: { fontSize: 12, fontFamily: "Inter_500Medium" },
  feedback: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
});
