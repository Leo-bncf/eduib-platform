import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function ClassAttendance({ classData, isTeacher, userId }) {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: students = [] } = useQuery({
    queryKey: ['class-students', classData.id],
    queryFn: async () => {
      const members = await base44.entities.SchoolMembership.filter({ 
        school_id: classData.school_id, 
        status: 'active' 
      });
      return members.filter(m => classData.student_ids?.includes(m.user_id));
    },
  });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['class-attendance', classData.id, selectedDate],
    queryFn: () => base44.entities.AttendanceRecord.filter({ 
      school_id: classData.school_id,
      class_id: classData.id,
      date: selectedDate
    }),
  });

  const recordMutation = useMutation({
    mutationFn: (data) => base44.entities.AttendanceRecord.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-attendance'] });
    },
  });

  const markAttendance = (studentId, studentName, status) => {
    recordMutation.mutate({
      school_id: classData.school_id,
      class_id: classData.id,
      student_id: studentId,
      student_name: studentName,
      date: selectedDate,
      status,
      recorded_by: userId,
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'absent': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'late': return <Clock className="w-4 h-4 text-amber-600" />;
      case 'excused': return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default: return null;
    }
  };

  const statusColors = {
    present: 'bg-emerald-50 text-emerald-700',
    absent: 'bg-red-50 text-red-700',
    late: 'bg-amber-50 text-amber-700',
    excused: 'bg-blue-50 text-blue-700',
  };

  if (!isTeacher) {
    return (
      <div className="p-6 text-center text-slate-400">
        <CheckCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p>Attendance tracking is only available to teachers</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Attendance</h2>
        <input 
          type="date" 
          value={selectedDate} 
          onChange={e => setSelectedDate(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg text-sm"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Mark As</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map(student => {
                const record = records.find(r => r.student_id === student.user_id);
                return (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{student.user_name || student.user_email}</td>
                    <td className="px-6 py-4">
                      {record ? (
                        <Badge className={`${statusColors[record.status]} border-0 flex items-center gap-1 w-fit`}>
                          {getStatusIcon(record.status)}
                          {record.status}
                        </Badge>
                      ) : (
                        <span className="text-slate-400 text-sm">Not marked</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => markAttendance(student.user_id, student.user_name, 'present')}>
                          <CheckCircle className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => markAttendance(student.user_id, student.user_name, 'absent')}>
                          <XCircle className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => markAttendance(student.user_id, student.user_name, 'late')}>
                          <Clock className="w-3.5 h-3.5" />
                        </Button>
                      </div>
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