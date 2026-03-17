import React, { createContext, useContext, useCallback } from 'react';
import { 
  verifySchoolAccess, 
  verifyRecordAccess,
  buildRLSFilter 
} from '@/lib/rls';
import { 
  logError,
  reportRLSViolation,
  reportUnauthorizedAccess 
} from '@/lib/error-tracking';

const RLSContext = createContext();

export function RLSProvider({ children }) {
  const verifyAccess = useCallback(async (schoolId) => {
    try {
      return await verifySchoolAccess(schoolId);
    } catch (error) {
      await reportUnauthorizedAccess('school', null, schoolId);
      throw error;
    }
  }, []);

  const verifyRecord = useCallback(async (record, schoolIdField = 'school_id') => {
    try {
      const hasAccess = await verifyRecordAccess(record, schoolIdField);
      if (!hasAccess) {
        await reportRLSViolation({
          recordId: record.id,
          attemptedSchoolId: record[schoolIdField]
        });
      }
      return hasAccess;
    } catch (error) {
      await logError({
        message: error.message,
        code: 'RECORD_VERIFY_ERROR',
        severity: 'error'
      });
      throw error;
    }
  }, []);

  const buildFilter = useCallback(async (additionalFilters = {}) => {
    try {
      return await buildRLSFilter(additionalFilters);
    } catch (error) {
      await logError({
        message: error.message,
        code: 'FILTER_BUILD_ERROR',
        severity: 'error'
      });
      throw error;
    }
  }, []);

  return (
    <RLSContext.Provider value={{ verifyAccess, verifyRecord, buildFilter }}>
      {children}
    </RLSContext.Provider>
  );
}

export function useRLSContext() {
  const context = useContext(RLSContext);
  if (!context) {
    throw new Error('useRLSContext must be used within RLSProvider');
  }
  return context;
}