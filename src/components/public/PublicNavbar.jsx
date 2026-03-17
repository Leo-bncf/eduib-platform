import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { GraduationCap, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleSignIn = async () => {
    const isAuthed = await base44.auth.isAuthenticated();
    if (isAuthed) {
      navigate(createPageUrl('AppHome'));
    } else {
      base44.auth.redirectToLogin(createPageUrl('AppHome'));
    }
  };

  const navLinks = [
    { label: 'Features', page: 'Features' },
    { label: 'Pricing', page: 'Plans' },
    { label: 'Security', page: 'Security' },
  ];

  return (
    <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl transition-all duration-300 rounded-full border ${
      scrolled
        ? 'bg-white/80 backdrop-blur-md border-slate-200 shadow-lg'
        : 'bg-white/40 backdrop-blur-md border-white/30'
    }`}>
      <div className="px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to={createPageUrl('Landing')} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-7 h-7 bg-blue-50 rounded-md flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900">
            Scho<span className="text-blue-600 font-normal">lr</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.page}
              to={createPageUrl(link.page)}
              className={`text-sm font-medium transition-colors ${
                location.pathname.includes(link.page)
                  ? 'text-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link to={createPageUrl('Demo')}>
            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
              Contact Sales
            </Button>
          </Link>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5 text-sm font-medium"
            onClick={handleSignIn}
          >
            Sign In
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-slate-600 hover:text-slate-900"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-4 pt-2 border-t border-slate-100 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.page}
              to={createPageUrl(link.page)}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
            >
              {link.label}
            </Link>
          ))}
          <Link to={createPageUrl('Demo')} onClick={() => setMobileOpen(false)}>
            <div className="px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50">Contact Sales</div>
          </Link>
          <Button
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium"
            onClick={handleSignIn}
          >
            Sign In
          </Button>
        </div>
      )}
    </nav>
  );
}