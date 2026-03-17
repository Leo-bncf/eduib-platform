import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Users, GraduationCap, Search, Mail, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const statusColors = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive: 'bg-slate-50 text-slate-600 border-slate-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function ClassPeople({ classData }) {
  const [search, setSearch] = useState('');

  const { data: memberships = {}, isLoading } = useQuery({
    queryKey: ['class-people', classData.id],
    queryFn: async () => {
      const [allMembers, cohorts] = await Promise.all([
        base44.entities.SchoolMembership.filter({ school_id: classData.school_id }),
        base44.entities.Cohort.filter({ school_id: classData.school_id, status: 'active' }),
      ]);

      const cohortMap = {};
      cohorts.forEach(c => {
        (c.student_ids || []).forEach(sid => {
          if (!cohortMap[sid]) cohortMap[sid] = [];
          cohortMap[sid].push(c.name);
        });
      });

      const teachers = allMembers.filter(m => classData.teacher_ids?.includes(m.user_id));
      const students = allMembers
        .filter(m => classData.student_ids?.includes(m.user_id))
        .map(m => ({ ...m, cohorts: cohortMap[m.user_id] || [] }));

      return { teachers, students };
    },
  });

  if (isLoading) {
    return <div className="p-6 text-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" /></div>;
  }

  const { teachers = [], students = [] } = memberships;

  const filteredStudents = students.filter(s =>
    !search || s.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.user_email?.toLowerCase().includes(search.toLowerCase()) ||
    s.grade_level?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Teachers */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-slate-700" />
          <h2 className="text-lg font-bold text-slate-900">Teachers</h2>
          <Badge variant="secondary" className="ml-1">{teachers.length}</Badge>
        </div>
        {teachers.length === 0 ? (
          <p className="text-slate-400 text-sm">No teachers assigned</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {teachers.map(t => (
              <div key={t.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-base flex-shrink-0">
                  {t.user_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{t.user_name || 'Unknown'}</p>
                  <p className="text-sm text-slate-500 truncate flex items-center gap-1">
                    <Mail className="w-3 h-3" />{t.user_email}
                  </p>
                  {t.department && <p className="text-xs text-slate-400 mt-0.5">{t.department}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Students */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-slate-700" />
            <h2 className="text-lg font-bold text-slate-900">Students</h2>
            <Badge variant="secondary" className="ml-1">{students.length}</Badge>
          </div>
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search students..." className="pl-9 h-8 text-sm" />
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <p className="text-slate-400 text-sm">{students.length === 0 ? 'No students enrolled' : 'No students match your search'}</p>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Year / Level</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Cohort</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-sm flex-shrink-0">
                          {s.user_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{s.user_name || s.user_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{s.grade_level || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {s.cohorts.length > 0
                          ? s.cohorts.map((c, i) => <Badge key={i} variant="secondary" className="text-xs font-normal">{c}</Badge>)
                          : <span className="text-sm text-slate-400">—</span>
                        }
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`border text-xs capitalize ${statusColors[s.status] || statusColors.active}`}>
                        {s.status || 'active'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      <a href={`mailto:${s.user_email}`} className="flex items-center gap-1 hover:text-indigo-600 truncate max-w-[180px]">
                        <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{s.user_email}</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}