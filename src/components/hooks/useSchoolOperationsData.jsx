import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Fetches all operational data needed for the School Admin dashboard.
 * Everything is scoped to the provided schoolId.
 */
export function useSchoolOperationsData(schoolId) {
  return useQuery({
    queryKey: ['school-operations', schoolId],
    queryFn: async () => {
      const [
        memberships,
        classes,
        academicYears,
        terms,
        subjects,
        attendance,
        assignments,
        submissions,
        messages,
        timetableSyncs,
        school,
      ] = await Promise.all([
        base44.entities.SchoolMembership.filter({ school_id: schoolId, status: 'active' }),
        base44.entities.Class.filter({ school_id: schoolId, status: 'active' }),
        base44.entities.AcademicYear.filter({ school_id: schoolId }),
        base44.entities.Term.filter({ school_id: schoolId }),
        base44.entities.Subject.filter({ school_id: schoolId }),
        base44.entities.AttendanceRecord.filter({ school_id: schoolId }),
        base44.entities.Assignment.filter({ school_id: schoolId }),
        base44.entities.Submission.filter({ school_id: schoolId }),
        base44.entities.Message.filter({ school_id: schoolId }),
        base44.entities.TimetableSync.filter({ school_id: schoolId }).catch(() => []),
        base44.entities.School.filter({ id: schoolId }).then(r => r[0] || null),
      ]);

      // --- Member Breakdown ---
      const students = memberships.filter(m => m.role === 'student');
      const teachers = memberships.filter(m => ['teacher', 'ib_coordinator'].includes(m.role));
      const parents = memberships.filter(m => m.role === 'parent');

      // --- Enrollment gaps ---
      const enrolledStudentIds = new Set(classes.flatMap(c => c.student_ids || []));
      const studentsWithoutClasses = students.filter(s => !enrolledStudentIds.has(s.user_id));

      // --- Classes missing teachers ---
      const classesWithoutTeachers = classes.filter(c => {
        const legacyOk = c.teacher_ids && c.teacher_ids.length > 0;
        const assignmentsOk = c.subject_teacher_assignments &&
          c.subject_teacher_assignments.some(a => a.teacher_ids && a.teacher_ids.length > 0);
        return !legacyOk && !assignmentsOk;
      });

      // --- Attendance trend (last 30 days) ---
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentAttendance = attendance.filter(a => new Date(a.date) >= thirtyDaysAgo);
      const presentCount = recentAttendance.filter(a => a.status === 'present').length;
      const attendanceRate = recentAttendance.length > 0
        ? Math.round((presentCount / recentAttendance.length) * 100)
        : null;

      // --- Missing work rate ---
      const publishedAssignments = assignments.filter(a => a.status === 'published');
      let missingCount = 0;
      let expectedSubmissions = 0;
      publishedAssignments.forEach(a => {
        const classObj = classes.find(c => c.id === a.class_id);
        if (!classObj) return;
        const studentCount = (classObj.student_ids || []).length;
        expectedSubmissions += studentCount;
        const submitted = submissions.filter(s => s.assignment_id === a.id && ['submitted', 'graded', 'returned', 'late', 'resubmitted'].includes(s.status)).length;
        missingCount += Math.max(0, studentCount - submitted);
      });
      const missingWorkRate = expectedSubmissions > 0
        ? Math.round((missingCount / expectedSubmissions) * 100)
        : null;

      // --- Messaging volume (last 30 days) ---
      const recentMessages = messages.filter(m => new Date(m.created_date) >= thirtyDaysAgo);

      // --- Timetable sync errors ---
      const failedSyncs = timetableSyncs.filter(s => s.status === 'error' || s.status === 'failed');

      // --- Upcoming terms ---
      const now = new Date();
      const upcomingTerms = terms.filter(t => t.end_date && new Date(t.end_date) >= now)
        .sort((a, b) => new Date(a.end_date) - new Date(b.end_date))
        .slice(0, 2);

      // --- Setup completion ---
      const setupSteps = {
        academicYears: academicYears.length > 0,
        terms: terms.length > 0,
        subjects: subjects.length > 0,
        classes: classes.length > 0,
        staff: teachers.length > 0,
      };
      const setupDone = Object.values(setupSteps).filter(Boolean).length;

      return {
        school,
        members: { students, teachers, parents, total: memberships.length },
        classes,
        setupSteps,
        setupDone,
        setupTotal: 5,
        studentsWithoutClasses,
        classesWithoutTeachers,
        failedSyncs,
        attendanceRate,
        recentAttendanceCount: recentAttendance.length,
        missingWorkRate,
        missingCount,
        messagingVolume: recentMessages.length,
        upcomingTerms,
        subjects,
        academicYears,
        terms,
      };
    },
    enabled: !!schoolId,
    staleTime: 3 * 60 * 1000,
  });
}