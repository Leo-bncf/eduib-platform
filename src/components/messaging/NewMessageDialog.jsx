import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Plus, Send, Moon, AlertTriangle } from 'lucide-react';
import { useMessagingPolicy } from '@/hooks/useMessagingPolicy';

export default function NewMessageDialog({ userId, userName, userRole, schoolId, onClose, trigger }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { canSend: policyCanSend, isQuietHour, policy } = useMessagingPolicy(schoolId);
  const [form, setForm] = useState({
    recipient_type: '',
    recipient_id: '',
    subject: '',
    body: '',
  });

  const { data: teacherClasses = [] } = useQuery({
    queryKey: ['teacher-classes-messaging', schoolId, userId],
    queryFn: async () => {
      const all = await base44.entities.Class.filter({ school_id: schoolId, status: 'active' });
      return all.filter(c => c.teacher_ids?.includes(userId));
    },
    enabled: userRole === 'teacher' && !!schoolId && !!userId,
  });

  const { data: classMembers = [] } = useQuery({
    queryKey: ['class-members-messaging', form.recipient_type],
    queryFn: async () => {
      const members = await base44.entities.SchoolMembership.filter({ school_id: schoolId, status: 'active' });
      const cls = teacherClasses.find(c => c.id === form.recipient_type.replace('class_', ''));
      return members.filter(m => cls?.student_ids?.includes(m.user_id));
    },
    enabled: form.recipient_type?.startsWith('class_') && teacherClasses.length > 0,
  });

  // Parents linked to students in selected class
  const { data: parentLinks = [] } = useQuery({
    queryKey: ['class-parents-messaging', form.recipient_type],
    queryFn: async () => {
      const studentIds = classMembers.map(m => m.user_id);
      if (studentIds.length === 0) return [];
      const links = await base44.entities.ParentStudentLink.filter({ school_id: schoolId });
      const parentUserIds = [...new Set(links.filter(l => studentIds.includes(l.student_id)).map(l => l.parent_id))];
      if (parentUserIds.length === 0) return [];
      const allMembers = await base44.entities.SchoolMembership.filter({ school_id: schoolId, status: 'active' });
      return allMembers.filter(m => parentUserIds.includes(m.user_id));
    },
    enabled: form.recipient_type?.startsWith('class_') && classMembers.length > 0 && userRole === 'teacher',
  });

  const students = classMembers;

  const { data: studentClasses = [] } = useQuery({
    queryKey: ['student-classes-messaging', schoolId, userId],
    queryFn: async () => {
      const all = await base44.entities.Class.filter({ school_id: schoolId, status: 'active' });
      return all.filter(c => c.student_ids?.includes(userId));
    },
    enabled: userRole === 'student' && !!schoolId && !!userId,
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ['class-teachers-messaging', form.recipient_type],
    queryFn: async () => {
      const members = await base44.entities.SchoolMembership.filter({ school_id: schoolId, status: 'active' });
      const cls = studentClasses.find(c => c.id === form.recipient_type.replace('class_', ''));
      return members.filter(m => cls?.teacher_ids?.includes(m.user_id));
    },
    enabled: form.recipient_type?.startsWith('class_') && studentClasses.length > 0,
  });

  const sendMutation = useMutation({
    mutationFn: (data) => base44.entities.Message.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
      setOpen(false);
      if (onClose) onClose();
      setForm({ recipient_type: '', recipient_id: '', subject: '', body: '' });
    },
  });

  const handleSend = () => {
    sendMutation.mutate({
      school_id: schoolId,
      sender_id: userId,
      sender_name: userName,
      sender_role: userRole,
      recipient_ids: [form.recipient_id],
      subject: form.subject,
      body: form.body,
      is_announcement: false,
    });
  };

  // Policy checks
  const allRecipients = [...students, ...parentLinks, ...teachers];
  const selectedRecipient = allRecipients.find(m => m.user_id === form.recipient_id);
  const recipientRole = selectedRecipient?.role || (userRole === 'teacher' ? 'student' : 'teacher');
  const policyBlocked = form.recipient_id ? !policyCanSend(userRole, recipientRole) : false;
  const quietHour = isQuietHour();
  const quietBlocked = quietHour
    && (policy?.quiet_hours?.block_send_during_quiet ?? false)
    && (policy?.quiet_hours?.applies_to_roles || []).includes(userRole);
  const canSubmit = form.recipient_id && form.subject.trim() && form.body.trim() && !policyBlocked && !quietBlocked;

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button onClick={() => setOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> New Message
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {quietHour && (policy?.quiet_hours?.applies_to_roles || []).includes(userRole) && (
              <div className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm border ${quietBlocked ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                <Moon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{quietBlocked ? 'Quiet hours active — sending is disabled' : 'Quiet hours active'}</p>
                  <p className="text-xs mt-0.5 opacity-80">
                    {quietBlocked
                      ? `Your school has disabled messaging during quiet hours (${policy.quiet_hours.start_time} – ${policy.quiet_hours.end_time}).`
                      : `It's outside recommended communication hours (${policy.quiet_hours.start_time} – ${policy.quiet_hours.end_time}). You can still send, but consider the recipient's time.`}
                  </p>
                </div>
              </div>
            )}

            {policyBlocked && form.recipient_id && (
              <div className="flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm bg-red-50 border border-red-200 text-red-800">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>Your school's communication policy does not allow this type of message. Please contact your school administrator.</p>
              </div>
            )}

            <div>
              <Label className="text-sm font-semibold">Select Class</Label>
              <Select value={form.recipient_type} onValueChange={v => setForm({ ...form, recipient_type: v, recipient_id: '' })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Choose a class..." />
                </SelectTrigger>
                <SelectContent>
                  {userRole === 'teacher' && teacherClasses.map(c => (
                    <SelectItem key={c.id} value={`class_${c.id}`}>{c.name}</SelectItem>
                  ))}
                  {userRole === 'student' && studentClasses.map(c => (
                    <SelectItem key={c.id} value={`class_${c.id}`}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {form.recipient_type && (
              <div>
                <Label className="text-sm font-semibold">
                  {userRole === 'teacher' ? 'Select Recipient' : 'Select Teacher'}
                </Label>
                <Select value={form.recipient_id} onValueChange={v => setForm({ ...form, recipient_id: v })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Choose recipient..." />
                  </SelectTrigger>
                  <SelectContent>
                    {userRole === 'teacher' && students.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs text-slate-400 font-semibold uppercase">Students</div>
                        {students.map(s => (
                          <SelectItem key={s.user_id} value={s.user_id}>{s.user_name || s.user_email}</SelectItem>
                        ))}
                      </>
                    )}
                    {userRole === 'teacher' && parentLinks.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs text-slate-400 font-semibold uppercase mt-1">Parents / Guardians</div>
                        {parentLinks.map(p => (
                          <SelectItem key={p.user_id} value={p.user_id}>{p.user_name || p.user_email}</SelectItem>
                        ))}
                      </>
                    )}
                    {userRole === 'student' && teachers.map(t => (
                      <SelectItem key={t.user_id} value={t.user_id}>{t.user_name || t.user_email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="text-sm font-semibold">Subject</Label>
              <Input
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                placeholder="Message subject..."
                className="mt-1.5"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">Message</Label>
              <Textarea
                value={form.body}
                onChange={e => setForm({ ...form, body: e.target.value })}
                placeholder="Type your message..."
                rows={6}
                className="mt-1.5"
              />
            </div>

            <Button
              onClick={handleSend}
              disabled={!canSubmit || sendMutation.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Send Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}