import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUser } from '@/components/auth/UserContext';
import RoleGuard from '@/components/auth/RoleGuard';
import AppSidebar from '@/components/app/AppSidebar';
import ConversationList from '@/components/messaging/ConversationList';
import ConversationView from '@/components/messaging/ConversationView';
import NewMessageDialog from '@/components/messaging/NewMessageDialog';
import { LayoutDashboard, MessageSquare, BookOpen, ClipboardCheck, BarChart3, Users, Loader2 } from 'lucide-react';

const getSidebarLinks = (role) => {
  const dashboardPage = role === 'teacher' ? 'TeacherDashboard'
    : role === 'school_admin' || role === 'ib_coordinator' ? 'SchoolAdminDashboard'
    : role === 'parent' ? 'ParentDashboard'
    : 'StudentDashboard';

  const baseLinks = [
    { label: 'Dashboard', page: dashboardPage, icon: LayoutDashboard },
  ];

  if (role === 'teacher') {
    return [
      ...baseLinks,
      { label: 'My Classes', page: 'TeacherClasses', icon: BookOpen },
      { label: 'Messages', page: 'Messages', icon: MessageSquare },
    ];
  }

  if (role === 'student') {
    return [
      ...baseLinks,
      { label: 'My Classes', page: 'StudentDashboard', icon: BookOpen },
      { label: 'Assignments', page: 'StudentDashboard', icon: ClipboardCheck },
      { label: 'My Grades', page: 'StudentDashboard', icon: BarChart3 },
      { label: 'Messages', page: 'Messages', icon: MessageSquare },
    ];
  }

  return baseLinks;
};

export default function Messages() {
  const { user, school, schoolId, membership } = useUser();
  const [selectedConversation, setSelectedConversation] = useState(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['user-conversations', schoolId, user?.id],
    queryFn: async () => {
      const allMessages = await base44.entities.Message.filter({
        school_id: schoolId,
        is_announcement: false
      }, '-updated_date');

      // Filter messages where user is sender or recipient
      const userMessages = allMessages.filter(m => 
        m.sender_id === user.id || m.recipient_ids?.includes(user.id)
      );

      // Group into conversations
      const conversations = {};
      userMessages.forEach(msg => {
        const otherUserId = msg.sender_id === user.id 
          ? msg.recipient_ids?.[0] 
          : msg.sender_id;
        
        if (!conversations[otherUserId]) {
          conversations[otherUserId] = {
            id: msg.id,
            school_id: msg.school_id,
            participant_id: otherUserId,
            participant_name: msg.sender_id === user.id ? 'Recipient' : msg.sender_name,
            participant_role: msg.sender_id === user.id ? '' : msg.sender_role,
            subject: msg.subject,
            updated_date: msg.updated_date || msg.created_date,
            recipient_ids: msg.recipient_ids,
            unread_count: !msg.read_by?.includes(user.id) ? 1 : 0,
          };
        }
      });

      return Object.values(conversations);
    },
    enabled: !!schoolId && !!user?.id,
  });

  const sidebarLinks = getSidebarLinks(membership?.role);

  return (
    <RoleGuard allowedRoles={['teacher', 'student', 'parent', 'school_admin', 'ib_coordinator', 'super_admin', 'admin']}>
      <div className="min-h-screen bg-slate-50">
        <AppSidebar links={sidebarLinks} role={membership?.role} schoolName={school?.name} userName={user?.full_name} />
        
        <main className="ml-64">
          <div className="bg-white border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
                <p className="text-sm text-slate-500 mt-1">Your conversations</p>
              </div>
              <NewMessageDialog
                userId={user?.id}
                userName={user?.full_name}
                userRole={membership?.role}
                schoolId={schoolId}
              />
            </div>
          </div>

          <div className="flex h-[calc(100vh-140px)]">
            <div className="w-80 border-r border-slate-200 bg-white overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
              ) : (
                <ConversationList
                  conversations={messages}
                  selectedId={selectedConversation?.id}
                  onSelect={setSelectedConversation}
                />
              )}
            </div>

            <ConversationView
              conversation={selectedConversation}
              userId={user?.id}
              userName={user?.full_name}
            />
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}