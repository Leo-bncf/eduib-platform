import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useTimetableData(schoolId) {
  const scheduleEntries = useQuery({
    queryKey: ['timetable-entries', schoolId],
    queryFn: () => base44.entities.ScheduleEntry.filter({ school_id: schoolId }),
    enabled: !!schoolId,
  });

  const periods = useQuery({
    queryKey: ['timetable-periods', schoolId],
    queryFn: () => base44.entities.Period.filter({ school_id: schoolId }),
    enabled: !!schoolId,
  });

  const rooms = useQuery({
    queryKey: ['timetable-rooms', schoolId],
    queryFn: () => base44.entities.Room.filter({ school_id: schoolId }),
    enabled: !!schoolId,
  });

  const syncHistory = useQuery({
    queryKey: ['timetable-sync-history', schoolId],
    queryFn: () => base44.entities.TimetableSync.filter({ school_id: schoolId }, '-started_at', 30),
    enabled: !!schoolId,
  });

  const settings = useQuery({
    queryKey: ['timetable-settings', schoolId],
    queryFn: async () => {
      const results = await base44.entities.TimetableSettings.filter({ school_id: schoolId });
      return results[0] || null;
    },
    enabled: !!schoolId,
  });

  const memberships = useQuery({
    queryKey: ['timetable-memberships', schoolId],
    queryFn: () => base44.entities.SchoolMembership.filter({ school_id: schoolId, status: 'active' }),
    enabled: !!schoolId,
  });

  const classes = useQuery({
    queryKey: ['timetable-classes', schoolId],
    queryFn: () => base44.entities.Class.filter({ school_id: schoolId, status: 'active' }),
    enabled: !!schoolId,
  });

  return {
    scheduleEntries: scheduleEntries.data ?? [],
    periods: periods.data ?? [],
    rooms: rooms.data ?? [],
    syncHistory: syncHistory.data ?? [],
    settings: settings.data,
    memberships: memberships.data ?? [],
    classes: classes.data ?? [],
    isLoading: scheduleEntries.isLoading || periods.isLoading,
    refetchAll: () => {
      scheduleEntries.refetch();
      periods.refetch();
      rooms.refetch();
      syncHistory.refetch();
      settings.refetch();
    },
  };
}

export const SYNC_STATUS_CONFIG = {
  completed: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Completed' },
  failed:    { color: 'bg-red-50 text-red-700 border-red-200',             dot: 'bg-red-500',     label: 'Failed' },
  in_progress: { color: 'bg-blue-50 text-blue-700 border-blue-200',        dot: 'bg-blue-500',    label: 'In Progress' },
  partial:   { color: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500',   label: 'Partial' },
  pending:   { color: 'bg-slate-50 text-slate-600 border-slate-200',       dot: 'bg-slate-400',   label: 'Pending' },
};

export const OVERRIDE_POLICY_CONFIG = {
  read_only:         { label: 'Read-Only (External controls all)',    color: 'bg-red-50 text-red-700 border-red-200',       icon: '🔒' },
  allow_local_edits: { label: 'Hybrid (Some local edits allowed)',    color: 'bg-amber-50 text-amber-700 border-amber-200', icon: '✏️' },
  local_override:    { label: 'Local Override (Local takes precedence)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '🖊️' },
};