import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { GraduationCap, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AppSidebar({ links, role, schoolName, userName }) {
  const location = useLocation();

  const roleLabels = {
    super_admin: 'Platform Admin',
    school_admin: 'School Admin',
    ib_coordinator: 'IB Coordinator',
    teacher: 'Teacher',
    student: 'Student',
    parent: 'Parent',
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white flex flex-col z-40">
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg font-bold">Atlas<span className="text-indigo-400">IB</span></span>
        </div>
        {schoolName && (
          <p className="text-xs text-slate-400 mt-2 truncate">{schoolName}</p>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {links.map((link) => {
          const isActive = location.pathname.includes(link.page.replace(/\s/g, ''));
          return (
            <Link
              key={link.page}
              to={createPageUrl(link.page)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <link.icon className="w-4.5 h-4.5 shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
            {userName?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName || 'User'}</p>
            <p className="text-xs text-slate-400">{roleLabels[role] || role}</p>
          </div>
        </div>
        <button 
          onClick={() => base44.auth.logout()}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </aside>
  );
}