import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { GraduationCap } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Atlas<span className="text-indigo-400">IB</span></span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              The modern platform for IB schools. Manage teaching, grading, communication, and administration in one place.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</h4>
            <div className="space-y-2.5">
              <Link to={createPageUrl('Features')} className="block text-sm hover:text-white transition-colors">Features</Link>
              <Link to={createPageUrl('Pricing')} className="block text-sm hover:text-white transition-colors">Pricing</Link>
              <Link to={createPageUrl('Security')} className="block text-sm hover:text-white transition-colors">Security</Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h4>
            <div className="space-y-2.5">
              <Link to={createPageUrl('Contact')} className="block text-sm hover:text-white transition-colors">Contact</Link>
              <Link to={createPageUrl('Demo')} className="block text-sm hover:text-white transition-colors">Book a Demo</Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h4>
            <div className="space-y-2.5">
              <Link to={createPageUrl('Security')} className="block text-sm hover:text-white transition-colors">Privacy Policy</Link>
              <Link to={createPageUrl('Security')} className="block text-sm hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 text-center">
          <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} AtlasIB. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}