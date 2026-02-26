import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Users, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ClassPeople({ classData }) {
  const { data: memberships = [], isLoading } = useQuery({
    queryKey: ['class-people', classData.id],
    queryFn: async () => {
      const allMembers = await base44.entities.SchoolMembership.filter({ 
        school_id: classData.school_id, 
        status: 'active' 
      });
      const teachers = allMembers.filter(m => classData.teacher_ids?.includes(m.user_id));
      const students = allMembers.filter(m => classData.student_ids?.includes(m.user_id));
      return { teachers, students };
    },
  });

  if (isLoading) {
    return <div className="p-6 text-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" /></div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-slate-700" />
          <h2 className="text-lg font-bold text-slate-900">Teachers</h2>
          <Badge variant="secondary" className="ml-2">{memberships.teachers?.length || 0}</Badge>
        </div>
        {memberships.teachers?.length === 0 ? (
          <p className="text-slate-400 text-sm">No teachers assigned</p>
        ) : (
          <div className="grid gap-3">
            {memberships.teachers.map(t => (
              <div key={t.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                  {t.user_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{t.user_name || 'Unknown'}</p>
                  <p className="text-sm text-slate-500">{t.user_email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="w-5 h-5 text-slate-700" />
          <h2 className="text-lg font-bold text-slate-900">Students</h2>
          <Badge variant="secondary" className="ml-2">{memberships.students?.length || 0}</Badge>
        </div>
        {memberships.students?.length === 0 ? (
          <p className="text-slate-400 text-sm">No students enrolled</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {memberships.students.map(s => (
              <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold">
                  {s.user_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{s.user_name || s.user_email}</p>
                  <p className="text-xs text-slate-500 truncate">{s.grade_level || 'Student'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}