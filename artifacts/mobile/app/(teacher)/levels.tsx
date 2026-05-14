import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo } from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { STUDENTS } from "@/constants/students";
import { useColors } from "@/hooks/useColors";

const MEDALS = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

function buildShareMsg(
  name: string,
  code: string,
  avg: number,
  count: number
) {
  const label =
    avg >= 90
      ? "امتياز"
      : avg >= 75
      ? "جيد جداً"
      : avg >= 60
      ? "جيد"
      : avg >= 50
      ? "مقبول"
      : "يحتاج متابعة";
  return encodeURIComponent(
    `🎓 *EnglishApp - Mustafa Khalid*\n` +
      `━━━━━━━━━━━━━━━\n` +
      `👤 الطالب: ${name}\n` +
      `🔑 الرمز: ${code}\n` +
      `📊 المعدل العام: ${avg}%\n` +
      `📝 عدد الامتحانات: ${count}\n` +
      `⭐ المستوى: ${label}\n` +
      `━━━━━━━━━━━━━━━\n` +
      `#EnglishApp_MustafaKhalid`
  );
}

function openWhatsApp(msg: string) {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  const url =
    Platform.OS === "web"
      ? `https://web.whatsapp.com/send?text=${msg}`
      : `https://wa.me/?text=${msg}`;
  Linking.openURL(url).catch(() => {
    Linking.openURL(`https://wa.me/?text=${msg}`);
  });
}

export default function LevelsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { grades, exams } = useApp();

  const studentStats = useMemo(() => {
    return STUDENTS.map((student) => {
      const sg = grades.filter((g) => g.studentId === student.id);
      const percentages = sg
        .map((g) => {
          const exam = exams.find((e) => e.id === g.examId);
          return exam ? (g.score / exam.maxScore) * 100 : null;
        })
        .filter(Boolean) as number[];
      const avg =
        percentages.length > 0
          ? Math.round(
              percentages.reduce((a, b) => a + b, 0) / percentages.length
            )
          : null;
      return { student, avg, count: sg.length };
    }).sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1));
  }, [grades, exams]);

  const withGrades = studentStats.filter((s) => s.avg !== null);
  const top5 = withGrades.slice(0, 5);
  const needHelp = studentStats.filter((s) => s.avg !== null && s.avg < 60);
  const noGrades = studentStats.filter((s) => s.avg === null);

  const getAvgColor = (avg: number) => {
    if (avg >= 85) return "#10B981";
    if (avg >= 60) return "#F9A825";
    return "#EF4444";
  };

  const getSummaryLabel = (avg: number) => {
    if (avg >= 90) return "امتياز";
    if (avg >= 75) return "جيد جداً";
    if (avg >= 60) return "جيد";
    if (avg >= 50) return "مقبول";
    return "راسب";
  };

  const aboveAvg = withGrades.filter((s) => s.avg! >= 60).length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingBottom:
            insets.bottom + 24 + (Platform.OS === "web" ? 34 : 0),
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {withGrades.length === 0 ? (
        <View style={styles.noData}>
          <Feather name="users" size={64} color={colors.mutedForeground} />
          <Text style={[styles.noDataTitle, { color: colors.foreground }]}>
            لا توجد بيانات بعد
          </Text>
          <Text style={[styles.noDataSub, { color: colors.mutedForeground }]}>
            أدخل درجات الطلاب لتظهر مستوياتهم هنا
          </Text>
        </View>
      ) : (
        <>
          {/* Summary strip */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryPill, { backgroundColor: "#1565C020" }]}>
              <Text style={[styles.summaryNum, { color: "#1565C0" }]}>
                {withGrades.length}
              </Text>
              <Text style={[styles.summaryLbl, { color: "#1565C0" }]}>
                طالب مُقيَّم
              </Text>
            </View>
            <View style={[styles.summaryPill, { backgroundColor: "#10B98120" }]}>
              <Text style={[styles.summaryNum, { color: "#10B981" }]}>
                {aboveAvg}
              </Text>
              <Text style={[styles.summaryLbl, { color: "#10B981" }]}>
                ناجح
              </Text>
            </View>
            <View style={[styles.summaryPill, { backgroundColor: "#EF444420" }]}>
              <Text style={[styles.summaryNum, { color: "#EF4444" }]}>
                {needHelp.length}
              </Text>
              <Text style={[styles.summaryLbl, { color: "#EF4444" }]}>
                يحتاج تقوية
              </Text>
            </View>
          </View>

          {/* Top 5 */}
          {top5.length > 0 && (
            <View
              style={[
                styles.section,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  🏆 أعلى 5 طلاب
                </Text>
              </View>
              {top5.map((item, index) => (
                <View
                  key={item.student.id}
                  style={[
                    styles.studentRow,
                    index < top5.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                    index === 0 && {
                      backgroundColor: "#F9A82508",
                      borderRadius: 12,
                      marginHorizontal: -4,
                      paddingHorizontal: 4,
                    },
                  ]}
                >
                  <Text style={styles.medal}>{MEDALS[index]}</Text>
                  <View
                    style={[
                      styles.avatar,
                      {
                        backgroundColor:
                          index === 0
                            ? "#F9A82520"
                            : index === 1
                            ? "#9CA3AF20"
                            : index === 2
                            ? "#CD7C2F20"
                            : colors.secondary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.avatarTxt,
                        {
                          color:
                            index === 0
                              ? "#F9A825"
                              : index === 1
                              ? "#9CA3AF"
                              : index === 2
                              ? "#CD7C2F"
                              : colors.primary,
                        },
                      ]}
                    >
                      {item.student.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.studentMeta}>
                    <Text
                      style={[styles.studentName, { color: colors.foreground }]}
                    >
                      {item.student.name}
                    </Text>
                    <Text
                      style={[
                        styles.studentSub,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {item.student.code} · {item.count} امتحان
                    </Text>
                  </View>
                  <View style={styles.scoreWrap}>
                    <Text
                      style={[
                        styles.scorePct,
                        { color: getAvgColor(item.avg!) },
                      ]}
                    >
                      {item.avg}%
                    </Text>
                    <View
                      style={[
                        styles.labelBadge,
                        { backgroundColor: getAvgColor(item.avg!) + "18" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.labelTxt,
                          { color: getAvgColor(item.avg!) },
                        ]}
                      >
                        {getSummaryLabel(item.avg!)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.waBtn}
                    onPress={() =>
                      openWhatsApp(
                        buildShareMsg(
                          item.student.name,
                          item.student.code,
                          item.avg!,
                          item.count
                        )
                      )
                    }
                    activeOpacity={0.75}
                  >
                    <Text style={styles.waIcon}>📲</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Need Help */}
          {needHelp.length > 0 && (
            <View
              style={[
                styles.section,
                {
                  backgroundColor: colors.card,
                  borderColor: "#EF444430",
                  borderWidth: 1.5,
                },
              ]}
            >
              <View style={styles.sectionHeader}>
                <View
                  style={[
                    styles.alertBadge,
                    { backgroundColor: "#EF444415" },
                  ]}
                >
                  <Feather name="alert-triangle" size={14} color="#EF4444" />
                  <Text style={styles.alertTxt}>يحتاجون تقوية</Text>
                </View>
                <Text
                  style={[styles.helpCount, { color: colors.mutedForeground }]}
                >
                  معدل أقل من 60%
                </Text>
              </View>
              {needHelp.map((item, index) => (
                <View
                  key={item.student.id}
                  style={[
                    styles.studentRow,
                    index < needHelp.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: "#EF444415" },
                    ]}
                  >
                    <Text style={[styles.avatarTxt, { color: "#EF4444" }]}>
                      {item.student.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.studentMeta}>
                    <Text
                      style={[styles.studentName, { color: colors.foreground }]}
                    >
                      {item.student.name}
                    </Text>
                    <Text
                      style={[
                        styles.studentSub,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {item.student.code} · {item.count} امتحان
                    </Text>
                  </View>
                  <View style={styles.scoreWrap}>
                    <Text style={[styles.scorePct, { color: "#EF4444" }]}>
                      {item.avg}%
                    </Text>
                    <View style={[styles.miniBarBg, { backgroundColor: colors.muted }]}>
                      <View
                        style={[
                          styles.miniBarFill,
                          {
                            width: `${item.avg}%` as any,
                            backgroundColor: "#EF4444",
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.waBtn}
                    onPress={() =>
                      openWhatsApp(
                        buildShareMsg(
                          item.student.name,
                          item.student.code,
                          item.avg!,
                          item.count
                        )
                      )
                    }
                    activeOpacity={0.75}
                  >
                    <Text style={styles.waIcon}>📲</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* No grades yet */}
          {noGrades.length > 0 && (
            <View
              style={[
                styles.section,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.sectionHeader}>
                <Text
                  style={[styles.sectionTitle, { color: colors.mutedForeground }]}
                >
                  ⏳ لم يُصحَّح بعد ({noGrades.length})
                </Text>
              </View>
              <View style={styles.noGradeChips}>
                {noGrades.map((item) => (
                  <View
                    key={item.student.id}
                    style={[
                      styles.chip,
                      { backgroundColor: colors.muted, borderColor: colors.border },
                    ]}
                  >
                    <Text
                      style={[styles.chipTxt, { color: colors.mutedForeground }]}
                    >
                      {item.student.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 14, gap: 14 },
  noData: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 14,
  },
  noDataTitle: { fontSize: 20, fontFamily: "Inter_600SemiBold" },
  noDataSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  summaryRow: { flexDirection: "row", gap: 10 },
  summaryPill: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    gap: 3,
  },
  summaryNum: { fontSize: 26, fontFamily: "Inter_700Bold" },
  summaryLbl: { fontSize: 11, fontFamily: "Inter_500Medium" },
  section: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  alertBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  alertTxt: { color: "#EF4444", fontSize: 14, fontFamily: "Inter_700Bold" },
  helpCount: { fontSize: 12, fontFamily: "Inter_400Regular" },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
  },
  medal: { fontSize: 22, width: 28, textAlign: "center" },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarTxt: { fontSize: 17, fontFamily: "Inter_700Bold" },
  studentMeta: { flex: 1 },
  studentName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  studentSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  scoreWrap: { alignItems: "flex-end", gap: 4 },
  scorePct: { fontSize: 18, fontFamily: "Inter_700Bold" },
  labelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  labelTxt: { fontSize: 11, fontFamily: "Inter_500Medium" },
  miniBarBg: { width: 60, height: 5, borderRadius: 3, overflow: "hidden" },
  miniBarFill: { height: 5, borderRadius: 3 },
  waBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#25D36615",
    alignItems: "center",
    justifyContent: "center",
  },
  waIcon: { fontSize: 18 },
  noGradeChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipTxt: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
