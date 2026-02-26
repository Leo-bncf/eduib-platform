import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import NotificationList from './NotificationList';

export default function NotificationBell({ userId, schoolId }) {
  const [open, setOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ['user-notifications', userId, schoolId],
    queryFn: async () => {
      // Get unread messages
      const messages = await base44.entities.Message.filter({
        school_id: schoolId,
      });
      const unreadMessages = messages.filter(m => 
        m.recipient_ids?.includes(userId) && 
        !m.read_by?.includes(userId)
      );

      // Get recent assignments in user's classes
      const classes = await base44.entities.Class.filter({ school_id: schoolId, status: 'active' });
      const userClasses = classes.filter(c => c.student_ids?.includes(userId));
      
      const assignments = [];
      for (const cls of userClasses) {
        const classAssignments = await base44.entities.Assignment.filter({
          school_id: schoolId,
          class_id: cls.id,
          status: 'published'
        });
        assignments.push(...classAssignments.slice(0, 3));
      }

      // Get recent visible grades
      const grades = await base44.entities.GradeItem.filter({
        school_id: schoolId,
        student_id: userId,
        visible_to_student: true
      });
      const recentGrades = grades.slice(0, 5);

      // Combine notifications
      const allNotifications = [
        ...unreadMessages.map(m => ({
          id: `msg_${m.id}`,
          type: 'message',
          title: 'New Message',
          description: m.subject,
          time: m.created_date,
          unread: true,
        })),
        ...assignments.slice(0, 3).map(a => ({
          id: `assign_${a.id}`,
          type: 'assignment',
          title: 'New Assignment',
          description: a.title,
          time: a.created_date,
          unread: false,
        })),
        ...recentGrades.slice(0, 3).map(g => ({
          id: `grade_${g.id}`,
          type: 'grade',
          title: 'Grade Posted',
          description: g.title,
          time: g.created_date,
          unread: false,
        }))
      ];

      return allNotifications.sort((a, b) => 
        new Date(b.time) - new Date(a.time)
      ).slice(0, 10);
    },
    enabled: !!userId && !!schoolId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-slate-600" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-red-600 text-white border-0 px-1.5 py-0 text-xs min-w-[18px] h-[18px] flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Notifications</h3>
        </div>
        <NotificationList notifications={notifications} onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}