/**
 * Hook for enforcing Row-Level Security in React components
 */

import { useEffect, useState } from 'react';
import { useUser } from '@/components/auth/UserContext';
import { 
  getUserSchoolId, 
  verifySchoolAccess, 
  verifyRecordAccess,
  buildRLSFilter
} from '@/lib/rls';
import { 
  logError,
  reportRLSViolation,
  reportUnauthorizedAccess
} from '@/lib/error-tracking';

/**
 * Hook to get user's school ID with RLS enforcement
 */
export function useUserSchoolId() {
  const { user, schoolId } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getSchoolId = async () => {
      try {
        if (!user) {
          setLoading(false);
          return;
        }
        
        const sid = await getUserSchoolId();
        if (!sid) {
          await logError({
            message: 'User has no school membership',
            code: 'NO_SCHOOL_MEMBERSHIP',
            context: { userId: user.id }
          });
        }
        setLoading(false);
      } catch (err) {
        setError(err);
        await logError({
          message: err.message,
          code: 'RLS_ERROR',
          severity: 'error'
        });
        setLoading(false);
      }
    };

    getSchoolId();
  }, [user]);

  return { schoolId, loading, error };
}

/**
 * Hook to verify access to a specific school
 */
export function useSchoolAccess(requiredSchoolId) {
  const { user } = useUser();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verify = async () => {
      try {
        if (!user || !requiredSchoolId) {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        const access = await verifySchoolAccess(requiredSchoolId);
        
        if (!access) {
          await reportUnauthorizedAccess('school', user.id, requiredSchoolId);
        }
        
        setHasAccess(access);
        setLoading(false);
      } catch (err) {
        setError(err);
        await logError({
          message: `Failed to verify school access: ${err.message}`,
          code: 'ACCESS_VERIFICATION_FAILED',
          context: { schoolId: requiredSchoolId }
        });
        setLoading(false);
      }
    };

    verify();
  }, [user, requiredSchoolId]);

  return { hasAccess, loading, error };
}

/**
 * Hook to verify access to a specific record
 */
export function useRecordAccess(record, schoolIdField = 'school_id') {
  const { user } = useUser();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verify = async () => {
      try {
        if (!user || !record) {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        const access = await verifyRecordAccess(record, schoolIdField);
        
        if (!access) {
          await reportRLSViolation({
            recordId: record.id,
            recordType: record.constructor.name,
            userId: user.id,
            attemptedSchoolId: record[schoolIdField]
          });
        }
        
        setHasAccess(access);
        setLoading(false);
      } catch (err) {
        setError(err);
        await logError({
          message: `Record access verification failed: ${err.message}`,
          code: 'RECORD_ACCESS_FAILED',
          context: { recordId: record?.id }
        });
        setLoading(false);
      }
    };

    verify();
  }, [user, record, schoolIdField]);

  return { hasAccess, loading, error };
}

/**
 * Hook to build RLS-compliant query filters
 */
export function useRLSFilter(additionalFilters = {}) {
  const { user } = useUser();
  const [filter, setFilter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const buildFilter = async () => {
      try {
        if (!user) {
          setLoading(false);
          return;
        }

        const rlsFilter = await buildRLSFilter(additionalFilters);
        setFilter(rlsFilter);
        setLoading(false);
      } catch (err) {
        setError(err);
        await logError({
          message: `Failed to build RLS filter: ${err.message}`,
          code: 'RLS_FILTER_BUILD_FAILED',
          severity: 'error'
        });
        setLoading(false);
      }
    };

    buildFilter();
  }, [user, additionalFilters]);

  return { filter, loading, error };
}