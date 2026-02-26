import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUser } from '@/components/auth/UserContext';
import ClassNav from '@/components/class/ClassNav';
import ClassStream from '@/components/class/ClassStream';
import ClassAssignments from '@/components/class/ClassAssignments';
import ClassMaterials from '@/components/class/ClassMaterials';
import ClassGrades from '@/components/class/ClassGrades';
import ClassPeople from '@/components/class/ClassPeople';
import ClassAttendance from '@/components/class/ClassAttendance';
import ClassAnalytics from '@/components/class/ClassAnalytics';
import ClassSettings from '@/components/class/ClassSettings';
import { Loader2, ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

export default function ClassWorkspace() {
  const { user, schoolId, membership } = useUser();
  const urlParams = new URLSearchParams(window.location.search);
  const classId = urlParams.get('class_id');
  const [activeTab, setActiveTab] = useState(urlParams.get('tab') || 'stream');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('tab', activeTab);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  }, [activeTab]);

  const { data: classData, isLoading: loadingClass } = useQuery({
    queryKey: ['class-details', classId],
    queryFn: () => base44.entities.Class.filter({ id: classId, school_id: schoolId }).then(res => res[0]),
    enabled: !!classId && !!schoolId,
  });

  if (!classId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No class selected</p>
        </div>
      </div>
    );
  }

  if (loadingClass) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Class not found</p>
        </div>
      </div>
    );
  }

  const isTeacher = classData.teacher_ids?.includes(user.id) || membership?.role === 'school_admin' || membership?.role === 'super_admin';
  const isStudent = classData.student_ids?.includes(user.id);

  if (!isTeacher && !isStudent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">You don't have access to this class</p>
        </div>
      </div>
    );
  }

  const getBackLink = () => {
    if (isTeacher) return 'TeacherClasses';
    if (isStudent) return 'StudentDashboard';
    return 'AppHome';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <a href={createPageUrl(getBackLink())}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            </a>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900">{classData.name}</h1>
              <p className="text-sm text-slate-500">
                {classData.section ? `Section ${classData.section}` : ''} 
                {classData.room ? ` · Room ${classData.room}` : ''}
                {classData.schedule_info ? ` · ${classData.schedule_info}` : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ClassNav activeTab={activeTab} onTabChange={setActiveTab} isTeacher={isTeacher} />

      <div className="bg-slate-50 min-h-[calc(100vh-180px)]">
        {activeTab === 'stream' && <ClassStream classData={classData} isTeacher={isTeacher} userId={user.id} />}
        {activeTab === 'assignments' && <ClassAssignments classData={classData} isTeacher={isTeacher} userId={user.id} />}
        {activeTab === 'materials' && <ClassMaterials classData={classData} isTeacher={isTeacher} />}
        {activeTab === 'grades' && <ClassGrades classData={classData} isTeacher={isTeacher} isStudent={isStudent} userId={user.id} />}
        {activeTab === 'people' && <ClassPeople classData={classData} />}
        {activeTab === 'attendance' && <ClassAttendance classData={classData} isTeacher={isTeacher} userId={user.id} />}
        {activeTab === 'analytics' && <ClassAnalytics classData={classData} isTeacher={isTeacher} />}
        {activeTab === 'settings' && <ClassSettings classData={classData} isTeacher={isTeacher} />}
      </div>
    </div>
  );
}