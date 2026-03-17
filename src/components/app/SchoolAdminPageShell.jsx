import React from 'react';
import AppSidebar from '@/components/app/AppSidebar';
import { SCHOOL_ADMIN_SIDEBAR_LINKS } from '@/components/app/schoolAdminSidebarLinks';
import { useUser } from '@/components/auth/UserContext';

/**
 * Shared shell for all School Admin pages.
 * Provides the sidebar + main layout + sticky page header with consistent styling.
 *
 * Props:
 *   title        — Page title (string)
 *   subtitle     — Optional subtitle (string | node)
 *   badge        — Optional badge element (node)
 *   actions      — Optional right-side actions (node)
 *   children     — Page content
 *   maxWidth     — Max-width class for content (default: "max-w-6xl")
 *   noPadding    — Skip default p-4 md:p-6 padding on content wrapper
 */
export default function SchoolAdminPageShell({
  title,
  subtitle,
  badge,
  actions,
  children,
  maxWidth = 'max-w-6xl',
  noPadding = false,
}) {
  const { user, school, schoolId } = useUser();

  return (
    <div className="min-h-screen bg-slate-50">
      <AppSidebar
        links={SCHOOL_ADMIN_SIDEBAR_LINKS}
        role="school_admin"
        schoolName={school?.name}
        userName={user?.full_name}
        userId={user?.id}
        schoolId={schoolId}
      />

      <main className="md:ml-64 min-h-screen flex flex-col">
        {/* Sticky page header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
          <div className={`flex items-center justify-between gap-4 ${maxWidth} mx-auto`}>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">{title}</h1>
                {badge}
              </div>
              {subtitle && (
                <p className="text-xs text-slate-400 mt-0.5 truncate">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <div className={`flex-1 ${noPadding ? '' : 'p-4 md:p-6'} ${maxWidth} mx-auto w-full`}>
          {children}
        </div>
      </main>
    </div>
  );
}