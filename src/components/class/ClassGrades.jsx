import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ClassGrades({ classData, isTeacher, isStudent, userId }) {
  const { data: grades = [], isLoading } = useQuery({
    queryKey: ['class-grades', classData.id, userId],
    queryFn: async () => {
      if (isTeacher) {
        return base44.entities.GradeItem.filter({ 
          school_id: classData.school_id, 
          class_id: classData.id 
        });
      } else if (isStudent) {
        return base44.entities.GradeItem.filter({ 
          school_id: classData.school_id, 
          class_id: classData.id,
          student_id: userId,
          visible_to_student: true
        });
      }
      return [];
    },
  });

  if (isLoading) {
    return <div className="p-6 text-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" /></div>;
  }

  if (isTeacher) {
    const studentGrades = grades.reduce((acc, g) => {
      if (!acc[g.student_id]) {
        acc[g.student_id] = { name: g.student_name, grades: [] };
      }
      acc[g.student_id].grades.push(g);
      return acc;
    }, {});

    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Gradebook</h2>
        {Object.keys(studentGrades).length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No grades recorded yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Assignments</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Average</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(studentGrades).map(([studentId, data]) => {
                  const avg = data.grades.length > 0 
                    ? (data.grades.reduce((s, g) => s + (g.ib_grade || 0), 0) / data.grades.length).toFixed(1)
                    : '—';
                  return (
                    <tr key={studentId} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{data.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{data.grades.length} grades</td>
                      <td className="px-6 py-4">
                        <span className="text-lg font-semibold text-slate-900">{avg}</span>
                        {avg !== '—' && <span className="text-sm text-slate-400 ml-1">/7</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  if (isStudent) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-slate-900 mb-6">My Grades</h2>
        {grades.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No grades available yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {grades.map(g => (
              <div key={g.id} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{g.title}</p>
                  {g.comment && <p className="text-sm text-slate-500 mt-1">{g.comment}</p>}
                </div>
                <div className="text-right">
                  {g.ib_grade && (
                    <div>
                      <span className="text-2xl font-bold text-slate-900">{g.ib_grade}</span>
                      <span className="text-slate-400 ml-1">/7</span>
                    </div>
                  )}
                  {g.percentage && <p className="text-sm text-slate-500">{g.percentage}%</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}