import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { hasPermission, hasAllPermissions } from '@/components/auth/PermissionsModule';
import { useImpersonation } from '@/components/auth/ImpersonationContext';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [membership, setMembership] = useState(null);
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { impersonation } = useImpersonation() || {};

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const authed = await base44.auth.isAuthenticated();
      setIsAuthenticated(authed);
      if (!authed) {
        setLoading(false);
        return;
      }
      const me = await base44.auth.me();
      setUser(me);

      // Load membership
      if (me.role !== 'super_admin' && me.role !== 'admin') {
        const memberships = await base44.entities.SchoolMembership.filter({ user_id: me.id, status: 'active' });
        if (memberships.length > 0) {
          const activeMembership = me.active_school_id
            ? memberships.find(m => m.school_id === me.active_school_id) || memberships[0]
            : memberships[0];
          setMembership(activeMembership);

          // Load school
          const schools = await base44.entities.School.filter({ id: activeMembership.school_id });
          if (schools.length > 0) {
            setSchool(schools[0]);
          }
        }
      }
    } catch (e) {
      console.log('Not authenticated');
    } finally {
      setLoading(false);
    }
  };

  const getRole = () => {
    if (impersonation) return impersonation.membershipRole;
    if (user?.role === 'super_admin') return 'super_admin';
    return membership?.role || user?.role || 'user';
  };

  const getSchoolId = () => {
    if (impersonation) return impersonation.school?.id || null;
    return membership?.school_id || null;
  };

  const getSchool = () => {
    if (impersonation) return impersonation.school || null;
    return school;
  };

  const getEffectiveUserId = () => {
    if (impersonation?.demoUserId) return impersonation.demoUserId;
    return user?.id;
  };

  // Permission checking helpers
  const checkPermission = (resource, action) => {
    const userData = { ...user, role: getRole() };
    return hasPermission(userData, resource, action);
  };

  const checkAllPermissions = (checks) => {
    const userData = { ...user, role: getRole() };
    return hasAllPermissions(userData, checks);
  };

  const effectiveSchool = getSchool();

  return (
    <UserContext.Provider value={{
      user,
      membership,
      school: effectiveSchool,
      effectiveUserId: getEffectiveUserId(),
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

export default UserProvider;