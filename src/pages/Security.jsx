import React from 'react';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import { Shield, Lock, Users, Eye, Database, FileCheck, Server, Key } from 'lucide-react';

const features = [
  { icon: Database, title: 'Multi-Tenant Isolation', desc: 'Each school\'s data is strictly separated using school-level scoping. No data crosses school boundaries.' },
  { icon: Lock, title: 'Role-Based Access Control', desc: 'Six distinct roles with precise permissions. Users only see and access what their role allows.' },
  { icon: Eye, title: 'Visibility Controls', desc: 'Schools configure what parents and students can see. Grades, attendance, and notes are governed by school policies.' },
  { icon: Users, title: 'Relationship-Based Access', desc: 'Parents only see their linked children. Teachers only access their assigned classes. Students see only their own data.' },
  { icon: Key, title: 'Secure Authentication', desc: 'Session-based authentication with automatic role resolution. No role spoofing or privilege escalation.' },
  { icon: FileCheck, title: 'Complete Audit Trail', desc: 'Every sensitive action is logged: account creation, role changes, grade modifications, and policy updates.' },
  { icon: Server, title: 'Data Encryption', desc: 'Data encrypted in transit and at rest. All communications use TLS. No plaintext sensitive data storage.' },
  { icon: Shield, title: 'Enforced at Every Layer', desc: 'Security isn\'t just in the UI. It\'s enforced in the API, the database queries, and the business logic.' },
];

export default function Security() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      
      <section className="pt-32 pb-16 bg-gradient-to-b from-indigo-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Security by design
          </h1>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            AtlasIB is built with security at its core. Data isolation, role enforcement, and audit logging are not add-ons — they're foundational.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="p-6 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-slate-700" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">How data isolation works</h2>
          <div className="space-y-4">
            {[
              { step: '1', title: 'School-Scoped Data', desc: 'Every record (class, grade, message, etc.) carries a school_id. Queries always filter by school.' },
              { step: '2', title: 'Role Resolution at Login', desc: 'When a user logs in, the system resolves their school, role, and permissions before any data is shown.' },
              { step: '3', title: 'API-Level Enforcement', desc: 'Every API request validates the user\'s role and school membership before returning data.' },
              { step: '4', title: 'Audit Everything', desc: 'Sensitive operations are logged with the acting user, timestamp, and change details.' },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-5 p-5 bg-white rounded-xl border border-slate-100">
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {s.step}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{s.title}</h4>
                  <p className="text-sm text-slate-500 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}