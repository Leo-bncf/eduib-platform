import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { GraduationCap, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import NotificationBell from '@/components/notifications/NotificationBell';

export default function AppSidebar({ links, role, schoolName, userName, userId, schoolId }) {
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
    <aside className="hidden md:fixed md:left-0 md:top-0 md:bottom-0 md:w-64 bg-slate-900 text-white flex flex-col z-40 md:flex">
      <div className="p-3 md:p-5 border-b border-slate-800">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-2.5 flex-1 min-w-0">
            <div className="w-7 md:w-8 h-7 md:h-8 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-3.5 md:w-4.5 h-3.5 md:h-4.5 text-white" />
            </div>
            <span className="text-base md:text-lg font-bold truncate text-sm md:text-base">Atlas<span className="text-indigo-400">IB</span></span>
          </div>
          {userId && schoolId && (
            <div className="hidden md:block">
              <NotificationBell userId={userId} schoolId={schoolId} />
            </div>
          )}
        </div>
        {schoolName && (
          <p className="text-xs text-slate-400 mt-2 truncate">{schoolName}</p>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-2 md:p-3 space-y-0.5">
        {links.map((link) => {
          const isActive = location.pathname.includes(link.page.replace(/\s/g, ''));
          return (
            <Link
              key={link.page}
              to={createPageUrl(link.page)}
              className={`flex items-center gap-2 md:gap-3 px-2.5 md:px-3.5 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <link.icon className="w-4 md:w-4.5 h-4 md:h-4.5 shrink-0" />
              <span className="hidden md:inline">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 md:p-4 border-t border-slate-800">
        <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
          <div className="w-7 md:w-8 h-7 md:h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {userName?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0 hidden md:block">
            <p className="text-xs md:text-sm font-medium truncate">{userName || 'User'}</p>
            <p className="text-xs text-slate-400">{roleLabels[role] || role}</p>
          </div>
        </div>
        <button 
          onClick={() => base44.auth.logout()}
          className="flex items-center gap-1.5 md:gap-2 w-full px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}