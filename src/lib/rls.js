/**
 * Row-Level Security (RLS) utilities for Scholr
 * Ensures users can only access data from their school
 */

import { base44 } from '@/api/base44Client';

/**
 * Get the user's active school ID
 * Returns null if user has no school membership
 */
export async function getUserSchoolId() {
  try {
    const user = await base44.auth.me();
    if (!user) return null;
    
    // Super admin can access any school (no restriction)
    if (user.role === 'super_admin') return null;
    
    // For regular users, get their active school from membership
    const memberships = await base44.entities.SchoolMembership.filter({
      user_id: user.id,
      status: 'active'
    });
    
    if (memberships.length === 0) return null;
    
    // Use active_school_id if set, otherwise use first membership
    const activeMembership = user.active_school_id
      ? memberships.find(m => m.school_id === user.active_school_id) || memberships[0]
      : memberships[0];
    
    return activeMembership?.school_id || null;
  } catch (error) {
    console.error('Error getting user school ID:', error);
    throw error;
  }
}

/**
 * Verify user has access to a specific school
 */
export async function verifySchoolAccess(schoolId) {
  try {
    const user = await base44.auth.me();
    if (!user) throw new Error('User not authenticated');
    
    // Super admin has access to all schools
    if (user.role === 'super_admin') return true;
    
    const membership = await base44.entities.SchoolMembership.filter({
      user_id: user.id,
      school_id: schoolId,
      status: 'active'
    });
    
    return membership.length > 0;
  } catch (error) {
    console.error('Error verifying school access:', error);
    throw error;
  }
}

/**
 * Filter query results to ensure RLS compliance
 * Only returns records from user's school
 */
export async function applyRLS(records, entityName, schoolIdField = 'school_id') {
  try {
    if (!records || records.length === 0) return records;
    
    const user = await base44.auth.me();
    if (!user) return [];
    
    // Super admin sees all records
    if (user.role === 'super_admin') return records;
    
    const userSchoolId = await getUserSchoolId();
    if (!userSchoolId) return [];
    
    // Filter to only records from user's school
    return records.filter(record => record[schoolIdField] === userSchoolId);
  } catch (error) {
    console.error(`Error applying RLS to ${entityName}:`, error);
    throw error;
  }
}

/**
 * Verify a single record belongs to user's school
 */
export async function verifyRecordAccess(record, schoolIdField = 'school_id') {
  try {
    if (!record) return false;
    
    const user = await base44.auth.me();
    if (!user) return false;
    
    // Super admin has access to all records
    if (user.role === 'super_admin') return true;
    
    const userSchoolId = await getUserSchoolId();
    return record[schoolIdField] === userSchoolId;
  } catch (error) {
    console.error('Error verifying record access:', error);
    return false;
  }
}

/**
 * Ensure a query includes school_id filter for RLS
 */
export async function buildRLSFilter(additionalFilters = {}) {
  try {
    const user = await base44.auth.me();
    if (!user) throw new Error('User not authenticated');
    
    // Super admin doesn't need school filter
    if (user.role === 'super_admin') return additionalFilters;
    
    const schoolId = await getUserSchoolId();
    if (!schoolId) throw new Error('User has no school membership');
    
    return {
      ...additionalFilters,
      school_id: schoolId
    };
  } catch (error) {
    console.error('Error building RLS filter:', error);
    throw error;
  }
}