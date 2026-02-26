/**
 * Common formatting and display helpers
 */
import { format } from 'date-fns';

export function formatDate(date, formatStr = 'MMM d, yyyy') {
  if (!date) return '—';
  try {
    return format(new Date(date), formatStr);
  } catch {
    return '—';
  }
}

export function formatDateTime(date, formatStr = 'MMM d, yyyy p') {
  return formatDate(date, formatStr);
}

export function formatShortDate(date) {
  return formatDate(date, 'MMM d');
}

export function formatTime(time) {
  if (!time) return '—';
  try {
    const [hours, minutes] = time.split(':');
    const period = parseInt(hours) >= 12 ? 'PM' : 'AM';
    const displayHours = parseInt(hours) % 12 || 12;
    return `${displayHours}:${minutes} ${period}`;
  } catch {
    return time;
  }
}

export function formatPercentage(value, decimals = 0) {
  if (value === null || value === undefined) return '—';
  return `${Number(value).toFixed(decimals)}%`;
}

export function formatGPA(value) {
  if (value === null || value === undefined) return '—';
  return Number(value).toFixed(2);
}

export function formatAttendancePercentage(present, total) {
  if (!total) return '—';
  return formatPercentage((present / total) * 100);
}

export function formatIBGrade(grade) {
  if (!grade) return '—';
  const num = parseInt(grade);
  return num >= 1 && num <= 7 ? num : '—';
}

export function getGradeColor(grade) {
  const num = parseInt(grade);
  if (num >= 7) return 'text-emerald-600 bg-emerald-50';
  if (num >= 6) return 'text-blue-600 bg-blue-50';
  if (num >= 5) return 'text-amber-600 bg-amber-50';
  return 'text-red-600 bg-red-50';
}

export function getRoleLabel(role) {
  const labels = {
    super_admin: 'Platform Admin',
    school_admin: 'School Admin',
    ib_coordinator: 'IB Coordinator',
    teacher: 'Teacher',
    student: 'Student',
    parent: 'Parent',
  };
  return labels[role] || role;
}

export function getStatusColor(status) {
  const colors = {
    active: 'bg-emerald-100 text-emerald-800',
    inactive: 'bg-slate-100 text-slate-800',
    pending: 'bg-amber-100 text-amber-800',
    draft: 'bg-slate-100 text-slate-800',
    published: 'bg-emerald-100 text-emerald-800',
    completed: 'bg-emerald-100 text-emerald-800',
    failed: 'bg-red-100 text-red-800',
    suspended: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-slate-100 text-slate-800';
}

export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
}