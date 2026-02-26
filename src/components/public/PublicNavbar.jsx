import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { GraduationCap, Menu } from 'lucide-react';

export default function PublicNavbar() {
  return (
    <nav className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={createPageUrl('Landing')} className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Atlas<span className="text-indigo-600">IB</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl('Features')} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Features
            </Link>
            <Link to={createPageUrl('Pricing')} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Pricing
            </Link>
            <Link to={createPageUrl('Contact')} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Contact
            </Link>
            <Link to={createPageUrl('Demo')}>
              <Button variant="outline" size="sm">Book a Demo</Button>
            </Link>
            <Link to={createPageUrl('AppHome')}>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">Sign In</Button>
            </Link>
          </div>

          <button className="md:hidden p-2">
            <Menu className="w-6 h-6 text-slate-600" />
          </button>
        </div>
      </div>
    </nav>
  );
}