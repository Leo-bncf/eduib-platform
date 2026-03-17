import React from 'react';
import { 
  MessageSquare, ClipboardList, FolderOpen, BarChart3, 
  Users, CheckSquare, TrendingUp, Settings, CalendarDays, BookMarked
} from 'lucide-react';

const tabs = [
  { id: 'stream', label: 'Stream', icon: MessageSquare },
  { id: 'assignments', label: 'Assignments', icon: ClipboardList },
  { id: 'lessons', label: 'Lessons', icon: CalendarDays, teacherOnly: true },
  { id: 'materials', label: 'Materials', icon: FolderOpen },
  { id: 'grades', label: 'Grades', icon: BarChart3 },
  { id: 'rubrics', label: 'Rubrics', icon: BookMarked, teacherOnly: true },
  { id: 'people', label: 'Roster', icon: Users },
  { id: 'attendance', label: 'Attendance', icon: CheckSquare, teacherOnly: true },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, teacherOnly: true },
  { id: 'settings', label: 'Settings', icon: Settings, teacherOnly: true },
];

export default function ClassNav({ activeTab, onTabChange, isTeacher }) {
  const visibleTabs = isTeacher ? tabs : tabs.filter(t => !t.teacherOnly);

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="flex gap-1 px-6 overflow-x-auto">
        {visibleTabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}