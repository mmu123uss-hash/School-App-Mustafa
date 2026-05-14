import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
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

const GRADE_BANDS = [
  { label: "امتياز", min: 0.9, max: 1.01, color: "#10B981" },
  { label: "جيد جداً", min: 0.75, max: 0.9, color: "#3B82F6" },
  { label: "جيد", min: 0.6, max: 0.75, color: "#F9A825" },
  { label: "مقبول", min: 0.5, max: 0.6, color: "#F97316" },
  { label: "راسب", min: 0, max: 0.5, color: "#EF4444" },
];

function getBand(score: number, max: number) {
  const pct = score / max;
  return (
    GRADE_BANDS.find((b) => pct >= b.min && pct < b.max) ?? GRADE_BANDS[4]
  );
}

export default function StatsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { exams, grades } = useApp();
  const [selectedExamId, setSelectedExamId] = useState<string | null>(
    exams[0]?.id ?? null
  );

  const overallStats = useMemo(() => {
    const totalGrades = grades.length;
    const gradedStudents = new Set(grades.map((g) => g.studentId)).size;
    const percentages = grades
      .map((g) => {
        const exam = exams.find((e) => e.id === g.examId);
        return exam ? g.score / exam.maxScore : null;
      })
      .filter(Boolean) as number[];
    const overallAvg =
      percentages.length > 0
        ? Math.round(
            (percentages.reduce((a, b) => a + b, 0) / percentages.length) * 100
          )
        : null;
    return { totalGrades, gradedStudents, overallAvg };
  }, [grades, exams]);

  const examStats = useMemo(() => {
    return exams.map((exam) => {
      const examGrades = grades.filter((g) => g.examId === exam.id);
      const scores = examGrades.map((g) => g.score);
      const avg =
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : null;
      const min = scores.length > 0 ? Math.min(...scores) : null;
      const max = scores.length > 0 ? Math.max(...scores) : null;
      const distribution = GRADE_BANDS.map((band) => ({
        ...band,
        count: examGrades.filter((g) => {
          const pct = g.score / exam.maxScore;
          return pct >= band.min && pct < band.max;
        }).length,
      }));
      const avgPct = avg !== null ? (avg / exam.maxScore) * 100 : null;
      return { exam, avg, min, max, distribution, avgPct, count: scores.length };
    });
  }, [exams, grades]);

  const studentRankings = useMemo(() => {
    return STUDENTS.map((student) => {
      const studentGrades = grades.filter((g) => g.studentId === student.id);
      const percentages = studentGrades
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
      return { student, avg, count: studentGrades.length };
    })
      .filter((s) => s.avg !== null)
      .sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0));
  }, [grades, exams]);

  const selectedExamStats = examStats.find(
    (s) => s.exam.id === selectedExamId
  );

  const maxExamAvgPct = Math.max(
    ...examStats.map((s) => s.avgPct ?? 0),
    1
  );

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
      {exams.length === 0 ? (
        <View style={styles.noData}>
          <Feather name="bar-chart-2" size={64} color={colors.mutedForeground} />
          <Text style={[styles.noDataTitle, { color: colors.foreground }]}>
            لا توجد بيانات بعد
          </Text>
          <Text style={[styles.noDataSub, { color: colors.mutedForeground }]}>
            أضف امتحانات وأدخل درجات الطلاب لتظهر الإحصائيات هنا
          </Text>
        </View>
      ) : (
        <>
          {/* Summary Cards */}
          <View style={styles.cardsRow}>
            <View
              style={[
                styles.summaryCard,
                { backgroundColor: "#1565C0", flex: 1 },
              ]}
            >
              <Text style={styles.summaryNum}>{exams.length}</Text>
              <Text style={styles.summaryLbl}>امتحان</Text>
            </View>
            <View
              style={[
                styles.summaryCard,
                { backgroundColor: "#10B981", flex: 1 },
              ]}
            >
              <Text style={styles.summaryNum}>
                {overallStats.totalGrades}
              </Text>
              <Text style={styles.summaryLbl}>درجة مُدخلة</Text>
            </View>
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor:
                    overallStats.overallAvg !== null
                      ? overallStats.overallAvg >= 60
                        ? "#F9A825"
                        : "#EF4444"
                      : colors.mutedForeground,
                  flex: 1,
                },
              ]}
            >
              <Text style={styles.summaryNum}>
                {overallStats.overallAvg !== null
                  ? `${overallStats.overallAvg}%`
                  : "—"}
              </Text>
              <Text style={styles.summaryLbl}>المعدل العام</Text>
            </View>
          </View>

          {/* Exams Average Bar Chart */}
          <View
            style={[
              styles.section,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              معدل كل امتحان
            </Text>
            {examStats.length === 0 || examStats.every((s) => s.avg === null) ? (
              <Text
                style={[styles.noGradesTxt, { color: colors.mutedForeground }]}
              >
                لم يتم إدخال درجات بعد
              </Text>
            ) : (
              examStats.map((stat) => (
                <View key={stat.exam.id} style={styles.barRow}>
                  <Text
                    style={[styles.barLabel, { color: colors.foreground }]}
                    numberOfLines={1}
                  >
                    {stat.exam.title}
                  </Text>
                  <View style={styles.barTrack}>
                    {stat.avgPct !== null ? (
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${(stat.avgPct / maxExamAvgPct) * 100}%` as any,
                            backgroundColor: getBand(
                              stat.avg!,
                              stat.exam.maxScore
                            ).color,
                          },
                        ]}
                      />
                    ) : (
                      <View
                        style={[
                          styles.barFill,
                          { width: "8%", backgroundColor: colors.muted },
                        ]}
                      />
                    )}
                  </View>
                  <Text
                    style={[styles.barValue, { color: colors.mutedForeground }]}
                  >
                    {stat.avg !== null
                      ? `${stat.avg}/${stat.exam.maxScore}`
                      : "—"}
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* Grade Distribution per Exam */}
          <View
            style={[
              styles.section,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              توزيع الدرجات
            </Text>

            {/* Exam Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabScroll}
            >
              {exams.map((exam) => (
                <TouchableOpacity
                  key={exam.id}
                  style={[
                    styles.examTab,
                    {
                      backgroundColor:
                        selectedExamId === exam.id
                          ? colors.primary
                          : colors.muted,
                      borderColor:
                        selectedExamId === exam.id
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedExamId(exam.id)}
                >
                  <Text
                    style={[
                      styles.examTabTxt,
                      {
                        color:
                          selectedExamId === exam.id
                            ? "#FFFFFF"
                            : colors.mutedForeground,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {exam.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selectedExamStats ? (
              selectedExamStats.count === 0 ? (
                <Text
                  style={[
                    styles.noGradesTxt,
                    { color: colors.mutedForeground },
                  ]}
                >
                  لم يتم إدخال درجات لهذا الامتحان
                </Text>
              ) : (
                <>
                  <View style={styles.distRow}>
                    {selectedExamStats.distribution.map((band) => (
                      <View key={band.label} style={styles.distItem}>
                        <View style={styles.distBarWrap}>
                          <View
                            style={[
                              styles.distBar,
                              {
                                height:
                                  band.count > 0
                                    ? Math.max(
                                        (band.count /
                                          selectedExamStats.count) *
                                          120,
                                        8
                                      )
                                    : 4,
                                backgroundColor:
                                  band.count > 0
                                    ? band.color
                                    : colors.muted,
                              },
                            ]}
                          />
                        </View>
                        <Text
                          style={[
                            styles.distNum,
                            {
                              color:
                                band.count > 0 ? band.color : colors.mutedForeground,
                            },
                          ]}
                        >
                          {band.count}
                        </Text>
                        <Text
                          style={[
                            styles.distLabel,
                            { color: colors.mutedForeground },
                          ]}
                        >
                          {band.label}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View
                    style={[
                      styles.examSummaryRow,
                      { borderTopColor: colors.border },
                    ]}
                  >
                    <View style={styles.miniStat}>
                      <Text
                        style={[
                          styles.miniStatNum,
                          { color: colors.primary },
                        ]}
                      >
                        {selectedExamStats.avg ?? "—"}
                      </Text>
                      <Text
                        style={[
                          styles.miniStatLbl,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        المعدل
                      </Text>
                    </View>
                    <View style={styles.miniStat}>
                      <Text
                        style={[styles.miniStatNum, { color: "#10B981" }]}
                      >
                        {selectedExamStats.max ?? "—"}
                      </Text>
                      <Text
                        style={[
                          styles.miniStatLbl,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        الأعلى
                      </Text>
                    </View>
                    <View style={styles.miniStat}>
                      <Text
                        style={[styles.miniStatNum, { color: "#EF4444" }]}
                      >
                        {selectedExamStats.min ?? "—"}
                      </Text>
                      <Text
                        style={[
                          styles.miniStatLbl,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        الأدنى
                      </Text>
                    </View>
                    <View style={styles.miniStat}>
                      <Text
                        style={[styles.miniStatNum, { color: "#F9A825" }]}
                      >
                        {selectedExamStats.count}/{STUDENTS.length}
                      </Text>
                      <Text
                        style={[
                          styles.miniStatLbl,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        مُصحَّح
                      </Text>
                    </View>
                  </View>
                </>
              )
            ) : null}
          </View>

          {/* Student Rankings */}
          {studentRankings.length > 0 && (
            <View
              style={[
                styles.section,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                ترتيب الطلاب
              </Text>
              {studentRankings.map((item, index) => (
                <View key={item.student.id} style={styles.rankRow}>
                  <View
                    style={[
                      styles.rankNum,
                      {
                        backgroundColor:
                          index === 0
                            ? "#F9A825"
                            : index === 1
                            ? "#9CA3AF"
                            : index === 2
                            ? "#CD7C2F"
                            : colors.muted,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.rankNumTxt,
                        {
                          color:
                            index < 3 ? "#FFFFFF" : colors.mutedForeground,
                        },
                      ]}
                    >
                      {index + 1}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.rankAvatar,
                      { backgroundColor: colors.secondary },
                    ]}
                  >
                    <Text
                      style={[styles.rankAvatarTxt, { color: colors.primary }]}
                    >
                      {item.student.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.rankInfo}>
                    <Text
                      style={[styles.rankName, { color: colors.foreground }]}
                    >
                      {item.student.name}
                    </Text>
                    <Text
                      style={[
                        styles.rankCode,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {item.student.code} · {item.count} امتحان
                    </Text>
                  </View>
                  <View style={styles.rankScoreBlock}>
                    <Text
                      style={[
                        styles.rankScore,
                        {
                          color:
                            item.avg! >= 85
                              ? "#10B981"
                              : item.avg! >= 60
                              ? "#F9A825"
                              : "#EF4444",
                        },
                      ]}
                    >
                      {item.avg}%
                    </Text>
                    <View
                      style={[
                        styles.miniBar,
                        { backgroundColor: colors.muted },
                      ]}
                    >
                      <View
                        style={[
                          styles.miniBarFill,
                          {
                            width: `${item.avg}%` as any,
                            backgroundColor:
                              item.avg! >= 85
                                ? "#10B981"
                                : item.avg! >= 60
                                ? "#F9A825"
                                : "#EF4444",
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 14 },
  noData: {
    flex: 1,
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
  cardsRow: { flexDirection: "row", gap: 10 },
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryNum: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  summaryLbl: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.82)",
    marginTop: 3,
    textAlign: "center",
  },
  section: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  noGradesTxt: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingVertical: 12,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  barLabel: {
    width: 100,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textAlign: "right",
  },
  barTrack: {
    flex: 1,
    height: 12,
    backgroundColor: "#F0F4FF",
    borderRadius: 6,
    overflow: "hidden",
  },
  barFill: { height: 12, borderRadius: 6 },
  barValue: {
    width: 52,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textAlign: "left",
  },
  tabScroll: { marginBottom: 4 },
  examTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  examTabTxt: { fontSize: 13, fontFamily: "Inter_500Medium" },
  distRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: 160,
    paddingTop: 20,
  },
  distItem: { alignItems: "center", flex: 1, gap: 4 },
  distBarWrap: {
    flex: 1,
    justifyContent: "flex-end",
    width: "100%",
    alignItems: "center",
  },
  distBar: { width: "70%", borderRadius: 6, minHeight: 4 },
  distNum: { fontSize: 16, fontFamily: "Inter_700Bold" },
  distLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  examSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 14,
    borderTopWidth: 1,
  },
  miniStat: { alignItems: "center", gap: 3 },
  miniStatNum: { fontSize: 20, fontFamily: "Inter_700Bold" },
  miniStatLbl: { fontSize: 11, fontFamily: "Inter_400Regular" },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  rankNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rankNumTxt: { fontSize: 13, fontFamily: "Inter_700Bold" },
  rankAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  rankAvatarTxt: { fontSize: 15, fontFamily: "Inter_700Bold" },
  rankInfo: { flex: 1 },
  rankName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  rankCode: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  rankScoreBlock: { alignItems: "flex-end", gap: 4 },
  rankScore: { fontSize: 15, fontFamily: "Inter_700Bold" },
  miniBar: {
    width: 60,
    height: 5,
    borderRadius: 3,
    overflow: "hidden",
  },
  miniBarFill: { height: 5, borderRadius: 3 },
});
