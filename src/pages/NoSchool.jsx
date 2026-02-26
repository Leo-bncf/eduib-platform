import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NoSchool() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-6">
          <Building2 className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">No School Assigned</h1>
        <p className="text-slate-500 mb-6">Your account is not linked to any school yet. Please contact your school administrator to get set up.</p>
        <Link to={createPageUrl('Landing')}>
          <Button variant="outline">Return to Homepage</Button>
        </Link>
      </div>
    </div>
  );
}