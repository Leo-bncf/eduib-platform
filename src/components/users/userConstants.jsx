export const ROLE_CONFIG = {
  school_admin:   { label: 'Admin',          color: 'bg-rose-50 text-rose-700 border-rose-200' },
  ib_coordinator: { label: 'IB Coordinator', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  teacher:        { label: 'Teacher',        color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  student:        { label: 'Student',        color: 'bg-blue-50 text-blue-700 border-blue-200' },
  parent:         { label: 'Parent',         color: 'bg-violet-50 text-violet-700 border-violet-200' },
};

export const SIDEBAR_LINKS_ADMIN = [
  { label: 'Dashboard',     page: 'SchoolAdminDashboard',     icon: 'LayoutDashboard' },
  { label: 'Users',         page: 'SchoolAdminUsers',         icon: 'Users' },
  { label: 'Classes',       page: 'SchoolAdminClasses',       icon: 'BookOpen' },
  { label: 'Enrollments',   page: 'SchoolAdminEnrollments',   icon: 'Users' },
  { label: 'Academic Setup',page: 'SchoolAdminAcademicSetup', icon: 'GraduationCap' },
  { label: 'Attendance',    page: 'SchoolAdminAttendance',    icon: 'Calendar' },
  { label: 'Timetable',     page: 'SchoolAdminTimetable',     icon: 'Clock' },
  { label: 'Reports',       page: 'SchoolAdminReports',       icon: 'FileText' },
  { label: 'Billing',       page: 'SchoolAdminBilling',       icon: 'CreditCard' },
  { label: 'Settings',      page: 'SchoolAdminSettings',      icon: 'Settings' },
];