import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Displays account state issues and guidance
 */
export default function AccountStateAlert({ issue }) {
  const navigate = useNavigate();

  const issueConfigs = {
    account_locked: {
      title: 'Account Temporarily Locked',
      icon: Lock,
      severity: 'error',
      actions: [
        { label: 'Reset Password', onClick: () => navigate('/password-reset') },
        { label: 'Return Home', onClick: () => navigate('/') }
      ]
    },
    suspended: {
      title: 'Account Suspended',
      icon: AlertCircle,
      severity: 'error',
      actions: [
        { label: 'Contact Administrator', onClick: () => {} },
        { label: 'Return Home', onClick: () => navigate('/') }
      ]
    },
    pending_activation: {
      title: 'Pending Activation',
      icon: AlertCircle,
      severity: 'warning',
      actions: [
        { label: 'Check Email', onClick: () => {} },
        { label: 'Resend Link', onClick: () => {} }
      ]
    },
    invited: {
      title: 'Invitation Pending',
      icon: AlertCircle,
      severity: 'info',
      actions: [
        { label: 'Accept Invitation', onClick: () => navigate('/accept-invitation') }
      ]
    },
    incomplete_profile: {
      title: 'Complete Your Profile',
      icon: AlertCircle,
      severity: 'warning',
      actions: [
        { label: 'Complete Now', onClick: () => navigate('/first-login?step=complete_profile') },
        { label: 'Do This Later', onClick: () => navigate('/dashboard') }
      ]
    }
  };

  const config = issueConfigs[issue.type] || issueConfigs.account_locked;
  const IconComponent = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              config.severity === 'error' ? 'bg-red-100' :
              config.severity === 'warning' ? 'bg-amber-100' :
              'bg-blue-100'
            }`}>
              <IconComponent className={`w-6 h-6 ${
                config.severity === 'error' ? 'text-red-600' :
                config.severity === 'warning' ? 'text-amber-600' :
                'text-blue-600'
              }`} />
            </div>
          </div>
          <CardTitle className="text-center">{config.title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert className={`${
            config.severity === 'error' ? 'bg-red-50 border-red-200' :
            config.severity === 'warning' ? 'bg-amber-50 border-amber-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            <AlertDescription className={`${
              config.severity === 'error' ? 'text-red-800' :
              config.severity === 'warning' ? 'text-amber-800' :
              'text-blue-800'
            }`}>
              {issue.message}
            </AlertDescription>
          </Alert>

          {issue.contact && (
            <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
              <p className="font-semibold mb-1">Need help?</p>
              <p>Contact your school administrator for assistance with your account.</p>
            </div>
          )}

          <div className="space-y-2">
            {config.actions.map((action, idx) => (
              <Button
                key={idx}
                onClick={action.onClick}
                variant={idx === 0 ? 'default' : 'outline'}
                className="w-full"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}