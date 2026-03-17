import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function PublicNavbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignIn = async () => {
    const isAuthed = await base44.auth.isAuthenticated();
    if (isAuthed) {
      navigate(createPageUrl('AppHome'));
    } else {
      base44.auth.redirectToLogin(createPageUrl('AppHome'));
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Top bar - dark navy like Schedual screenshot */}
      <div className="bg-[#1a2744] text-white/70 text-xs py-1.5 px-6 flex justify-end gap-6 hidden sm:flex">
        <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
        <span className="hover:text-white cursor-pointer transition-colors">Terms of Use</span>
        <Link to={createPageUrl('Contact')} className="hover:text-white transition-colors">Contact Us</Link>
      </div>

      {/* Main navbar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Landing')} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2d4fa3] flex items-center justify-center shadow-sm">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <span className="text-lg font-bold text-[#1a2744]">Scholr</span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-8">
              <Link to={createPageUrl('Landing')} className="text-sm text-slate-600 hover:text-[#2d4fa3] font-medium transition-colors">
                Info
              </Link>
              <Link to={createPageUrl('Features')} className="text-sm text-slate-600 hover:text-[#2d4fa3] font-medium transition-colors">
                Features
              </Link>
              <Link to={createPageUrl('Plans')} className="text-sm text-slate-600 hover:text-[#2d4fa3] font-medium transition-colors">
                Pricing
              </Link>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSignIn}
                className="bg-[#2d4fa3] hover:bg-[#1e3a7a] text-white rounded-full px-5 h-9 text-sm font-medium shadow-sm transition-all hidden sm:flex"
              >
                Go to Panel
              </Button>
              <button className="md:hidden p-1.5 text-slate-600" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 px-4 py-4 flex flex-col gap-3 bg-white">
            <Link to={createPageUrl('Landing')} className="text-sm text-slate-700 font-medium py-2">Info</Link>
            <Link to={createPageUrl('Features')} className="text-sm text-slate-700 font-medium py-2">Features</Link>
            <Link to={createPageUrl('Plans')} className="text-sm text-slate-700 font-medium py-2">Pricing</Link>
            <Button onClick={handleSignIn} className="bg-[#2d4fa3] hover:bg-[#1e3a7a] text-white rounded-full mt-2">
              Go to Panel
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}