import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/components/auth/UserContext';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import RoleGuard from '@/components/auth/RoleGuard';
import AppSidebar from '@/components/app/AppSidebar';
import LoadingStateBase from '@/components/common/LoadingStateBase';
import {
  CalendarDays, BookMarked, UsersRound, Library,
} from 'lucide-react';
import { SCHOOL_ADMIN_SIDEBAR_LINKS } from '@/components/app/schoolAdminSidebarLinks';
import AcademicYearsTab from '@/components/academic-setup/AcademicYearsTab';
import TermsTab from '@/components/academic-setup/TermsTab';
import CohortsTab from '@/components/academic-setup/CohortsTab';
import SubjectCatalogTab from '@/components/academic-setup/SubjectCatalogTab';



const TABS = [
  { key: 'years',    label: 'Academic Years',        icon: CalendarDays,  desc: 'Create & manage academic years' },
  { key: 'terms',    label: 'Terms & Reporting',     icon: BookMarked,    desc: 'Terms, semesters & grade-lock windows' },
  { key: 'cohorts',  label: 'Cohorts & Groups',      icon: UsersRound,    desc: 'DP1/DP2, advisory, HL/SL groupings' },
  { key: 'subjects', label: 'Subject Catalogue',     icon: Library,       desc: 'IB subjects, groups & levels' },
];

export default function SchoolAdminAcademicSetup() {
  const { user, school, schoolId, loading } = useUser();
  const [activeTab, setActiveTab] = useState('years');

  if (loading || !user) return <LoadingStateBase />;

  return (
    <RoleGuard allowedRoles={['school_admin', 'super_admin', 'admin']}>
      <div className="min-h-screen bg-slate-50">
        <AppSidebar
          links={sidebarLinks}
          role="school_admin"
          schoolName={school?.name}
          userName={user?.full_name}
          userId={user?.id}
          schoolId={schoolId}
        />

        <main className="md:ml-64 min-h-screen flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-base font-bold text-slate-900">Academic Setup</h1>
              <p className="text-xs text-slate-400 mt-0.5">{school?.name} · School structure & academic framework configuration</p>
            </div>
          </div>

          {/* Tab navigation */}
          <div className="bg-white border-b border-slate-200 px-6">
            <div className="max-w-5xl mx-auto flex gap-0 overflow-x-auto">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors -mb-px ${
                    activeTab === key
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 p-6">
            <div className="max-w-5xl mx-auto">
              {activeTab === 'years'    && <AcademicYearsTab schoolId={schoolId} />}
              {activeTab === 'terms'    && <TermsTab schoolId={schoolId} />}
              {activeTab === 'cohorts'  && <CohortsTab schoolId={schoolId} />}
              {activeTab === 'subjects' && <SubjectCatalogTab schoolId={schoolId} />}
            </div>
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}