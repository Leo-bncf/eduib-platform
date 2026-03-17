import React from 'react';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, BookOpen, Users, BarChart3, Shield, 
  MessageSquare, Calendar, ClipboardCheck, Star,
  ChevronRight, Sparkles
} from 'lucide-react';

function HeroSection() {
  const navigate = useNavigate();

  const handleSignIn = async () => {
    const isAuthed = await base44.auth.isAuthenticated();
    if (isAuthed) {
      navigate(createPageUrl('AppHome'));
    } else {
      base44.auth.redirectToLogin(createPageUrl('AppHome'));
    }
  };

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
            The complete
            <span className="text-blue-600"> operating system</span>
            {' '}for IB World Schools
          </h1>
          
          <p className="mt-6 text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
            A unified, professional platform for managing the entire IB lifecycle. From admissions to alumni, grading to reporting.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
             <Button 
               size="lg" 
               className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-8 h-12 text-base font-medium shadow-sm transition-all"
               onClick={handleSignIn}
             >
               Sign In <ArrowRight className="ml-2 w-4 h-4" />
             </Button>
             <Link to={createPageUrl('Demo')}>
               <Button size="lg" variant="outline" className="rounded-md px-8 h-12 text-base font-medium border-slate-200 hover:bg-slate-50 text-slate-700">
                 Contact Sales for a Free Demo
               </Button>
             </Link>
           </div>
        </div>
        
        <div className="mt-20 relative">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden mx-auto max-w-5xl">
            <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-50 border-b border-slate-200">
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <div className="w-3 h-3 rounded-full bg-slate-300" />
            </div>
            <div className="p-8">
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-5 border border-slate-100 shadow-sm">
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Active Students</div>
                  <div className="text-3xl font-bold text-slate-900">1,248</div>
                  <div className="mt-4 space-y-2">
                    <div className="h-1.5 bg-slate-100 rounded-full w-full" />
                    <div className="h-1.5 bg-slate-100 rounded-full w-3/4" />
                  </div>
                </div>
                <div className="bg-white rounded-lg p-5 border border-slate-100 shadow-sm">
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Pending Reports</div>
                  <div className="text-3xl font-bold text-slate-900">42</div>
                  <div className="mt-4 space-y-2">
                     <div className="h-1.5 bg-blue-500 rounded-full w-1/2" />
                     <div className="h-1.5 bg-slate-100 rounded-full w-full" />
                  </div>
                </div>
                <div className="bg-white rounded-lg p-5 border border-slate-100 shadow-sm">
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Attendance Rate</div>
                  <div className="text-3xl font-bold text-slate-900">98.2%</div>
                  <div className="mt-4 space-y-2">
                    <div className="h-1.5 bg-emerald-500 rounded-full w-[98%]" />
                    <div className="h-1.5 bg-slate-100 rounded-full w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  const problems = [
    { icon: '📊', text: 'Scattered data across spreadsheets, email, and disconnected tools' },
    { icon: '🔓', text: "Weak role-based access — teachers see data they shouldn't" },
    { icon: '😤', text: 'Parents lack real-time visibility into their child\'s progress' },
    { icon: '⏳', text: 'Tedious manual workflows for assignments, grading, and reporting' },
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">IB schools deserve better tools</h2>
          <p className="mt-3 text-lg text-slate-500">Current platforms weren't built for the IB framework's unique demands</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {problems.map((p, i) => (
            <div key={i} className="flex items-start gap-4 p-5 bg-white rounded-xl border border-slate-100">
              <span className="text-2xl">{p.icon}</span>
              <p className="text-sm text-slate-700 leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesGrid() {
  const features = [
    { icon: BarChart3, title: 'Executive Dashboards', desc: 'Role-specific dashboards for students, teachers, coordinators, parents, and admins.' },
    { icon: ClipboardCheck, title: 'Academic Workflows', desc: 'Create, distribute, collect, and grade assignments with IB criteria support.' },
    { icon: BookOpen, title: 'IB Gradebook', desc: '1-7 scale grading, predicted grades, SL/HL tracking, and term-based reporting.' },
    { icon: Users, title: 'Parent Portal', desc: 'Real-time visibility into grades, attendance, assignments, and teacher communications.' },
    { icon: Calendar, title: 'Timetable Integration', desc: 'Sync schedules, view daily agendas, and manage class periods.' },
    { icon: MessageSquare, title: 'Internal Messaging', desc: 'Role-aware communication between teachers, students, parents, and staff.' },
    { icon: Shield, title: 'Enterprise Security', desc: 'Complete data isolation per school with strict role-based access control.' },
    { icon: Star, title: 'IB Core Modules', desc: 'Track CAS activities, Extended Essay milestones, and TOK tasks.' },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900">Comprehensive Platform Capabilities</h2>
          <p className="mt-3 text-lg text-slate-500">Engineered for the rigorous demands of International Baccalaureate institutions</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {features.map((f, i) => (
            <div key={i} className="group">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors duration-300">
                <f.icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RolesSection() {
  const roles = [
    { name: 'Students', desc: 'Personal dashboards, assignments, grades, timetables, and IB Core tracking.' },
    { name: 'Teachers', desc: 'Class management, gradebook, submissions review, attendance, and analytics.' },
    { name: 'Parents', desc: 'Child progress monitoring, grades visibility, assignments, and messaging.' },
    { name: 'Coordinators', desc: 'Cohort oversight, predicted grades, reporting cycles, and IB Core supervision.' },
    { name: 'Administrators', desc: 'Full school management, users, classes, policies, and audit logs.' },
  ];

  return (
    <section className="py-24 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900">Unified Access Control</h2>
          <p className="mt-3 text-lg text-slate-500">Secure, role-based interfaces ensuring data privacy and operational efficiency.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {roles.map((r, i) => (
            <div key={i} className="relative p-6 bg-white border-t-2 border-t-blue-600 shadow-sm rounded-b-md">
              <h3 className="font-bold text-slate-900 mb-3">{r.name}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-xl p-12 sm:p-16 text-center relative overflow-hidden shadow-sm border border-slate-200">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to modernize your institution?</h2>
            <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">Deploy a robust, professional platform that scales with your academic operations.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl('Demo')}>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-8 h-12 text-base font-medium shadow-sm transition-all border-none">
                  Request Demonstration <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to={createPageUrl('Plans')}>
                <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-white rounded-md px-8 h-12 text-base font-medium">
                  View Licensing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <HeroSection />
      <ProblemSection />
      <FeaturesGrid />
      <RolesSection />
      <CTASection />
      <PublicFooter />
    </div>
  );
}