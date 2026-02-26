import React from 'react';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import { createPageUrl } from '@/utils';
import { Mail, MapPin, Phone, MessageSquare } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      
      <section className="pt-32 pb-20 bg-gradient-to-b from-indigo-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">Get in touch</h1>
            <p className="mt-4 text-lg text-slate-500">Have questions? We'd love to hear from you.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Email</h3>
              <p className="text-sm text-slate-500">hello@atlasib.com</p>
              <p className="text-sm text-slate-500">support@atlasib.com</p>
            </div>

            <div className="text-center p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Phone</h3>
              <p className="text-sm text-slate-500">+1 (555) 123-4567</p>
              <p className="text-sm text-slate-500">Mon-Fri, 9am-6pm CET</p>
            </div>

            <div className="text-center p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Office</h3>
              <p className="text-sm text-slate-500">Geneva, Switzerland</p>
              <p className="text-sm text-slate-500">Serving IB schools worldwide</p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto mt-16">
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-8 sm:p-10 text-center">
              <MessageSquare className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">Looking for a demo?</h2>
              <p className="text-slate-500 mb-6">Visit our demo page to schedule a personalized walkthrough of AtlasIB for your school.</p>
              <a href={createPageUrl('Demo')} className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700">
                Book a Demo →
              </a>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}