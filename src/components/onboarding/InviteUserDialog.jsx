import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Mail, UserPlus, CheckCircle2 } from 'lucide-react';
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
      const response = await base44.functions.invoke('sendInvitation', {
        schoolId,
        schoolName,
        email: data.email,
        role: data.role,
        firstName: data.first_name,
        lastName: data.last_name,
        gradeLevel: data.grade_level,
        department: data.department,
        customMessage: data.custom_message,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
      if (data?.inviteUrl) {
        setInviteLink(data.inviteUrl);
      } else {
        onClose();
      }
      setFormData({
        email: '',
        role: 'teacher',
        first_name: '',
        last_name: '',
        grade_level: '',
        department: '',
        custom_message: '',
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    inviteMutation.mutate(formData);
  };

  const handleClose = () => {
    setInviteLink(null);
    setCopied(false);
    onClose();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inviteLink) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Invitation Created
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-slate-600">
              The invitation has been created. Share this link with the user to accept their invitation:
            </p>
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-700 flex-1 break-all font-mono">{inviteLink}</p>
              <Button size="sm" variant="outline" onClick={copyLink} className="shrink-0">
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <Button className="w-full" onClick={handleClose}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
              An email with an accept link will be sent to <strong>{formData.email || 'the user'}</strong>. The link expires in 7 days.
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
            <Button type="button" onClick={handleClose} variant="outline" className="flex-1">
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