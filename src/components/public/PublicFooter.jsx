import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { GraduationCap } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Atlas<span className="text-indigo-400">IB</span></span>
            </div>
            <p className="text-sm text-slate-400">
              The all-in-one IB platform for modern schools.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to={createPageUrl('Features')} className="hover:text-white transition-colors">Features</Link></li>
              <li><Link to={createPageUrl('Pricing')} className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to={createPageUrl('Security')} className="hover:text-white transition-colors">Security</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to={createPageUrl('Contact')} className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link to={createPageUrl('Demo')} className="hover:text-white transition-colors">Book a Demo</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-sm text-center text-slate-500">
          © {new Date().getFullYear()} AtlasIB. All rights reserved.
        </div>
      </div>
    </footer>
  );
}