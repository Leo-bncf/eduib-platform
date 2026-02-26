import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Menu, X, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: 'Features', page: 'Features' },
    { label: 'Pricing', page: 'Pricing' },
    { label: 'Security', page: 'Security' },
    { label: 'Contact', page: 'Contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={createPageUrl('Landing')} className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Atlas<span className="text-indigo-600">IB</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <Link key={l.page} to={createPageUrl(l.page)} className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to={createPageUrl('Demo')}>
              <Button variant="ghost" size="sm" className="text-slate-700 font-medium">
                Book a Demo
              </Button>
            </Link>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-5" onClick={() => window.location.href = createPageUrl('AppHome')}>
              Login
            </Button>
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 pb-4">
          {links.map(l => (
            <Link key={l.page} to={createPageUrl(l.page)} className="block py-3 text-sm font-medium text-slate-700 border-b border-slate-50" onClick={() => setMobileOpen(false)}>
              {l.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 mt-4">
            <Link to={createPageUrl('Demo')} onClick={() => setMobileOpen(false)}>
              <Button variant="outline" className="w-full">Book a Demo</Button>
            </Link>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => { setMobileOpen(false); window.location.href = createPageUrl('AppHome'); }}>
              Login
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}