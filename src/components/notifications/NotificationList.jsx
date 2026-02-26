import React from 'react';
import { format } from 'date-fns';
import { MessageSquare, ClipboardCheck, BarChart3, Bell } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function NotificationList({ notifications, onClose }) {
  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400">
        <Bell className="w-12 h-12 mx-auto mb-2 text-slate-300" />
        <p className="text-sm">No new notifications</p>
      </div>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case 'message': return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'assignment': return <ClipboardCheck className="w-4 h-4 text-emerald-600" />;
      case 'grade': return <BarChart3 className="w-4 h-4 text-violet-600" />;
      default: return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  const getLink = (notification) => {
    switch (notification.type) {
      case 'message': return createPageUrl('Messages');
      case 'assignment': return createPageUrl('StudentDashboard');
      case 'grade': return createPageUrl('StudentDashboard');
      default: return '#';
    }
  };

  return (
    <div className="max-h-[400px] overflow-y-auto">
      <div className="divide-y divide-slate-100">
        {notifications.map(notif => (
          <a
            key={notif.id}
            href={getLink(notif)}
            onClick={onClose}
            className={`block px-4 py-3 hover:bg-slate-50 transition-colors ${
              notif.unread ? 'bg-blue-50/50' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getIcon(notif.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm ${notif.unread ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                    {notif.title}
                  </p>
                  {notif.unread && (
                    <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-sm text-slate-600 truncate">{notif.description}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {notif.time ? format(new Date(notif.time), 'MMM d, h:mm a') : ''}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}