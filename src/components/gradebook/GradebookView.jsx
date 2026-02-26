import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Edit, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GradeStudentDialog from './GradeStudentDialog';
import CreateGradeItem from './CreateGradeItem';

export default function GradebookView({ classData, assignments = [] }) {
  const [selectedGradeItem, setSelectedGradeItem] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);

  const { data: students = [] } = useQuery({
    queryKey: ['class-students-gradebook', classData.id],
    queryFn: async () => {
      const members = await base44.entities.SchoolMembership.filter({
        school_id: classData.school_id,
        status: 'active'
      });
      return members.filter(m => classData.student_ids?.includes(m.user_id));
    },
  });

  const { data: gradeItems = [], isLoading: loadingItems } = useQuery({
    queryKey: ['class-grade-items', classData.id],
    queryFn: async () => {
      const items = await base44.entities.GradeItem.filter({
        school_id: classData.school_id,
        class_id: classData.id
      });
      // Get unique grade items by title
      const uniqueMap = {};
      items.forEach(item => {
        if (!item.student_id) {
          uniqueMap[item.id] = item;
        }
      });
      return Object.values(uniqueMap);
    },
  });

  const { data: allGrades = [], isLoading: loadingGrades } = useQuery({
    queryKey: ['class-grades', classData.id],
    queryFn: () => base44.entities.GradeItem.filter({
      school_id: classData.school_id,
      class_id: classData.id
    }),
  });

  if (loadingItems || loadingGrades) {
    return <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" /></div>;
  }

  const getGradeForStudent = (gradeItemTitle, studentId) => {
    return allGrades.find(g => g.title === gradeItemTitle && g.student_id === studentId);
  };

  const handleGradeClick = (gradeItem, student) => {
    setSelectedGradeItem(gradeItem);
    setSelectedStudent(student);
    setGradeDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Gradebook</h2>
        <CreateGradeItem classData={classData} assignments={assignments} />
      </div>

      {gradeItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400 mb-4">No grade items yet</p>
          <CreateGradeItem classData={classData} assignments={assignments} trigger={
            <Button variant="outline">Create First Grade Item</Button>
          } />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase sticky left-0 bg-slate-50 z-10">
                  Student
                </th>
                {gradeItems.map(item => (
                  <th key={item.id} className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase min-w-[120px]">
                    <div className="flex items-center justify-center gap-1">
                      <span className="truncate">{item.title}</span>
                      {item.visible_to_student ? (
                        <Eye className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <EyeOff className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-normal mt-0.5">
                      {item.max_score} pts
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase min-w-[100px]">
                  Average
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map(student => {
                const studentGrades = gradeItems.map(item => getGradeForStudent(item.title, student.user_id));
                const validScores = studentGrades.filter(g => g?.score != null).map(g => g.score);
                const avg = validScores.length > 0
                  ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
                  : '—';

                return (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900 sticky left-0 bg-white z-10">
                      <div>
                        <p className="text-sm">{student.user_name || student.user_email}</p>
                        <p className="text-xs text-slate-400">{student.grade_level || ''}</p>
                      </div>
                    </td>
                    {gradeItems.map(item => {
                      const grade = getGradeForStudent(item.title, student.user_id);
                      return (
                        <td key={item.id} className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleGradeClick(item, student)}
                            className="w-full h-full min-h-[60px] flex items-center justify-center hover:bg-indigo-50 rounded-lg transition-colors group"
                          >
                            {grade ? (
                              <div>
                                {grade.score != null && (
                                  <div className="text-lg font-semibold text-slate-900">
                                    {grade.score}
                                  </div>
                                )}
                                {grade.ib_grade && (
                                  <Badge className="bg-violet-50 text-violet-700 border-0 text-xs mt-1">
                                    IB {grade.ib_grade}
                                  </Badge>
                                )}
                                {grade.status && grade.status !== 'draft' && grade.status !== 'published' && (
                                  <Badge className={`text-xs mt-1 border-0 ${
                                    grade.status === 'missing' ? 'bg-red-50 text-red-700' :
                                    grade.status === 'late' ? 'bg-amber-50 text-amber-700' :
                                    'bg-blue-50 text-blue-700'
                                  }`}>
                                    {grade.status}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <Edit className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center">
                      <div className="text-lg font-bold text-slate-900">{avg}</div>
                      {avg !== '—' && <div className="text-xs text-slate-400">%</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedGradeItem && selectedStudent && (
        <GradeStudentDialog
          gradeItem={selectedGradeItem}
          student={selectedStudent}
          existingGrade={getGradeForStudent(selectedGradeItem.title, selectedStudent.user_id)}
          open={gradeDialogOpen}
          onClose={() => {
            setGradeDialogOpen(false);
            setSelectedGradeItem(null);
            setSelectedStudent(null);
          }}
        />
      )}
    </div>
  );
}