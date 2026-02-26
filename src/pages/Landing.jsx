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
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-200/20 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Purpose-built for IB World Schools
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08]">
            The all-in-one
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent"> IB platform</span>
            {' '}your school deserves
          </h1>
          
          <p className="mt-6 text-lg sm:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
            Manage grading, assignments, timetables, parent communication, and IB reporting — all in one unified, role-based platform designed for the IB framework.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
             <Button 
               size="lg" 
               className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 h-12 text-base shadow-lg shadow-indigo-200"
               onClick={handleSignIn}
             >
               Sign In <ArrowRight className="ml-2 w-4 h-4" />
             </Button>
             <Link to={createPageUrl('Demo')}>
               <Button size="lg" variant="outline" className="rounded-xl px-8 h-12 text-base border-slate-200">
                 Book a Demo
               </Button>
             </Link>
           </div>
        </div>
        
        <div className="mt-20 relative">
          <div className="bg-gradient-to-b from-indigo-600 to-indigo-800 rounded-2xl shadow-2xl shadow-indigo-200/50 overflow-hidden mx-auto max-w-5xl">
            <div className="flex items-center gap-1.5 px-4 py-3 bg-black/10">
              <div className="w-3 h-3 rounded-full bg-white/20" />
              <div className="w-3 h-3 rounded-full bg-white/20" />
              <div className="w-3 h-3 rounded-full bg-white/20" />
            </div>
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <div className="text-xs text-indigo-200 font-medium mb-1">Today's Classes</div>
                  <div className="text-3xl font-bold text-white">6</div>
                  <div className="mt-3 space-y-1.5">
                    <div className="h-2 bg-white/20 rounded-full w-full" />
                    <div className="h-2 bg-white/20 rounded-full w-3/4" />
                    <div className="h-2 bg-white/20 rounded-full w-1/2" />
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <div className="text-xs text-indigo-200 font-medium mb-1">Pending Grades</div>
                  <div className="text-3xl font-bold text-white">12</div>
                  <div className="mt-3 space-y-1.5">
                    <div className="h-2 bg-yellow-400/40 rounded-full w-4/5" />
                    <div className="h-2 bg-green-400/40 rounded-full w-full" />
                    <div className="h-2 bg-white/20 rounded-full w-2/3" />
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <div className="text-xs text-indigo-200 font-medium mb-1">Student Progress</div>
                  <div className="text-3xl font-bold text-white">94%</div>
                  <div className="mt-3 space-y-1.5">
                    <div className="h-2 bg-emerald-400/50 rounded-full w-full" />
                    <div className="h-2 bg-emerald-400/50 rounded-full w-[94%]" />
                    <div className="h-2 bg-white/20 rounded-full w-4/5" />
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
    { icon: BarChart3, title: 'Smart Dashboards', desc: 'Role-specific dashboards for students, teachers, coordinators, parents, and admins.' },
    { icon: ClipboardCheck, title: 'Assignment Workflows', desc: 'Create, distribute, collect, and grade assignments with IB criteria support.' },
    { icon: BookOpen, title: 'IB Gradebook', desc: '1-7 scale grading, predicted grades, SL/HL tracking, and term-based reporting.' },
    { icon: Users, title: 'Parent Portal', desc: 'Real-time visibility into grades, attendance, assignments, and teacher communications.' },
    { icon: Calendar, title: 'Timetable Integration', desc: 'Sync schedules, view daily agendas, and manage class periods.' },
    { icon: MessageSquare, title: 'Messaging', desc: 'Role-aware communication between teachers, students, parents, and staff.' },
    { icon: Shield, title: 'Multi-School Security', desc: 'Complete data isolation per school with strict role-based access control.' },
    { icon: Star, title: 'IB Core Modules', desc: 'Track CAS activities, Extended Essay milestones, and TOK tasks.' },
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Everything IB schools need</h2>
          <p className="mt-3 text-lg text-slate-500">Built from the ground up for the International Baccalaureate</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="group p-6 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50 transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center mb-4 transition-colors">
                <f.icon className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1.5">{f.title}</h3>
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
    { name: 'Students', color: 'bg-blue-500', desc: 'Personal dashboards, assignments, grades, timetables, and IB Core tracking.' },
    { name: 'Teachers', color: 'bg-emerald-500', desc: 'Class management, gradebook, submissions review, attendance, and analytics.' },
    { name: 'Parents', color: 'bg-violet-500', desc: 'Child progress monitoring, grades visibility, assignments, and messaging.' },
    { name: 'Coordinators', color: 'bg-amber-500', desc: 'Cohort oversight, predicted grades, reporting cycles, and IB Core supervision.' },
    { name: 'Administrators', color: 'bg-rose-500', desc: 'Full school management, users, classes, policies, and audit logs.' },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">One platform, every role</h2>
          <p className="mt-3 text-lg text-slate-500">Each user sees exactly what they need — nothing more</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {roles.map((r, i) => (
            <div key={i} className="relative p-6 bg-white rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
              <div className={`w-3 h-3 rounded-full ${r.color} mb-4`} />
              <h3 className="font-semibold text-slate-900 mb-2">{r.name}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to transform your IB school?</h2>
            <p className="text-lg text-indigo-100 mb-8 max-w-xl mx-auto">Join forward-thinking IB schools using AtlasIB to streamline teaching, grading, and communication.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl('Demo')}>
                <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl px-8 h-12 text-base font-semibold">
                  Book a Demo <ChevronRight className="ml-1 w-4 h-4" />
                </Button>
              </Link>
              <Link to={createPageUrl('Plans')}>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-xl px-8 h-12 text-base">
                  View Pricing
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