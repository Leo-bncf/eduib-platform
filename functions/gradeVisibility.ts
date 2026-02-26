/**
 * Backend utility for grade visibility validation
 * Used server-side for secure data filtering
 */

export const VISIBILITY_LEVELS = {
  TEACHER_ONLY: 'teacher_only',
  STUDENTS: 'students',
  PARENTS: 'parents',
  EVERYONE: 'everyone'
};

export function canViewGrade(grade, userRole, userId, studentId, schoolVisibilityPolicy = {}) {
  const {
    parent_grades_visible_to_parents = true,
    student_grades_visible_to_students = true
  } = schoolVisibilityPolicy;

  // Teachers and admins always see grades
  if (['teacher', 'school_admin', 'ib_coordinator'].includes(userRole)) {
    return true;
  }

  // Students see their own grades if visible
  if (userRole === 'student' && userId === studentId) {
    return grade.visible_to_student && student_grades_visible_to_students;
  }

  // Parents see child's grades if visible
  if (userRole === 'parent') {
    return grade.visible_to_parent && parent_grades_visible_to_parents;
  }

  return false;
}

export function getVisibleGradeComponents(grade, userRole, userId, studentId) {
  const baseVisibility = {
    score: false,
    percentage: false,
    ib_grade: false,
    comment: false,
    rubric_breakdown: false,
    criteria_scores: false
  };

  if (['teacher', 'school_admin', 'ib_coordinator'].includes(userRole)) {
    return Object.keys(baseVisibility).reduce((acc, key) => ({ ...acc, [key]: true }), {});
  }

  if (userRole === 'student' && userId === studentId && grade.visible_to_student) {
    return {
      score: true,
      percentage: true,
      ib_grade: true,
      comment: true,
      rubric_breakdown: true,
      criteria_scores: true
    };
  }

  if (userRole === 'parent' && grade.visible_to_parent) {
    return {
      score: true,
      percentage: true,
      ib_grade: true,
      comment: true,
      rubric_breakdown: true,
      criteria_scores: true
    };
  }

  return baseVisibility;
}