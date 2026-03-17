import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import StatCard from '@/components/app/StatCard';
import StudentAlerts from '@/components/class/StudentAlerts';
import { TrendingUp, Users, ClipboardCheck, BarChart3, CheckCircle } from 'lucide-react';

export default function ClassAnalytics({ classData, isTeacher }) {
  const { data: assignments = [] } = useQuery({
    queryKey: ['analytics-assignments', classData.id],
    queryFn: () => base44.entities.Assignment.filter({ 
      school_id: classData.school_id, 
      class_id: classData.id 
    }),
    enabled: isTeacher,
  });

  const { data: grades = [] } = useQuery({
    queryKey: ['analytics-grades', classData.id],
    queryFn: () => base44.entities.GradeItem.filter({ 
      school_id: classData.school_id, 
      class_id: classData.id 
    }),
    enabled: isTeacher,
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['analytics-submissions', classData.id],
    queryFn: () => base44.entities.Submission.filter({ 
      school_id: classData.school_id, 
      class_id: classData.id 
    }),
    enabled: isTeacher,
  });

  if (!isTeacher) {
    return (
      <div className="p-6 text-center text-slate-400">
        <BarChart3 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p>Analytics are only available to teachers</p>
      </div>
    );
  }

  const avgGrade = grades.length > 0 
    ? (grades.reduce((s, g) => s + (g.ib_grade || 0), 0) / grades.length).toFixed(1)
    : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Class Analytics</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Students Enrolled" value={classData.student_ids?.length || 0} icon={Users} color="indigo" />
        <StatCard label="Assignments" value={assignments.length} icon={ClipboardCheck} color="emerald" />
        <StatCard label="Submissions" value={submissions.length} icon={CheckCircle} color="amber" />
        <StatCard label="Class Average" value={avgGrade} icon={TrendingUp} color="violet" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Performance Overview</h3>
        <p className="text-slate-500 text-sm">Detailed analytics and charts coming soon.</p>
      </div>
    </div>
  );
}