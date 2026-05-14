import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Exam, Grade } from "@/context/AppContext";
import { Student } from "@/constants/students";

const GRADE_BANDS = [
  { label: "امتياز", min: 0.9, color: "#10B981", bg: "#D1FAE5" },
  { label: "جيد جداً", min: 0.75, color: "#3B82F6", bg: "#DBEAFE" },
  { label: "جيد", min: 0.6, color: "#F9A825", bg: "#FEF3C7" },
  { label: "مقبول", min: 0.5, color: "#F97316", bg: "#FFEDD5" },
  { label: "راسب", min: 0, color: "#EF4444", bg: "#FEE2E2" },
];

function getBand(score: number, max: number) {
  const pct = score / max;
  return (
    [...GRADE_BANDS].reverse().find((b) => pct >= b.min) ?? GRADE_BANDS[4]
  );
}

function getStars(score: number, max: number) {
  const pct = score / max;
  const filled = Math.round(pct * 5);
  return Array.from({ length: 5 }, (_, i) =>
    i < filled ? "★" : "☆"
  ).join("");
}

export async function exportStudentReportPDF(
  student: Student,
  grades: Grade[],
  exams: Exam[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const studentGrades = grades
      .filter((g) => g.studentId === student.id)
      .map((g) => ({ ...g, exam: exams.find((e) => e.id === g.examId)! }))
      .filter((g) => !!g.exam)
      .sort((a, b) => a.exam.date.localeCompare(b.exam.date));

    const percentages = studentGrades.map(
      (g) => (g.score / g.exam.maxScore) * 100
    );
    const avg =
      percentages.length > 0
        ? Math.round(
            percentages.reduce((a, b) => a + b, 0) / percentages.length
          )
        : null;

    const passCount = studentGrades.filter(
      (g) => g.score / g.exam.maxScore >= 0.5
    ).length;

    const overallBand =
      avg !== null ? getBand(avg, 100) : null;

    const todayStr = new Date().toLocaleDateString("ar-IQ");

    const examRows = studentGrades.map((g, i) => {
      const band = getBand(g.score, g.exam.maxScore);
      const pct = Math.round((g.score / g.exam.maxScore) * 100);
      const rowBg = i % 2 === 0 ? "#F8FAFF" : "#FFFFFF";
      return `
        <tr style="background:${rowBg};">
          <td style="padding:14px 16px;text-align:center;font-weight:700;color:#6B7280;">${i + 1}</td>
          <td style="padding:14px 16px;text-align:right;font-weight:600;color:#1a1a2e;">${g.exam.title}</td>
          <td style="padding:14px 16px;text-align:center;color:#6B7280;font-size:13px;">${g.exam.date}</td>
          <td style="padding:14px 16px;text-align:center;">
            <span style="font-size:22px;font-weight:800;color:${band.color};">${g.score}</span>
            <span style="font-size:13px;color:#9CA3AF;">/ ${g.exam.maxScore}</span>
          </td>
          <td style="padding:14px 16px;text-align:center;">
            <div style="background:#E2E8F0;border-radius:4px;height:8px;overflow:hidden;width:100%;min-width:80px;">
              <div style="width:${pct}%;height:8px;background:${band.color};border-radius:4px;"></div>
            </div>
            <span style="font-size:11px;color:#6B7280;">${pct}%</span>
          </td>
          <td style="padding:14px 16px;text-align:center;">
            <span style="background:${band.bg};color:${band.color};padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;">${band.label}</span>
          </td>
          <td style="padding:14px 16px;text-align:center;font-size:18px;letter-spacing:2px;color:${band.color};">${getStars(g.score, g.exam.maxScore)}</td>
        </tr>
        ${
          g.feedback
            ? `<tr style="background:${rowBg};"><td colspan="7" style="padding:0 16px 12px 16px;padding-right:52px;">
                <span style="font-size:12px;color:#6B7280;font-style:italic;">💬 ملاحظة الأستاذ: ${g.feedback}</span>
               </td></tr>`
            : ""
        }
      `;
    });

    const noGradesSection =
      studentGrades.length === 0
        ? `<div style="text-align:center;padding:60px 20px;color:#9CA3AF;font-size:16px;">لم يتم إدخال درجات بعد</div>`
        : "";

    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background:#F8FAFF; color:#1a1a2e; direction:rtl; }

    .page-header {
      background: linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #1E88E5 100%);
      padding: 36px 40px 0;
      color: #fff;
    }
    .app-row { display:flex; align-items:center; gap:14px; margin-bottom:24px; }
    .app-logo { width:56px;height:56px;background:rgba(255,255,255,0.18);border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:26px;border:2px solid rgba(249,168,37,0.5); }
    .app-name { font-size:24px;font-weight:800;letter-spacing:-0.5px; }
    .app-sub { font-size:12px;opacity:0.75;margin-top:2px; }

    .student-card {
      display: flex;
      align-items: center;
      gap: 20px;
      background: rgba(255,255,255,0.12);
      border-radius: 20px 20px 0 0;
      padding: 24px 28px 0;
      border: 1.5px solid rgba(255,255,255,0.2);
      border-bottom: none;
      margin-bottom: 0;
    }
    .student-avatar {
      width: 72px; height: 72px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex; align-items:center; justify-content:center;
      font-size: 32px; font-weight: 800; color: #fff;
      border: 3px solid rgba(249,168,37,0.6);
      flex-shrink: 0;
    }
    .student-name { font-size:26px;font-weight:800;margin-bottom:4px; }
    .student-code { font-size:13px;opacity:0.72; }
    .student-badge {
      margin-right: auto;
      background: ${overallBand ? overallBand.color : "#9CA3AF"};
      color: #fff;
      padding: 8px 20px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 700;
      text-align:center;
    }
    .student-badge-avg { font-size:24px;font-weight:800;display:block; }

    .stats-row {
      display: flex;
      background: #fff;
      padding: 0;
      border-radius: 0 0 0 0;
    }
    .stat-box {
      flex: 1;
      text-align: center;
      padding: 18px 10px;
      border-left: 1px solid #E2E8F0;
    }
    .stat-box:last-child { border-left: none; }
    .stat-box-num { font-size: 26px; font-weight: 800; display:block; }
    .stat-box-lbl { font-size: 12px; color: #6B7280; margin-top: 3px; display:block; }

    .section-title {
      font-size: 18px; font-weight: 700; color: #1565C0;
      padding: 24px 24px 12px;
      border-bottom: 2px solid #E3F2FD;
      margin-bottom: 0;
    }
    table { width:100%; border-collapse:collapse; background:#fff; }
    thead tr { background: #1565C0; }
    thead th {
      padding: 12px 16px;
      font-size: 12px;
      font-weight: 600;
      color: #fff;
      text-align: center;
    }
    thead th:nth-child(2) { text-align:right; }

    .footer {
      text-align: center;
      padding: 24px;
      color: #9CA3AF;
      font-size: 12px;
      background: #F8FAFF;
      border-top: 1px solid #E2E8F0;
      margin-top: 0;
    }
    .footer strong { color: #1565C0; }
  </style>
</head>
<body>

<div class="page-header">
  <div class="app-row">
    <div class="app-logo">📖</div>
    <div>
      <div class="app-name">EnglishApp</div>
      <div class="app-sub">Mustafa Khalid — بطاقة أداء الطالب</div>
    </div>
    <div style="margin-right:auto;font-size:12px;opacity:0.72;text-align:left;">${todayStr}</div>
  </div>

  <div class="student-card">
    <div class="student-avatar">${student.name.charAt(0)}</div>
    <div>
      <div class="student-name">${student.name}</div>
      <div class="student-code">رمز الطالب: ${student.code}</div>
    </div>
    ${
      overallBand && avg !== null
        ? `<div class="student-badge">
             <span class="student-badge-avg">${avg}%</span>
             المعدل العام
           </div>`
        : ""
    }
  </div>
</div>

<div class="stats-row">
  <div class="stat-box">
    <span class="stat-box-num" style="color:#1565C0;">${studentGrades.length}</span>
    <span class="stat-box-lbl">امتحان</span>
  </div>
  <div class="stat-box">
    <span class="stat-box-num" style="color:#10B981;">${passCount}</span>
    <span class="stat-box-lbl">ناجح</span>
  </div>
  <div class="stat-box">
    <span class="stat-box-num" style="color:#EF4444;">${studentGrades.length - passCount}</span>
    <span class="stat-box-lbl">راسب</span>
  </div>
  <div class="stat-box">
    <span class="stat-box-num" style="color:#F9A825;">${
      studentGrades.length > 0
        ? Math.max(...studentGrades.map((g) => Math.round((g.score / g.exam.maxScore) * 100)))
        : "—"
    }%</span>
    <span class="stat-box-lbl">أعلى نتيجة</span>
  </div>
</div>

<div class="section-title">سجل الدرجات</div>

${
  studentGrades.length > 0
    ? `<table>
        <thead>
          <tr>
            <th style="width:40px;">#</th>
            <th style="text-align:right;">الامتحان</th>
            <th>التاريخ</th>
            <th>الدرجة</th>
            <th style="width:120px;">النسبة</th>
            <th>التقييم</th>
            <th>التميّز</th>
          </tr>
        </thead>
        <tbody>
          ${examRows.join("")}
        </tbody>
       </table>`
    : noGradesSection
}

<div class="footer">
  <strong>EnglishApp Mustafa Khalid</strong> — بطاقة أداء الطالب · ${todayStr}<br/>
  <span style="font-size:11px;color:#C4C4C4;">هذا التقرير رسمي ومعتمد من الأستاذ</span>
</div>

</body>
</html>
    `;

    const { uri } = await Print.printToFileAsync({ html, base64: false });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `بطاقة أداء — ${student.name}`,
        UTI: "com.adobe.pdf",
      });
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message ?? "حدث خطأ أثناء التصدير" };
  }
}
