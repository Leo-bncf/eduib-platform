import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';

export default function PublicNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={createPageUrl('Landing')} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">
              Atlas<span className="text-indigo-600">IB</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link to={createPageUrl('Features')}>
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                Features
              </Button>
            </Link>
            <Link to={createPageUrl('Plans')}>
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                Pricing
              </Button>
            </Link>
            <Link to={createPageUrl('Contact')}>
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                Contact
              </Button>
            </Link>
            <Link to={createPageUrl('Demo')}>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                Book Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}