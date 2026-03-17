import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PublicFooter() {
  return (
    <footer className="bg-[#1a2744] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-10">
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#2d4fa3] flex items-center justify-center">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <span className="text-lg font-bold">Scholr</span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              The LMS built exclusively for IB World Schools — from PYP to Diploma Programme.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">Product</h4>
            <ul className="space-y-2.5">
              <li><Link to={createPageUrl('Features')} className="text-sm text-white/60 hover:text-white transition-colors">Features</Link></li>
              <li><Link to={createPageUrl('Plans')} className="text-sm text-white/60 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to={createPageUrl('Security')} className="text-sm text-white/60 hover:text-white transition-colors">Security</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">Company</h4>
            <ul className="space-y-2.5">
              <li><Link to={createPageUrl('Demo')} className="text-sm text-white/60 hover:text-white transition-colors">Book a Demo</Link></li>
              <li><Link to={createPageUrl('Contact')} className="text-sm text-white/60 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">© 2026 Scholr. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="text-xs text-white/30 hover:text-white/60 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="text-xs text-white/30 hover:text-white/60 cursor-pointer transition-colors">Terms of Use</span>
          </div>
        </div>
      </div>
    </footer>
  );
}