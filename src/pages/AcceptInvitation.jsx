import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Mail, Building2, UserCheck } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function AcceptInvitation() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const [fullName, setFullName] = useState('');
  const [accepting, setAccepting] = useState(false);

  const { data: invitation, isLoading, error } = useQuery({
    queryKey: ['invitation', token],
    queryFn: async () => {
      const invitations = await base44.entities.UserInvitation.filter({
        invitation_token: token,
        status: 'pending'
      });
      if (invitations.length === 0) {
        throw new Error('Invitation not found or already used');
      }
      const inv = invitations[0];
      
      // Check if expired
      if (new Date(inv.expires_at) < new Date()) {
        throw new Error('This invitation has expired');
      }
      
      return inv;
    },
    enabled: !!token,
    retry: false,
  });

  const { data: school } = useQuery({
    queryKey: ['school', invitation?.school_id],
    queryFn: async () => {
      const schools = await base44.entities.School.filter({ id: invitation.school_id });
      return schools[0];
    },
    enabled: !!invitation?.school_id,
  });

  useEffect(() => {
    if (invitation?.metadata?.first_name && invitation?.metadata?.last_name) {
      setFullName(`${invitation.metadata.first_name} ${invitation.metadata.last_name}`);
    }
  }, [invitation]);

  const acceptInvitation = async () => {
    setAccepting(true);
    try {
      const isAuthed = await base44.auth.isAuthenticated();
      
      if (!isAuthed) {
        // Redirect to login with invitation token
        base44.auth.redirectToLogin(createPageUrl('AcceptInvitation') + `?token=${token}`);
        return;
      }

      const user = await base44.auth.me();

      // Check if email matches
      if (user.email !== invitation.email) {
        alert(`This invitation was sent to ${invitation.email}. Please log in with that email address.`);
        setAccepting(false);
        return;
      }

      // Update user full name if provided
      if (fullName.trim() && !user.full_name) {
        await base44.auth.updateMe({ full_name: fullName.trim() });
      }

      // Create school membership
      await base44.entities.SchoolMembership.create({
        user_id: user.id,
        user_email: user.email,
        user_name: fullName.trim() || user.full_name || user.email,
        school_id: invitation.school_id,
        role: invitation.role,
        status: 'active',
        grade_level: invitation.metadata?.grade_level,
        department: invitation.metadata?.department,
      });

      // Mark invitation as accepted
      await base44.entities.UserInvitation.update(invitation.id, {
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        user_id: user.id,
      });

      // Set active school
      await base44.auth.updateMe({ active_school_id: invitation.school_id });

      // Redirect to appropriate dashboard
      setTimeout(() => {
        window.location.href = createPageUrl('AppHome');
      }, 1500);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      alert('Failed to accept invitation. Please try again.');
      setAccepting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Invalid Invitation</h1>
          <p className="text-slate-500">No invitation token provided.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-500">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Invitation Invalid</h1>
          <p className="text-slate-500 mb-6">
            {error?.message || 'This invitation is no longer valid.'}
          </p>
          <Button variant="outline" onClick={() => window.location.href = createPageUrl('Landing')}>
            Return to Homepage
          </Button>
        </div>
      </div>
    );
  }

  if (accepting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md bg-white rounded-2xl border border-slate-200 p-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Setting up your account...</h2>
          <p className="text-slate-500 text-sm">This will just take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-6">
          <div className="flex items-center gap-3 text-white mb-2">
            <Building2 className="w-6 h-6" />
            <h1 className="text-2xl font-bold">{school?.name || 'School'}</h1>
          </div>
          <p className="text-indigo-100 text-sm">You've been invited to join!</p>
        </div>

        <div className="p-8">
          <div className="mb-6">
            <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <Mail className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-indigo-900">Invitation Details</p>
                <p className="text-xs text-indigo-700 mt-1">
                  Email: <strong>{invitation.email}</strong>
                </p>
                <p className="text-xs text-indigo-700">
                  Role: <strong className="capitalize">{invitation.role.replace('_', ' ')}</strong>
                </p>
                {invitation.invited_by_name && (
                  <p className="text-xs text-indigo-600 mt-1">
                    Invited by {invitation.invited_by_name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {invitation.metadata?.custom_message && (
            <Alert className="mb-6 border-slate-200">
              <AlertDescription className="text-sm text-slate-700 italic">
                "{invitation.metadata.custom_message}"
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <Label className="text-sm font-semibold">Your Full Name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
                className="mt-1.5"
              />
              <p className="text-xs text-slate-500 mt-1">
                This will be displayed across the platform
              </p>
            </div>
          </div>

          <Button 
            onClick={acceptInvitation}
            disabled={!fullName.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base font-semibold"
          >
            <UserCheck className="w-5 h-5 mr-2" />
            Accept Invitation & Continue
          </Button>

          <p className="text-xs text-slate-400 text-center mt-6">
            By accepting, you agree to join {school?.name} and access the platform as a {invitation.role.replace('_', ' ')}.
          </p>
        </div>
      </div>
    </div>
  );
}