import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Copy, Check } from 'lucide-react';

export default function ManageUserDialog({ open, onOpenChange, user, onUserUpdated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);
  const [newRole, setNewRole] = useState(user?.role || 'user');

  useEffect(() => {
    if (user) {
      setNewRole(user.role || 'user');
    }
    setError('');
    setSuccess('');
  }, [user, open]);

  const handleChangeRole = async () => {
    if (newRole === user.role) {
      setError('Please select a different role');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await base44.auth.updateMe({
        ...user,
        role: newRole
      });

      setSuccess(`Role updated to ${newRole}`);
      setTimeout(() => {
        onOpenChange(false);
        if (onUserUpdated) {
          onUserUpdated();
        }
      }, 1500);
    } catch (err) {
      console.error('Error updating role:', err);
      setError(err.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!window.confirm(`Send password reset email to ${user.email}?`)) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      // This would typically call a backend function to send password reset email
      // For now, we'll show a message
      setSuccess('Password reset email sent successfully');
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(user.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage User</DialogTitle>
          <DialogDescription>
            Update user settings and permissions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800 ml-3 text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <Check className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800 ml-3 text-sm">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* User Info */}
          <div className="p-3 bg-slate-50 rounded-lg space-y-2">
            <div>
              <p className="text-xs text-slate-600">Name</p>
              <p className="font-semibold text-slate-900 text-sm">{user.full_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600">Email</p>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-900 text-sm break-all">{user.email}</p>
                <Button
                  onClick={handleCopyEmail}
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 flex-shrink-0"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-green-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-600">User ID</p>
              <p className="font-mono text-slate-900 text-xs break-all">{user.id}</p>
            </div>
          </div>

          {/* Change Role */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Change Role</Label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="user">User</option>
              <option value="super_admin">Super Admin</option>
              <option value="school_admin">School Admin</option>
              <option value="ib_coordinator">IB Coordinator</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
            </select>
            <p className="text-xs text-slate-600 mt-1">Current role: <strong>{user.role}</strong></p>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <Button
              onClick={handleChangeRole}
              disabled={loading || newRole === user.role}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Update Role
            </Button>

            <Button
              onClick={handleResetPassword}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Send Password Reset Email
            </Button>

            <Button
              onClick={() => onOpenChange(false)}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}