import { LayoutDashboard, BarChart3, CalendarDays, ClipboardList, Star, MessageSquare } from 'lucide-react';

export const STUDENT_SIDEBAR_LINKS = [
  { label: 'Dashboard', page: 'StudentDashboard', icon: LayoutDashboard },
  { label: 'Academic', page: 'StudentAcademicDashboard', icon: BarChart3 },
  { label: 'Timetable', page: 'StudentTimetable', icon: CalendarDays },
  { label: 'Attendance', page: 'StudentAttendance', icon: ClipboardList },
  { label: 'IB Core', page: 'StudentIBCore', icon: Star },
  { label: 'Messages', page: 'StudentCommunication', icon: MessageSquare },
];