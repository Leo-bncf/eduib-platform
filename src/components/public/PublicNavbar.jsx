import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { GraduationCap, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
      <nav className={`w-full max-w-5xl rounded-xl border border-slate-200 bg-white/90 backdrop-blur-md shadow-lg px-5 py-3 flex items-center justify-between transition-all duration-300 ${scrolled ? 'shadow-xl' : ''}`}>
        {/* Logo */}
        <Link to={createPageUrl('Landing')} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900">
            Atlas<span className="text-blue-600 font-normal">IB</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          <Link to={createPageUrl('Features')} className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors font-medium">Features</Link>
          <Link to={createPageUrl('Pricing')} className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors font-medium">Pricing</Link>
          <Link to={createPageUrl('Security')} className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors font-medium">Security</Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          <Link to={createPageUrl('Demo')}>
            <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium">
              Contact Sales
            </Button>
          </Link>
          <Link to={createPageUrl('AppHome')}>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-1.5 rounded-md text-slate-600 hover:bg-slate-50" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-16 left-4 right-4 bg-white rounded-xl border border-slate-200 shadow-xl p-4 flex flex-col gap-2">
          <Link to={createPageUrl('Features')} onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md font-medium">Features</Link>
          <Link to={createPageUrl('Pricing')} onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md font-medium">Pricing</Link>
          <Link to={createPageUrl('Security')} onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md font-medium">Security</Link>
          <hr className="border-slate-100" />
          <Link to={createPageUrl('Demo')} onClick={() => setMobileOpen(false)}>
            <Button variant="outline" size="sm" className="w-full">Contact Sales</Button>
          </Link>
          <Link to={createPageUrl('AppHome')} onClick={() => setMobileOpen(false)}>
            <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Sign In</Button>
          </Link>
        </div>
      )}
    </div>
  );
}