/**
 * Production Launch & Deployment Console
 * Master control center for production go-live coordination
 * Only accessible to super admin
 */

import React from 'react';
import { useUser } from '@/components/auth/UserContext';
import ProductionLaunch from '@/components/admin/ProductionLaunch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Shield } from 'lucide-react';

export default function SuperAdminProductionLaunch() {
  const { user } = useUser();

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <Card className="bg-red-50 border-red-200 max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <p className="font-semibold text-red-900">
                Admin Access Required
              </p>
            </div>
            <p className="text-sm text-red-800">
              Only super administrators can access the production launch center.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Security Banner */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Shield className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-semibold">
            PRODUCTION LAUNCH CONTROL - All changes are logged and monitored
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-6">
        <ProductionLaunch />
      </div>

      {/* Critical Warnings */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertCircle className="w-5 h-5" />
              Critical Deployment Reminders
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-red-900 space-y-2">
            <p>
              ⚠️ <strong>Do not proceed without:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                Written approval from Security, Operations, and Product teams
              </li>
              <li>Verified production database backups and restore testing</li>
              <li>Stripe integration confirmed in live mode with real keys</li>
              <li>
                All demo data purged from production environment
              </li>
              <li>Monitoring, alerting, and logging fully operational</li>
              <li>Incident response team on standby</li>
              <li>
                Rollback procedure tested and ready to execute
              </li>
            </ul>
            <p className="mt-4 pt-4 border-t border-red-200">
              All deployment actions are automatically logged with timestamp,
              user, and approval status. These logs are immutable for audit
              purposes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}