import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import jsPDF from 'npm:jspdf@4.0.0';

/**
 * Backend function to export reports as PDF
 * Generates downloadable PDF documents from report data
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reportId } = await req.json();

    // Fetch report
    const reports = await base44.entities.Report.filter({ id: reportId });
    if (!reports || reports.length === 0) {
      return Response.json({ error: 'Report not found' }, { status: 404 });
    }

    const report = reports[0];

    // Check access
    if (user.role === 'student' && report.student_id !== user.id) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }
    if (user.role === 'parent' && !report.student_id) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    // Generate PDF
    const pdf = generateReportPDF(report, user);

    return new Response(pdf.output('arraybuffer'), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${report.title.replace(/\s+/g, '_')}.pdf"`
      }
    });
  } catch (error) {
    console.error('PDF export error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

/**
 * Generates PDF document from report data
 */
function generateReportPDF(report, user) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'A4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;

  // Header
  pdf.setFontSize(18);
  pdf.setFont(undefined, 'bold');
  pdf.text(report.title, margin, y);
  y += 12;

  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  pdf.setTextColor(120, 120, 120);
  pdf.text(`Generated: ${new Date(report.generated_at).toLocaleDateString()}`, margin, y);
  y += 5;
  pdf.text(`By: ${report.generated_by_name}`, margin, y);
  y += 8;

  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Student Info
  if (report.report_data?.student_info?.name) {
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Student Information', margin, y);
    y += 7;

    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Name: ${report.report_data.student_info.name}`, margin, y);
    y += 5;

    if (report.report_data.student_info.grade_level) {
      pdf.text(`Grade Level: ${report.report_data.student_info.grade_level}`, margin, y);
      y += 5;
    }

    y += 5;
  }

  // Overall Summary
  if (report.report_data?.overall_summary) {
    const summary = report.report_data.overall_summary;
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('Overall Academic Summary', margin, y);
    y += 7;

    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');

    if (summary.average_grade) {
      pdf.text(`Average Grade: ${Math.round(summary.average_grade)}%`, margin, y);
      y += 5;
    }

    if (summary.gpa) {
      pdf.text(`GPA: ${summary.gpa.toFixed(2)}`, margin, y);
      y += 5;
    }

    if (summary.attendance_percentage) {
      pdf.text(`Attendance: ${Math.round(summary.attendance_percentage)}%`, margin, y);
      y += 5;
    }

    y += 5;
  }

  // Subject Reports
  if (report.report_data?.subject_reports?.length > 0) {
    if (y > pageHeight - 40) {
      pdf.addPage();
      y = margin;
    }

    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('Subject Performance', margin, y);
    y += 7;

    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');

    report.report_data.subject_reports.forEach((subject) => {
      if (y > pageHeight - 20) {
        pdf.addPage();
        y = margin;
      }

      pdf.setFont(undefined, 'bold');
      pdf.text(subject.subject_name, margin, y);
      y += 5;

      pdf.setFont(undefined, 'normal');
      if (subject.grade) {
        pdf.text(`Score: ${subject.grade}`, margin + 5, y);
        y += 4;
      }
      if (subject.percentage) {
        pdf.text(`Percentage: ${Math.round(subject.percentage)}%`, margin + 5, y);
        y += 4;
      }
      if (subject.teacher_comment) {
        const lines = pdf.splitTextToSize(`Comment: ${subject.teacher_comment}`, contentWidth - 5);
        pdf.text(lines, margin + 5, y);
        y += lines.length * 4;
      }

      y += 3;
    });

    y += 5;
  }

  // Attendance
  if (report.report_data?.attendance_data) {
    if (y > pageHeight - 40) {
      pdf.addPage();
      y = margin;
    }

    const attendance = report.report_data.attendance_data;
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('Attendance Summary', margin, y);
    y += 7;

    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');

    pdf.text(`Days Present: ${attendance.days_present} / ${attendance.total_days}`, margin, y);
    y += 4;
    pdf.text(`Days Absent: ${attendance.days_absent || 0}`, margin, y);
    y += 4;
    pdf.text(`Attendance Rate: ${Math.round(attendance.attendance_percentage || 0)}%`, margin, y);
    y += 8;
  }

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text(
    `Page ${pdf.internal.getNumberOfPages()}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  return pdf;
}