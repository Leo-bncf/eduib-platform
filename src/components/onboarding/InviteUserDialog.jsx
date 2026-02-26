import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Mail, UserPlus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function InviteUserDialog({ open, onClose, schoolId, schoolName }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    email: '',
    role: 'teacher',
    first_name: '',
    last_name: '',
    grade_level: '',
    department: '',
    custom_message: '',
  });

  const inviteMutation = useMutation({
    mutationFn: async (data) => {
      const invitationToken = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const user = await base44.auth.me();

      const invitation = await base44.entities.UserInvitation.create({
        school_id: schoolId,
        email: data.email,
        role: data.role,
        invited_by: user.id,
        invited_by_name: user.full_name || user.email,
        status: 'pending',
        invitation_token: invitationToken,
        expires_at: expiresAt.toISOString(),
        metadata: {
          first_name: data.first_name,
          last_name: data.last_name,
          grade_level: data.grade_level,
          department: data.department,
          custom_message: data.custom_message,
        },
      });

      // Send invitation email
      const inviteUrl = `${window.location.origin}?page=AcceptInvitation&token=${invitationToken}`;
      
      await base44.integrations.Core.SendEmail({
        to: data.email,
        from_name: schoolName,
        subject: `You're invited to join ${schoolName} on AtlasIB`,
        body: `
          <h2>Welcome to ${schoolName}!</h2>
          <p>You've been invited to join ${schoolName} on AtlasIB as a <strong>${data.role.replace('_', ' ')}</strong>.</p>
          ${data.custom_message ? `<p><em>"${data.custom_message}"</em></p>` : ''}
          <p>Click the link below to accept your invitation and set up your account:</p>
          <p><a href="${inviteUrl}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:white;text-decoration:none;border-radius:8px;font-weight:600;">Accept Invitation</a></p>
          <p>Or copy this link: ${inviteUrl}</p>
          <p style="color:#666;font-size:14px;">This invitation expires in 7 days.</p>
          <p style="color:#999;font-size:12px;margin-top:24px;">If you didn't expect this invitation, you can safely ignore this email.</p>
        `,
      });

      return invitation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
      setFormData({
        email: '',
        role: 'teacher',
        first_name: '',
        last_name: '',
        grade_level: '',
        department: '',
        custom_message: '',
      });
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    inviteMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite User to {schoolName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold">First Name (Optional)</Label>
              <Input
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="John"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">Last Name (Optional)</Label>
              <Input
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Doe"
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold">Email Address *</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@school.com"
              required
              className="mt-1.5"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold">Role *</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="school_admin">School Admin</SelectItem>
                <SelectItem value="ib_coordinator">IB Coordinator</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.role === 'student' && (
            <div>
              <Label className="text-sm font-semibold">Grade Level</Label>
              <Input
                value={formData.grade_level}
                onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                placeholder="e.g., DP1, DP2"
                className="mt-1.5"
              />
            </div>
          )}

          {formData.role === 'teacher' && (
            <div>
              <Label className="text-sm font-semibold">Department</Label>
              <Input
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g., Mathematics"
                className="mt-1.5"
              />
            </div>
          )}

          <div>
            <Label className="text-sm font-semibold">Personal Message (Optional)</Label>
            <Textarea
              value={formData.custom_message}
              onChange={(e) => setFormData({ ...formData, custom_message: e.target.value })}
              placeholder="Add a personal welcome message..."
              rows={3}
              className="mt-1.5"
            />
          </div>

          <Alert className="border-indigo-200 bg-indigo-50">
            <Mail className="w-4 h-4 text-indigo-700" />
            <AlertDescription className="text-sm text-indigo-900">
              An invitation email will be sent to <strong>{formData.email || 'the user'}</strong> with a link to accept and create their account.
            </AlertDescription>
          </Alert>

          {inviteMutation.isError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-sm text-red-900">
                Failed to send invitation. Please try again.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-3 pt-4">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={inviteMutation.isPending || !formData.email}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {inviteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}