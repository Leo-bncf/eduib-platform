import React from 'react';
import { useUser } from '@/components/auth/UserContext';
import AttendanceRecorder from '@/components/attendance/AttendanceRecorder';

export default function ClassAttendance({ classData, isTeacher, userId }) {
  const { membership } = useUser();

  if (!isTeacher) {
    return (
      <div className="p-6 text-center text-slate-400">
        <p>Only teachers can record attendance</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Class Attendance</h2>
      <AttendanceRecorder
        classData={classData}
        teacherId={userId}
        teacherName={membership?.user_name}
      />
    </div>
  );
}