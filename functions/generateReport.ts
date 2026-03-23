import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Backend function to generate comprehensive academic reports
 * Aggregates data from grades, attendance, behavior, and other sources
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only coordinators and admins can generate reports
    if (!['school_admin', 'ib_coordinator'].includes(user.role)) {
      return Response.json({ error: 'Forbidden: Only admins and coordinators can generate reports' }, { status: 403 });
    }

    const data = await req.json();
    const {
      school_id,
      academic_year_id,
      report_type,
      template_id,
      title,
      student_id,
      class_id,
      period_start,
      period_end,
      coordinator_notes,
      include_attendance,
      include_behavior,
      show_predicted_grades
    } = data;

    // Fetch students to report on
    let students = [];
    if (student_id) {
      const studentData = await base44.entities.User.filter({ id: student_id });
      students = studentData;
    } else if (class_id) {
      // Get students from class
      const classData = await base44.entities.Class.filter({ id: class_id });
      if (classData.length > 0 && classData[0].student_ids) {
        students = await Promise.all(
          classData[0].student_ids.map(sid => base44.entities.User.filter({ id: sid }))
        );
        students = students.flat();
      }
    } else {
      // Get all students in school
      students = await base44.entities.User.filter({ school_id, role: 'student' });
    }

    // Fetch template if specified
    let template = null;
    if (template_id) {
      const templates = await base44.entities.ReportTemplate.filter({ id: template_id });
      template = templates[0];
    }

    // Generate report data for each student
    const reportPromises = students.map(async (student) => {
      const reportData = await aggregateStudentReportData(
        base44,
        school_id,
        student.id,
        student.full_name,
        class_id,
        academic_year_id,
        period_start,
        period_end,
        {
          include_attendance,
          include_behavior,
          show_predicted_grades,
          template
        }
      );

      // Create report record
      return base44.entities.Report.create({
        school_id,
        report_type,
        template_name: template?.name || 'Standard',
        title,
        academic_year_id,
        generated_by: user.id,
        generated_by_name: user.full_name,
        generated_at: new Date().toISOString(),
        report_period_start: period_start,
        report_period_end: period_end,
        student_id: student.id,
        student_name: student.full_name,
        class_id: class_id || null,
        report_data: reportData,
        visibility: {
          visible_to_student: false,
          visible_to_parent: false
        },
        status: 'draft',
        coordinator_notes
      });
    });

    const createdReports = await Promise.all(reportPromises);

    console.log(`Generated ${createdReports.length} reports of type ${report_type}`);

    return Response.json({
      success: true,
      message: `Generated ${createdReports.length} report(s)`,
      reports: createdReports
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

/**
 * Aggregates all relevant student data for a report
 */
async function aggregateStudentReportData(
  base44,
  schoolId,
  studentId,
  studentName,
  classId,
  academicYearId,
  periodStart,
  periodEnd,
  options
) {
  const {
    include_attendance = true,
    include_behavior = true,
    show_predicted_grades = false,
    template
  } = options;

  const reportData = {
    student_info: {
      name: studentName,
      report_date: new Date().toISOString().split('T')[0]
    },
    subject_reports: [],
    overall_summary: {
      gpa: 0,
      average_grade: 0,
      attendance_percentage: 0
    }
  };

  // Fetch grades
  try {
    const grades = await base44.entities.GradeItem.filter({
      school_id: schoolId,
      student_id: studentId
    });

    if (grades.length > 0) {
      const totalScore = grades.reduce((sum, g) => sum + (g.score || 0), 0);
      const avgPercentage = grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length;
      const avgGrade = grades.reduce((sum, g) => sum + (g.ib_grade || 0), 0) / grades.length;

      reportData.overall_summary.average_grade = avgPercentage;
      reportData.overall_summary.gpa = avgGrade;

      // Group by subject
      reportData.subject_reports = grades.map(g => ({
        subject_name: g.title,
        grade: g.score,
        percentage: g.percentage,
        ib_grade: g.ib_grade,
        predicted_grade: show_predicted_grades ? g.predicted_grade : null,
        teacher_comment: g.comment
      }));
    }
  } catch (e) {
    console.log('Could not fetch grades:', e.message);
  }

  // Fetch attendance
  if (include_attendance) {
    try {
      const attendance = await base44.entities.AttendanceRecord.filter({
        school_id: schoolId,
        student_id: studentId
      });

      if (attendance.length > 0) {
        const present = attendance.filter(a => a.status === 'present').length;
        const absent = attendance.filter(a => a.status === 'absent').length;
        const late = attendance.filter(a => a.status === 'late').length;
        const total = attendance.length;
        const percentage = (present / total) * 100;

        reportData.attendance_data = {
          total_days: total,
          days_present: present,
          days_absent: absent,
          days_late: late,
          attendance_percentage: percentage
        };

        reportData.overall_summary.attendance_percentage = percentage;
      }
    } catch (e) {
      console.log('Could not fetch attendance:', e.message);
    }
  }

  // Fetch behavior
  if (include_behavior) {
    try {
      const behavior = await base44.entities.BehaviorRecord.filter({
        school_id: schoolId,
        student_id: studentId
      });

      if (behavior.length > 0) {
        const positive = behavior.filter(b => b.type === 'positive').length;
        const concerns = behavior.filter(b => b.type === 'concern').length;
        const incidents = behavior.filter(b => b.type === 'incident').length;

        reportData.behavior_summary = {
          positive_count: positive,
          concern_count: concerns,
          incident_count: incidents
        };
      }
    } catch (e) {
      console.log('Could not fetch behavior:', e.message);
    }
  }

  // Fetch IB progress if applicable
  try {
    const casExperiences = await base44.entities.CASExperience.filter({
      school_id: schoolId,
      student_id: studentId
    });

    const eeMilestones = await base44.entities.EEMilestone.filter({
      school_id: schoolId,
      student_id: studentId
    });

    const tokTasks = await base44.entities.TOKTask.filter({
      school_id: schoolId,
      student_id: studentId
    });

    reportData.ib_progress = {
      cas_status: casExperiences.length > 0 ? `${casExperiences.filter(c => c.status === 'approved').length} of ${casExperiences.length} approved` : 'Not started',
      ee_status: eeMilestones.length > 0 ? eeMilestones[eeMilestones.length - 1].status : 'Not started',
      tok_status: tokTasks.length > 0 ? 'In progress' : 'Not started'
    };
  } catch (e) {
    console.log('Could not fetch IB progress:', e.message);
  }

  return reportData;
}