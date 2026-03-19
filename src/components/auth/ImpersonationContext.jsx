import React, { createContext, useContext, useState, useEffect } from 'react';

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

  const impersonate = (school, membershipRole = 'school_admin') => {
    const data = { school, membershipRole };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setImpersonation(data);
  };

  const exitImpersonation = () => {
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