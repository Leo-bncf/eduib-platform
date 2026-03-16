import React, { useState } from 'react';
import { useUser } from '@/components/auth/UserContext';
import RoleGuard from '@/components/auth/RoleGuard';
import AppSidebar from '@/components/app/AppSidebar';
import {
  LayoutDashboard, Users, BookOpen, GraduationCap, Calendar, Clock,
  FileText, CreditCard, Settings, Database, Download, ShieldCheck, Shield
} from 'lucide-react';
import DataExportImport from '@/components/data-tools/DataExportImport';
import DataIntegrityChecks from '@/components/data-tools/DataIntegrityChecks';
import GDPRPrivacyTools from '@/components/data-tools/GDPRPrivacyTools';

const sidebarLinks = [
  { label: 'Dashboard', page: 'SchoolAdminDashboard', icon: LayoutDashboard },
  { label: 'Users', page: 'SchoolAdminUsers', icon: Users },
  { label: 'Classes', page: 'SchoolAdminClasses', icon: BookOpen },
  { label: 'Enrollments', page: 'SchoolAdminEnrollments', icon: Users },
  { label: 'Subjects', page: 'SchoolAdminSubjects', icon: GraduationCap },
  { label: 'Attendance', page: 'SchoolAdminAttendance', icon: Calendar },
  { label: 'Timetable', page: 'SchoolAdminTimetable', icon: Clock },
  { label: 'Reports', page: 'SchoolAdminReports', icon: FileText },
  { label: 'Billing', page: 'SchoolAdminBilling', icon: CreditCard },
  { label: 'Settings', page: 'SchoolAdminSettings', icon: Settings },
];

const TABS = [
  { key: 'export', label: 'Export / Import', icon: Download, desc: 'Backup & migrate school data' },
  { key: 'integrity', label: 'Data Integrity', icon: ShieldCheck, desc: 'Find and fix inconsistencies' },
  { key: 'gdpr', label: 'GDPR & Privacy', icon: Shield, desc: 'Anonymization & deletion requests' },
];

export default function SchoolAdminDataTools() {
  const { user, school: contextSchool, schoolId } = useUser();
  const [activeTab, setActiveTab] = useState('export');

  const current = TABS.find(t => t.key === activeTab);

  return (
    <RoleGuard allowedRoles={['school_admin', 'super_admin', 'admin']}>
      <div className="min-h-screen bg-slate-50">
        <AppSidebar
          links={sidebarLinks}
          role="school_admin"
          schoolName={contextSchool?.name}
          userName={user?.full_name}
          userId={user?.id}
          schoolId={schoolId}
        />

        <main className="md:ml-64 min-h-screen">
          {/* Header */}
          <div className="bg-white border-b border-slate-200 px-6 py-4">
            <h1 className="text-xl font-semibold text-slate-900">Data Management & Tools</h1>
            <p className="text-sm text-slate-500 mt-0.5">Export, integrity checks, and privacy tools for your school data</p>
          </div>

          {/* Tab bar */}
          <div className="bg-white border-b border-slate-200 px-6">
            <div className="flex gap-0">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                      isActive
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-w-4xl">
            {activeTab === 'export' && <DataExportImport schoolId={schoolId} />}
            {activeTab === 'integrity' && <DataIntegrityChecks schoolId={schoolId} />}
            {activeTab === 'gdpr' && <GDPRPrivacyTools schoolId={schoolId} />}
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}