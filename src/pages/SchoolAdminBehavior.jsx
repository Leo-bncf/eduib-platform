import React, { useState } from 'react';
import { useUser } from '@/components/auth/UserContext';
import RoleGuard from '@/components/auth/RoleGuard';
import AppSidebar from '@/components/app/AppSidebar';
import {
  BarChart2, Tag, Shield, Download, ShieldCheck, AlertTriangle,
} from 'lucide-react';
import { SCHOOL_ADMIN_SIDEBAR_LINKS } from '@/components/app/schoolAdminSidebarLinks';
import AdminTabNavigation from '@/components/admin/AdminTabNavigation';

import BehaviorDashboard from '@/components/behavior-admin/BehaviorDashboard';
import BehaviorPolicyConfig from '@/components/behavior-admin/BehaviorPolicyConfig';
import PastoralOversight from '@/components/behavior-admin/PastoralOversight';
import BehaviorExport from '@/components/behavior-admin/BehaviorExport';



const TABS = [
  { id: 'dashboard',  label: 'Dashboard',         icon: BarChart2,   desc: 'Search, filter & review records' },
  { id: 'pastoral',   label: 'Pastoral Oversight', icon: Shield,      desc: 'High severity & follow-up management' },
  { id: 'policy',     label: 'Policy Config',      icon: Tag,         desc: 'Incident types & severity levels' },
  { id: 'exports',    label: 'Exports',            icon: Download,    desc: 'Privacy-safe reports & exports' },
];

export default function SchoolAdminBehavior() {
  const { user, school, schoolId, role } = useUser();
  const [tab, setTab] = useState('dashboard');

  const isPastoral = ['school_admin', 'ib_coordinator', 'super_admin', 'admin'].includes(role);

  return (
    <RoleGuard allowedRoles={['school_admin', 'ib_coordinator', 'super_admin', 'admin']}>
      <div className="min-h-screen bg-slate-50">
        <AppSidebar
          links={SCHOOL_ADMIN_SIDEBAR_LINKS}
          role="school_admin"
          schoolName={school?.name}
          userName={user?.full_name}
          userId={user?.id}
          schoolId={schoolId}
        />

        <main className="md:ml-64 min-h-screen">
          {/* Header */}
          <div className="bg-white border-b border-slate-200 px-6 py-5 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Behavior & Pastoral Notes
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">{school?.name} · Governed pastoral operations</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                School-scoped · Role-protected
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white border-b border-slate-200 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex gap-1 -mb-px">
                {TABS.map(t => {
                  const Icon = t.icon;
                  const active = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                        active ? 'border-amber-500 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-7xl mx-auto p-6">
            {tab === 'dashboard'  && <BehaviorDashboard schoolId={schoolId} isPastoral={isPastoral} />}
            {tab === 'pastoral'   && <PastoralOversight schoolId={schoolId} />}
            {tab === 'policy'     && <BehaviorPolicyConfig schoolId={schoolId} />}
            {tab === 'exports'    && <BehaviorExport schoolId={schoolId} schoolName={school?.name} />}
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}