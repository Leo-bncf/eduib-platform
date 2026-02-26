import React from 'react';
import { 
  MessageSquare, ClipboardList, FolderOpen, BarChart3, 
  Users, CheckSquare, TrendingUp, Settings 
} from 'lucide-react';

const tabs = [
  { id: 'stream', label: 'Stream', icon: MessageSquare },
  { id: 'assignments', label: 'Assignments', icon: ClipboardList },
  { id: 'materials', label: 'Materials', icon: FolderOpen },
  { id: 'grades', label: 'Grades', icon: BarChart3 },
  { id: 'people', label: 'People', icon: Users },
  { id: 'attendance', label: 'Attendance', icon: CheckSquare },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function ClassNav({ activeTab, onTabChange, isTeacher }) {
  const visibleTabs = isTeacher ? tabs : tabs.filter(t => !['attendance', 'analytics', 'settings'].includes(t.id));

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