import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { GraduationCap, Mail, Linkedin, Twitter } from 'lucide-react';

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: 'Features', page: 'Features' },
    { label: 'Pricing', page: 'Pricing' },
    { label: 'Security', page: 'Security' },
    { label: 'Contact', page: 'Contact' },
  ];

  const socialLinks = [
    { icon: Mail, href: 'mailto:support@scholr.pro', label: 'Email' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Twitter, href: '#', label: 'Twitter' },
  ];

  return (
    <footer className="bg-white/50 backdrop-blur-sm border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link to={createPageUrl('Landing')} className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-50 rounded-md flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-lg font-bold text-slate-900">Scho<span className="text-blue-600">lr</span></span>
            </Link>
            <p className="text-sm text-slate-600">The LMS designed for IB World Schools</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={createPageUrl(link.page)}
                    className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="mailto:support@scholr.pro"
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  support@scholr.pro
                </a>
              </li>
              <li>
                <Link 
                  to={createPageUrl('Contact')}
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Contact Form
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Connect</h4>
            <div className="flex gap-4">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    aria-label={link.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            © {currentYear} Scholr. All rights reserved. IB is a registered trademark of the International Baccalaureate Organization.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-slate-500 hover:text-slate-700">Privacy Policy</a>
            <a href="#" className="text-xs text-slate-500 hover:text-slate-700">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}