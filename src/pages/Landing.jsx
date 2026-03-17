import React from 'react';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import AnimatedBackground from '@/components/public/AnimatedBackground';
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
      <div className="absolute inset-0 bg-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
           The LMS designed for
           <span className="text-blue-600"> the needs of</span>
           {' '}IB World Schools
          </h1>

          <p className="mt-6 text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
            A unified platform designed around the IB framework — from PYP to DP, grading to reporting.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
             <Button 
               size="lg" 
               className="bg-slate-900 hover:bg-slate-700 text-white rounded-full px-8 h-12 text-base font-medium shadow-sm transition-all"
               onClick={handleSignIn}
             >
               Sign In <ArrowRight className="ml-2 w-4 h-4" />
             </Button>
             <Link to={createPageUrl('Demo')}>
               <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base font-medium border-slate-300 hover:bg-slate-50 text-slate-800">
                 Contact Sales for a Free Demo
               </Button>
             </Link>
           </div>
        </div>
        
        <div className="mt-16 mx-auto max-w-3xl">
          <p className="text-lg text-slate-600 leading-relaxed text-center">
            <span className="font-semibold text-slate-900">IB-only</span> — built exclusively for IB World Schools with no generic features or bloat. <span className="font-semibold text-slate-900">PYP → DP</span> — every workflow maps directly to IB programmes, criteria, and terminology. <span className="font-semibold text-slate-900">Zero noise</span> — trimmed to exactly what IB educators and students need, nothing more.
          </p>
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
    <section className="py-20 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">IB schools deserve better tools</h2>
          <p className="mt-3 text-lg text-slate-500">Current platforms weren't built for the IB framework's unique demands</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {problems.map((p, i) => (
            <div key={i} className="flex items-start gap-4 p-5 bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
              <span className="text-2xl">{p.icon}</span>
              <p className="text-sm text-slate-600 leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesGrid() {
  const [expandedId, setExpandedId] = React.useState(null);
  const features = [
    { icon: BarChart3, title: 'Executive Dashboards', short: 'Role-specific insights', desc: 'Personalized dashboards for every stakeholder—students see academic progress, teachers manage their classes, coordinators oversee cohorts, parents track their children, and admins control the entire school.' },
    { icon: ClipboardCheck, title: 'Academic Workflows', short: 'Complete assignment lifecycle', desc: 'From creation to grading—publish assignments with IB criteria alignment, students submit work (Google Docs, files, links), teachers provide criterion-based feedback, and grades sync automatically.' },
    { icon: BookOpen, title: 'IB Gradebook', short: '1-7 scale precision', desc: 'Native 1-7 grading, predicted grade tracking, SL/HL subject management, rubric-based assessment, and comprehensive term reports that align with IB terminology and workflows.' },
    { icon: Users, title: 'Parent Portal', short: 'Real-time family engagement', desc: 'Parents see grades, attendance, upcoming assignments, and teacher feedback—all updated in real-time. Direct messaging with teachers keeps communication secure and organized.' },
    { icon: Calendar, title: 'Timetable Integration', short: 'Schedule synchronization', desc: 'Sync with external timetable systems, display daily class schedules, manage periods and rooms, resolve conflicts, and track historical schedule changes.' },
    { icon: MessageSquare, title: 'Internal Messaging', short: 'Secure communication hub', desc: 'Role-aware messaging between teachers, students, and parents. Announcements, class discussions, quiet hours policies, and compliance logging all built-in.' },
    { icon: Shield, title: 'Enterprise Security', short: 'Data protection', desc: 'Complete multi-tenant isolation, granular role-based access control, audit logging of all critical actions, GDPR compliance tools, and encrypted data storage.' },
    { icon: Star, title: 'IB Core Modules', short: 'CAS, EE, TOK tracking', desc: 'Manage CAS experiences with strand mapping, track Extended Essay milestones from proposal to viva, manage TOK deadlines, and generate IB-compliant reports.' },
  ];

  return (
    <section className="py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900">Comprehensive Platform Capabilities</h2>
          <p className="mt-3 text-lg text-slate-500">Engineered for the rigorous demands of International Baccalaureate institutions</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <div key={i} className="bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
              <button 
                onClick={() => setExpandedId(expandedId === i ? null : i)}
                className="w-full px-6 py-4 flex items-start gap-4 text-left hover:bg-slate-50/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-100">
                  <f.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">{f.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{f.short}</p>
                </div>
                <ChevronRight className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-300 ${expandedId === i ? 'rotate-90' : ''}`} />
              </button>
              {expandedId === i && (
                <div className="px-6 pb-4 border-t border-slate-100 bg-slate-50/30">
                  <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              )}
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
    <section className="py-24 bg-transparent border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900">Unified Access Control</h2>
          <p className="mt-3 text-lg text-slate-500">Secure, role-based interfaces ensuring data privacy and operational efficiency.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {roles.map((r, i) => (
            <div key={i} className="relative p-6 bg-white/70 backdrop-blur-sm border-t-2 border-t-blue-500 shadow-sm rounded-b-md border-x border-b border-slate-200">
              <h3 className="font-bold text-slate-900 mb-3">{r.name}</h3>
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
    <section className="py-24 bg-transparent">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 rounded-2xl p-12 sm:p-16 text-center relative overflow-hidden border border-slate-200">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to modernize your institution?</h2>
            <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto">Deploy a robust, professional platform that scales with your academic operations.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl('Demo')}>
                <Button size="lg" className="bg-slate-900 hover:bg-slate-700 text-white rounded-full px-8 h-12 text-base font-medium shadow-sm transition-all border-none">
                  Request Demonstration <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to={createPageUrl('Plans')}>
                <Button size="lg" variant="outline" className="border-slate-300 text-slate-800 hover:bg-slate-50 rounded-full px-8 h-12 text-base font-medium">
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
    <div className="min-h-screen bg-transparent">
      <AnimatedBackground />
      <div className="fixed top-0 left-0 right-0 z-50">
        <PublicNavbar />
      </div>
      <div className="relative z-10">
        <HeroSection />
        <ProblemSection />
        <FeaturesGrid />
        <RolesSection />
        <CTASection />
        <PublicFooter />
      </div>
    </div>
  );
}