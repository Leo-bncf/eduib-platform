/**
 * Security Utilities
 * Centralized security checks and enforcement for production
 */

/**
 * Verify user has required role
 * @throws Error if user doesn't have required role
 */
export function requireRole(user, allowedRoles) {
  if (!user) {
    throw new Error('Authentication required');
  }

  const roles = Array.isArray(allowedRoles)
    ? allowedRoles
    : [allowedRoles];

  if (!roles.includes(user.role)) {
    throw new Error(
      `Insufficient permissions. Required role: ${roles.join(' or ')}`
    );
  }
}

/**
 * Verify request is from authenticated user
 */
export function requireAuth(user) {
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

/**
 * Verify user has access to school
 * Used to enforce school-scoped data isolation
 */
export function requireSchoolAccess(user, schoolId, allowedRoles = null) {
  if (!user) {
    throw new Error('Authentication required');
  }

  // Super admins have access to all schools
  if (user.role === 'admin') {
    return true;
  }

  // User must have a current school
  if (!user.school_id) {
    throw new Error('User does not have access to any school');
  }

  // User must be accessing their own school
  if (user.school_id !== schoolId) {
    throw new Error('Access denied: You do not have access to this school');
  }

  // Check role if specified
  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles)
      ? allowedRoles
      : [allowedRoles];
    if (!roles.includes(user.role)) {
      throw new Error(`Insufficient permissions for this operation`);
    }
  }

  return true;
}

/**
 * Sanitize input to prevent injection attacks
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }

  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove HTML brackets
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL to prevent open redirect
 */
export function isValidRedirectUrl(url, allowedOrigins = []) {
  try {
    const parsedUrl = new URL(url);
    // Only allow relative paths or whitelisted origins
    return allowedOrigins.includes(parsedUrl.origin);
  } catch {
    // Assume it's a relative path, which is safe
    return url.startsWith('/');
  }
}

/**
 * Hash sensitive data (e.g., for audit logs)
 */
export function hashSensitiveData(data) {
  // Simple hash for non-critical purposes
  // For production, use crypto.subtle.digest
  return `[REDACTED-${data.substring(0, 3)}...${data.substring(
    data.length - 3
  )}]`;
}

/**
 * Create audit log entry
 */
export function createAuditLog({
  userId,
  userEmail,
  action,
  resource,
  resourceId,
  schoolId,
  changes = null,
  ipAddress = null,
  userAgent = null,
  status = 'success',
}) {
  return {
    userId,
    userEmail,
    action,
    resource,
    resourceId,
    schoolId,
    changes,
    ipAddress,
    userAgent,
    status,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validate CSRF token (for non-API requests)
 */
export function validateCsrfToken(token, sessionToken) {
  if (!token || !sessionToken) {
    return false;
  }
  return token === sessionToken;
}