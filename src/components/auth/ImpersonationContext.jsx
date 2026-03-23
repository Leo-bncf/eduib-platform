import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { seedDemoQueryCache, clearDemoQueryCache } from '@/lib/demoData';

const STORAGE_KEY = 'scholr_impersonation';

const ImpersonationContext = createContext(null);

export function ImpersonationProvider({ children }) {
  const [impersonation, setImpersonation] = useState(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const queryClient = useQueryClient();

  // Re-seed demo data after a page refresh if impersonation is still active
  React.useEffect(() => {
    if (impersonation?.school?.id) {
      seedDemoQueryCache(queryClient, impersonation.school.id, impersonation.school);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const impersonate = (school, membershipRole = 'school_admin', curriculumOverride = null) => {
    const data = { school, membershipRole, curriculumOverride };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setImpersonation(data);
    // Seed demo data into query cache for every school page
    if (school?.id) {
      seedDemoQueryCache(queryClient, school.id, school);
    }
  };

  const exitImpersonation = () => {
    if (impersonation?.school?.id) {
      clearDemoQueryCache(queryClient, impersonation.school.id);
    }
    sessionStorage.removeItem(STORAGE_KEY);
    setImpersonation(null);
  };

  return (
    <ImpersonationContext.Provider value={{ impersonation, impersonate, exitImpersonation }}>
      {children}
    </ImpersonationContext.Provider>
  );
}

export function useImpersonation() {
  return useContext(ImpersonationContext);
}