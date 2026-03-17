import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { GraduationCap } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-900/50 rounded-md flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-white font-bold text-base tracking-tight">
                Scho<span className="text-blue-400 font-normal">lr</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              The LMS designed for the needs of IB World Schools. From PYP to DP.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to={createPageUrl('Features')} className="hover:text-white transition-colors">Features</Link></li>
              <li><Link to={createPageUrl('Plans')} className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to={createPageUrl('Security')} className="hover:text-white transition-colors">Security</Link></li>
              <li><Link to={createPageUrl('Demo')} className="hover:text-white transition-colors">Request Demo</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to={createPageUrl('Contact')} className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>hello@scholr.app</li>
              <li>support@scholr.app</li>
              <li className="pt-1">Geneva, Switzerland</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">© {new Date().getFullYear()} Scholr. All rights reserved.</p>
          <p className="text-xs text-slate-600">Serving IB World Schools worldwide</p>
        </div>
      </div>
    </footer>
  );
}