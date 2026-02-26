import { base44 } from '@/api/base44Client';

/**
 * Audit Logger Utility
 * Records important actions across the platform
 */

export const AuditActions = {
  // User Management
  USER_CREATED: 'user_created',
  USER_INVITED: 'user_invited',
  USER_ROLE_CHANGED: 'user_role_changed',
  USER_SUSPENDED: 'user_suspended',
  USER_REACTIVATED: 'user_reactivated',
  
  // School Management
  SCHOOL_CREATED: 'school_created',
  SCHOOL_SUSPENDED: 'school_suspended',
  SCHOOL_SETTINGS_CHANGED: 'school_settings_changed',
  MEMBERSHIP_CREATED: 'membership_created',
  MEMBERSHIP_REMOVED: 'membership_removed',
  MEMBERSHIP_ROLE_CHANGED: 'membership_role_changed',
  
  // Class Management
  CLASS_CREATED: 'class_created',
  CLASS_UPDATED: 'class_updated',
  CLASS_ARCHIVED: 'class_archived',
  TEACHER_ASSIGNED: 'teacher_assigned',
  TEACHER_REMOVED: 'teacher_removed',
  STUDENT_ENROLLED: 'student_enrolled',
  STUDENT_UNENROLLED: 'student_unenrolled',
  
  // Academic Operations
  ASSIGNMENT_CREATED: 'assignment_created',
  ASSIGNMENT_PUBLISHED: 'assignment_published',
  ASSIGNMENT_DELETED: 'assignment_deleted',
  GRADE_CREATED: 'grade_created',
  GRADE_UPDATED: 'grade_updated',
  GRADE_VISIBILITY_CHANGED: 'grade_visibility_changed',
  GRADE_PUBLISHED: 'grade_published',
  
  // Attendance & Behavior
  ATTENDANCE_RECORDED: 'attendance_recorded',
  ATTENDANCE_UPDATED: 'attendance_updated',
  BEHAVIOR_RECORD_CREATED: 'behavior_record_created',
  BEHAVIOR_VISIBILITY_CHANGED: 'behavior_visibility_changed',
  
  // IB Core
  CAS_EXPERIENCE_APPROVED: 'cas_experience_approved',
  EE_MILESTONE_REVIEWED: 'ee_milestone_reviewed',
  TOK_TASK_GRADED: 'tok_task_graded',
  
  // Security
  UNAUTHORIZED_ACCESS_ATTEMPT: 'unauthorized_access_attempt',
  DATA_EXPORT: 'data_export',
};

export const AuditLevels = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical',
};

/**
 * Log an audit event
 * @param {Object} params
 * @param {string} params.action - Action type from AuditActions
 * @param {string} params.entityType - Type of entity affected
 * @param {string} params.entityId - ID of entity affected
 * @param {string} params.details - Description of the action
 * @param {string} params.level - Audit level (info, warning, critical)
 * @param {string} params.schoolId - School ID (null for platform-level)
 */
export async function logAudit({ 
  action, 
  entityType, 
  entityId, 
  details, 
  level = AuditLevels.INFO,
  schoolId = null 
}) {
  try {
    const user = await base44.auth.me();
    
    await base44.entities.AuditLog.create({
      school_id: schoolId,
      user_id: user?.id || null,
      user_email: user?.email || 'system',
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      level,
    });
  } catch (error) {
    console.error('Audit logging failed:', error);
    // Don't throw - audit logging should not break the main flow
  }
}

/**
 * Log multiple audit events at once (for bulk operations)
 */
export async function logAuditBulk(events) {
  try {
    const user = await base44.auth.me();
    
    const logs = events.map(event => ({
      school_id: event.schoolId || null,
      user_id: user?.id || null,
      user_email: user?.email || 'system',
      action: event.action,
      entity_type: event.entityType,
      entity_id: event.entityId,
      details: event.details,
      level: event.level || AuditLevels.INFO,
    }));
    
    await base44.entities.AuditLog.bulkCreate(logs);
  } catch (error) {
    console.error('Bulk audit logging failed:', error);
  }
}

/**
 * Check if user has permission for an action (to be called before sensitive operations)
 */
export async function checkPermission(requiredRole, schoolId = null) {
  try {
    const user = await base44.auth.me();
    if (!user) return false;
    
    if (user.role === 'super_admin') return true;
    
    if (schoolId) {
      const memberships = await base44.entities.SchoolMembership.filter({
        user_id: user.id,
        school_id: schoolId,
        status: 'active'
      });
      
      if (memberships.length === 0) return false;
      
      const membership = memberships[0];
      const roleHierarchy = ['student', 'parent', 'teacher', 'ib_coordinator', 'school_admin'];
      const userLevel = roleHierarchy.indexOf(membership.role);
      const requiredLevel = roleHierarchy.indexOf(requiredRole);
      
      return userLevel >= requiredLevel;
    }
    
    return false;
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
}