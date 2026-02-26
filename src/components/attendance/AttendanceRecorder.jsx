import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle2, XCircle, Clock, AlertCircle, Save } from 'lucide-react';
import { format } from 'date-fns';

export default function AttendanceRecorder({ classData, teacherId, teacherName }) {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attendanceData, setAttendanceData] = useState({});
  const [notes, setNotes] = useState({});

  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ['class-students-attendance', classData.id],
    queryFn: async () => {
      const members = await base44.entities.SchoolMembership.filter({
        school_id: classData.school_id,
        status: 'active'
      });
      return members.filter(m => classData.student_ids?.includes(m.user_id));
    },
  });

  const { data: existingRecords = [], isLoading: loadingRecords } = useQuery({
    queryKey: ['class-attendance-records', classData.id, selectedDate],
    queryFn: () => base44.entities.AttendanceRecord.filter({
      school_id: classData.school_id,
      class_id: classData.id,
      date: selectedDate
    }),
    enabled: !!selectedDate,
  });

  React.useEffect(() => {
    const initialData = {};
    const initialNotes = {};
    existingRecords.forEach(record => {
      initialData[record.student_id] = record.status;
      if (record.note) initialNotes[record.student_id] = record.note;
    });
    setAttendanceData(initialData);
    setNotes(initialNotes);
  }, [existingRecords]);

  const saveMutation = useMutation({
    mutationFn: async (records) => {
      const promises = records.map(record => {
        const existing = existingRecords.find(r => r.student_id === record.student_id);
        if (existing) {
          return base44.entities.AttendanceRecord.update(existing.id, record);
        }
        return base44.entities.AttendanceRecord.create(record);
      });
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-attendance-records'] });
      queryClient.invalidateQueries({ queryKey: ['parent-child-attendance'] });
    },
  });

  const handleSave = () => {
    const records = students
      .filter(s => attendanceData[s.user_id])
      .map(s => ({
        school_id: classData.school_id,
        class_id: classData.id,
        student_id: s.user_id,
        student_name: s.user_name || s.user_email,
        date: selectedDate,
        status: attendanceData[s.user_id],
        note: notes[s.user_id] || '',
        recorded_by: teacherId,
      }));

    saveMutation.mutate(records);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'absent': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'late': return <Clock className="w-5 h-5 text-amber-600" />;
      case 'excused': return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default: return null;
    }
  };

  if (loadingStudents) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="text-sm font-semibold text-slate-700">Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending || Object.keys(attendanceData).length === 0}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Attendance
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Student</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map(student => (
              <tr key={student.user_id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-slate-900">{student.user_name || student.user_email}</p>
                    <p className="text-xs text-slate-500">{student.grade_level || ''}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Select
                    value={attendanceData[student.user_id] || ''}
                    onValueChange={v => setAttendanceData({ ...attendanceData, [student.user_id]: v })}
                  >
                    <SelectTrigger className="w-36 mx-auto">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Present
                        </div>
                      </SelectItem>
                      <SelectItem value="absent">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          Absent
                        </div>
                      </SelectItem>
                      <SelectItem value="late">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-600" />
                          Late
                        </div>
                      </SelectItem>
                      <SelectItem value="excused">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-blue-600" />
                          Excused
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-6 py-4">
                  <Textarea
                    value={notes[student.user_id] || ''}
                    onChange={e => setNotes({ ...notes, [student.user_id]: e.target.value })}
                    placeholder="Optional note..."
                    rows={1}
                    className="text-sm"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {saveMutation.isSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
          <p className="text-sm font-medium text-emerald-900">Attendance saved successfully</p>
        </div>
      )}
    </div>
  );
}