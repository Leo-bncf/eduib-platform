import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PublicFooter() {
  return (
    <footer className="border-t border-slate-100 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Product</h3>
            <ul className="space-y-2">
              <li><Link to={createPageUrl('Features')} className="text-sm text-slate-600 hover:text-slate-900">Features</Link></li>
              <li><Link to={createPageUrl('Plans')} className="text-sm text-slate-600 hover:text-slate-900">Pricing</Link></li>
              <li><Link to={createPageUrl('Security')} className="text-sm text-slate-600 hover:text-slate-900">Security</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Company</h3>
            <ul className="space-y-2">
              <li><Link to={createPageUrl('Contact')} className="text-sm text-slate-600 hover:text-slate-900">Contact</Link></li>
              <li><Link to={createPageUrl('Demo')} className="text-sm text-slate-600 hover:text-slate-900">Book Demo</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-slate-600 hover:text-slate-900">Documentation</a></li>
              <li><a href="#" className="text-sm text-slate-600 hover:text-slate-900">Support</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-slate-600 hover:text-slate-900">Privacy</a></li>
              <li><a href="#" className="text-sm text-slate-600 hover:text-slate-900">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-200">
          <p className="text-center text-sm text-slate-500">
            © {new Date().getFullYear()} AtlasIB. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}