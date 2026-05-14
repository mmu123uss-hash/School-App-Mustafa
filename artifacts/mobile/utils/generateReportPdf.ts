import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Exam, Grade } from "@/context/AppContext";
import { STUDENTS } from "@/constants/students";

const GRADE_BANDS = [
  { label: "امتياز", min: 0.9, color: "#10B981" },
  { label: "جيد جداً", min: 0.75, color: "#3B82F6" },
  { label: "جيد", min: 0.6, color: "#F9A825" },
  { label: "مقبول", min: 0.5, color: "#F97316" },
  { label: "راسب", min: 0, color: "#EF4444" },
];

function getLabel(score: number, max: number) {
  const pct = score / max;
  return (
    [...GRADE_BANDS].reverse().find((b) => pct >= b.min) ?? GRADE_BANDS[4]
  );
}

function getBar(score: number, max: number) {
  const pct = Math.round((score / max) * 100);
  const { color } = getLabel(score, max);
  return `
    <div style="display:flex;align-items:center;gap:8px;">
      <div style="flex:1;height:8px;background:#E2E8F0;border-radius:4px;overflow:hidden;">
        <div style="width:${pct}%;height:8px;background:${color};border-radius:4px;"></div>
      </div>
      <span style="font-size:12px;color:#6B7280;min-width:32px;text-align:left;">${pct}%</span>
    </div>
  `;
}

export async function exportExamPDF(
  exam: Exam,
  grades: Grade[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const examGrades = grades.filter((g) => g.examId === exam.id);
    const scores = examGrades.map((g) => g.score);
    const avg =
      scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) /
          10
        : null;
    const highest = scores.length > 0 ? Math.max(...scores) : null;
    const lowest = scores.length > 0 ? Math.min(...scores) : null;
    const passCount = examGrades.filter(
      (g) => g.score / exam.maxScore >= 0.5
    ).length;

    const rows = STUDENTS.map((student, i) => {
      const grade = examGrades.find((g) => g.studentId === student.id);
      const rowBg = i % 2 === 0 ? "#F8FAFF" : "#FFFFFF";
      if (!grade) {
        return `
          <tr style="background:${rowBg};">
            <td style="padding:12px 16px;text-align:center;font-weight:600;color:#6B7280;">${i + 1}</td>
            <td style="padding:12px 16px;text-align:right;font-weight:600;color:#1a1a2e;">${student.name}</td>
            <td style="padding:12px 16px;text-align:center;color:#6B7280;font-size:13px;">${student.code}</td>
            <td style="padding:12px 16px;text-align:center;color:#9CA3AF;font-style:italic;">—</td>
            <td style="padding:12px 16px;text-align:center;">
              <span style="background:#F3F4F6;color:#9CA3AF;padding:3px 10px;border-radius:20px;font-size:12px;">لم يصحح</span>
            </td>
            <td style="padding:12px 16px;"></td>
          </tr>
        `;
      }
      const { label, color } = getLabel(grade.score, exam.maxScore);
      return `
        <tr style="background:${rowBg};">
          <td style="padding:12px 16px;text-align:center;font-weight:600;color:#6B7280;">${i + 1}</td>
          <td style="padding:12px 16px;text-align:right;font-weight:600;color:#1a1a2e;">${student.name}</td>
          <td style="padding:12px 16px;text-align:center;color:#6B7280;font-size:13px;">${student.code}</td>
          <td style="padding:12px 16px;text-align:center;font-size:20px;font-weight:700;color:${color};">${grade.score} <span style="font-size:13px;color:#9CA3AF;">/ ${exam.maxScore}</span></td>
          <td style="padding:12px 16px;text-align:center;">
            <span style="background:${color}20;color:${color};padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">${label}</span>
          </td>
          <td style="padding:12px 16px;">${getBar(grade.score, exam.maxScore)}</td>
        </tr>
        ${
          grade.feedback
            ? `<tr style="background:${rowBg};"><td colspan="6" style="padding:0 16px 10px;padding-right:50px;color:#6B7280;font-size:12px;font-style:italic;">ملاحظة: ${grade.feedback}</td></tr>`
            : ""
        }
      `;
    }).join("");

    const todayStr = new Date().toLocaleDateString("ar-IQ");
    const gradedCount = examGrades.length;

    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background:#fff; color:#1a1a2e; direction:rtl; }
    .header { background:linear-gradient(135deg,#0D47A1,#1E88E5); color:#fff; padding:32px 40px; }
    .header-top { display:flex; align-items:center; gap:16px; margin-bottom:20px; }
    .logo { width:52px;height:52px;background:rgba(255,255,255,0.2);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:24px;border:2px solid rgba(249,168,37,0.5); }
    .app-name { font-size:26px; font-weight:800; letter-spacing:-0.5px; }
    .app-sub { font-size:13px; opacity:0.75; margin-top:3px; }
    .exam-title { font-size:20px; font-weight:700; margin-bottom:6px; }
    .exam-meta { font-size:13px; opacity:0.82; }
    .stats-bar { display:flex; gap:0; margin-top:20px; }
    .stat-pill { flex:1; background:rgba(255,255,255,0.15); border-radius:12px; padding:12px 16px; text-align:center; margin:0 4px; }
    .stat-pill:first-child { margin-right:0; }
    .stat-pill:last-child { margin-left:0; }
    .stat-num { font-size:22px; font-weight:800; display:block; }
    .stat-lbl { font-size:11px; opacity:0.82; margin-top:2px; display:block; }
    .gold { color:#F9A825; }
    table { width:100%; border-collapse:collapse; }
    thead tr { background:#1565C0; color:#fff; }
    thead th { padding:12px 16px; font-size:13px; font-weight:600; text-align:center; }
    thead th:nth-child(2) { text-align:right; }
    .footer { text-align:center; padding:24px; color:#9CA3AF; font-size:12px; border-top:1px solid #E2E8F0; margin-top:16px; }
    .watermark { color:#1565C020; font-size:10px; }
  </style>
</head>
<body>

<div class="header">
  <div class="header-top">
    <div class="logo">📖</div>
    <div>
      <div class="app-name">EnglishApp</div>
      <div class="app-sub">Mustafa Khalid</div>
    </div>
  </div>
  <div class="exam-title">${exam.title}</div>
  <div class="exam-meta">
    تاريخ الامتحان: ${exam.date} &nbsp;·&nbsp; الدرجة الكاملة: ${exam.maxScore} &nbsp;·&nbsp; تاريخ التقرير: ${todayStr}
  </div>
  <div class="stats-bar">
    <div class="stat-pill">
      <span class="stat-num gold">${avg !== null ? avg : "—"}</span>
      <span class="stat-lbl">المعدل</span>
    </div>
    <div class="stat-pill">
      <span class="stat-num" style="color:#86EFAC;">${highest !== null ? highest : "—"}</span>
      <span class="stat-lbl">الأعلى</span>
    </div>
    <div class="stat-pill">
      <span class="stat-num" style="color:#FCA5A5;">${lowest !== null ? lowest : "—"}</span>
      <span class="stat-lbl">الأدنى</span>
    </div>
    <div class="stat-pill">
      <span class="stat-num">${gradedCount}/${STUDENTS.length}</span>
      <span class="stat-lbl">مُصحَّح</span>
    </div>
    <div class="stat-pill">
      <span class="stat-num" style="color:#86EFAC;">${passCount}</span>
      <span class="stat-lbl">ناجح</span>
    </div>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th style="width:48px;">#</th>
      <th style="text-align:right;">اسم الطالب</th>
      <th>الرمز</th>
      <th>الدرجة</th>
      <th>التقييم</th>
      <th style="width:160px;">النسبة</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>

<div class="footer">
  تم إنشاء هذا التقرير بواسطة <strong>EnglishApp Mustafa Khalid</strong> — ${todayStr}
</div>

</body>
</html>
    `;

    const { uri } = await Print.printToFileAsync({ html, base64: false });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `تقرير درجات — ${exam.title}`,
        UTI: "com.adobe.pdf",
      });
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message ?? "حدث خطأ أثناء التصدير" };
  }
}
