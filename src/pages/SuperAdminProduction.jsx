/**
 * Production Operations Dashboard
 * Super admin view for deployment readiness and operational monitoring
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/components/auth/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Settings, Zap } from 'lucide-react';
import DeploymentStatus from '@/components/admin/DeploymentStatus';
import ProductionChecklist from '@/components/admin/ProductionChecklist';

export default function SuperAdminProduction() {
  const navigate = useNavigate();
  const { user } = useUser();

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-slate-900 font-semibold">Admin access required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Production Operations
          </h1>
          <p className="text-slate-600 mt-2">
            Deployment readiness, configuration, and operational monitoring
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Health Status
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Check system health and readiness
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 p-6">
              <div className="flex items-start gap-3">
                <Settings className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Configuration
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Verify production configuration
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 p-6">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Deployment
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Monitor deployment status
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deployment Status */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Deployment Status
          </h2>
          <DeploymentStatus />
        </div>

        {/* Production Checklist */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Pre-Deployment Checklist
          </h2>
          <ProductionChecklist />
        </div>

        {/* Security Notice */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <AlertCircle className="w-5 h-5" />
              Important: Production Deployment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-blue-900">
            <p>
              Before deploying to production, ensure you have reviewed and
              completed the entire Production Deployment Guide:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>All environment variables configured correctly</li>
              <li>Stripe integration switched to live mode</li>
              <li>Security headers and CORS configured</li>
              <li>Database backups and recovery procedures tested</li>
              <li>Monitoring and alerting systems in place</li>
              <li>Disaster recovery plan documented</li>
              <li>Operations team trained and ready</li>
            </ul>
            <p className="mt-4 font-semibold">
              Do not proceed to production without completing all checklist
              items and obtaining approval from your operations team.
            </p>
          </CardContent>
        </Card>

        {/* Quick References */}
        <Card>
          <CardHeader>
            <CardTitle>Documentation & References</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-200 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Deployment Guide
                </h3>
                <p className="text-xs text-slate-600 mb-3">
                  Step-by-step instructions for deploying to production
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Read Guide
                </Button>
              </div>

              <div className="p-4 border border-slate-200 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Security Checklist
                </h3>
                <p className="text-xs text-slate-600 mb-3">
                  Security hardening steps before production
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Review Security
                </Button>
              </div>

              <div className="p-4 border border-slate-200 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Operations Runbooks
                </h3>
                <p className="text-xs text-slate-600 mb-3">
                  Common operational tasks and procedures
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Runbooks
                </Button>
              </div>

              <div className="p-4 border border-slate-200 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Incident Response
                </h3>
                <p className="text-xs text-slate-600 mb-3">
                  Procedures for handling production incidents
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Procedures
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}