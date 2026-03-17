import React, { useState } from 'react';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import AnimatedBackground from '@/components/public/AnimatedBackground';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    { text: 'Scattered data across spreadsheets, email, and disconnected tools' },
    { text: "Weak role-based access — teachers see data they shouldn't" },
    { text: 'Parents lack real-time visibility into their child\'s progress' },
    { text: 'Tedious manual workflows for assignments, grading, and reporting' },
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
              <div className="w-1 h-1 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
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
    { icon: BarChart3, title: 'Executive Dashboards', short: 'Role-specific insights', desc: 'Personalized dashboards for every stakeholder—students see academic progress, teachers manage their classes, coordinators oversee cohorts, parents track their children, and admins control the entire school. Each role receives contextual information tailored to their responsibilities, with quick actions and performance indicators prominently displayed.' },
    { icon: ClipboardCheck, title: 'Academic Workflows', short: 'Complete assignment lifecycle', desc: 'From creation to grading—publish assignments with IB criteria alignment, students submit work through Google Docs, files, or links, teachers provide criterion-based feedback, and grades sync automatically. Support for multiple submission formats, late submission handling, and comprehensive submission tracking ensure transparency throughout the entire workflow.' },
    { icon: BookOpen, title: 'IB Gradebook', short: '1-7 scale precision', desc: 'Native 1-7 IB grading scale, predicted grade tracking with historical trends, SL/HL subject level management, rubric-based criterion assessment, and comprehensive term reports that align with IB terminology. Generate assessment reports by criterion, track grade distribution patterns, and lock grades for compliance with school policies.' },
    { icon: Users, title: 'Parent Portal', short: 'Real-time family engagement', desc: 'Parents see grades, attendance records, upcoming assignments, teacher feedback, and behavioral notes—all updated in real-time with notification preferences. Direct messaging with teachers keeps communication secure, organized, and compliant with school policies. Parents can also receive progress alerts and attendance warnings.' },
    { icon: Calendar, title: 'Timetable Integration', short: 'Schedule synchronization', desc: 'Sync with external timetable systems like Veracross or iSAMS, display daily class schedules, manage periods and rooms, resolve scheduling conflicts automatically, and track historical schedule changes. Supports multiple concurrent timetables for different academic years and handles special events and exam schedules.' },
    { icon: MessageSquare, title: 'Internal Messaging', short: 'Secure communication hub', desc: 'Role-aware messaging between teachers, students, and parents with granular permission controls. Create class announcements, manage discussions, implement quiet hours policies, and maintain compliance logging for all communications. Thread-based conversations keep context clear and searchable.' },
    { icon: Shield, title: 'Enterprise Security', short: 'Data protection', desc: 'Complete multi-tenant isolation ensures schools cannot access each other\'s data. Granular role-based access control with customizable permissions, audit logging of all critical actions, GDPR compliance tools including data export and deletion, encrypted data storage at rest and in transit.' },
    { icon: Star, title: 'IB Core Modules', short: 'CAS, EE, TOK tracking', desc: 'Manage CAS experiences with strand mapping, supervisor tracking, and hourly reflection submissions. Track Extended Essay milestones from initial proposal through final viva voce with supervisor feedback integration. Manage TOK deadlines, student reflections, and coordinator approvals in one unified interface.' },
  ];

  return (
    <section className="py-24 bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900">Comprehensive Platform Capabilities</h2>
          <p className="mt-3 text-lg text-slate-500">Engineered for the rigorous demands of International Baccalaureate institutions</p>
        </div>
        <div className="space-y-3">
          {features.map((f, i) => (
            <motion.div key={i} layout className="bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
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
              <AnimatePresence>
                {expandedId === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="border-t border-slate-100 bg-slate-50/30 overflow-hidden"
                  >
                    <div className="px-6 py-4">
                      <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RolesSection() {
  const [expandedRole, setExpandedRole] = React.useState(null);
  const roles = [
    { 
      name: 'Students', 
      short: 'Learn and track progress',
      desc: 'Personal dashboards showing grades and upcoming work, submit assignments and view feedback, check daily timetable, track CAS, EE, and TOK progress.' 
    },
    { 
      name: 'Teachers', 
      short: 'Manage and assess',
      desc: 'Create and manage classes, publish assignments with IB criteria, grade submissions with rubrics, track attendance, view class analytics and performance trends.' 
    },
    { 
      name: 'Parents', 
      short: 'Stay informed',
      desc: 'Monitor child\'s grades and progress, see upcoming assignments and deadlines, view attendance records, message teachers directly, receive progress alerts.' 
    },
    { 
      name: 'Coordinators', 
      short: 'Oversee programmes',
      desc: 'Manage cohorts and predicted grades, oversee IB Core (TOK, EE, CAS), generate compliance reports, track subject registrations, manage exam entries.' 
    },
    { 
      name: 'Administrators', 
      short: 'Control everything',
      desc: 'Manage users and permissions, configure academic calendar and terms, set policies and workflows, view audit logs, manage billing and integrations.' 
    },
  ];

  return (
    <section className="py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900">Purpose-Built Roles</h2>
          <p className="mt-3 text-lg text-slate-500">Every user type has a tailored experience designed for their specific responsibilities.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {roles.map((r, i) => (
            <motion.div key={i} layout className="bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
              <button 
                onClick={() => setExpandedRole(expandedRole === i ? null : i)}
                className="w-full px-5 py-4 text-left hover:bg-slate-50/50 transition-colors"
              >
                <h3 className="font-bold text-slate-900">{r.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{r.short}</p>
              </button>
              <AnimatePresence>
                {expandedRole === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="border-t border-slate-100 bg-slate-50/30 overflow-hidden"
                  >
                    <div className="px-5 py-4">
                      <p className="text-sm text-slate-600 leading-relaxed">{r.desc}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const tiers = [
    { range: 'First 200 students', price: '€20.99', description: 'Per student' },
    { range: 'Students 201-600', price: '€16.99', description: 'Per student' },
    { range: '600+ students', price: '€13.99', description: 'Per student', bonus: 'Includes Schedual' },
  ];

  return (
    <section className="py-24 bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900">Simple, Transparent Pricing</h2>
          <p className="mt-3 text-lg text-slate-500">Scale your investment as your school grows</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {tiers.map((tier, i) => (
            <div key={i} className="bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm p-8 text-center hover:shadow-md transition-shadow">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{tier.range}</p>
              <div className="mt-4 mb-2">
                <span className="text-4xl font-bold text-slate-900">{tier.price}</span>
              </div>
              <p className="text-sm text-slate-600">{tier.description}</p>
              {tier.bonus && (
                <div className="mt-4 bg-blue-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-blue-700">{tier.bonus}</p>
                  <p className="text-xs text-blue-600 mt-1">Advanced scheduling and timetable management</p>
                  <p className="text-xs text-blue-600 mt-2">Contact our sales team for details</p>
                </div>
              )}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-500">Billed monthly • No setup fees</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <p className="text-slate-600 max-w-2xl mx-auto">
            Our tiered pricing model ensures you only pay for the students you have. Get volume discounts as your school scales with Scholr.
          </p>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const benefits = [
    { title: 'Lightning Fast', desc: 'Deploy in days, not months. Get up and running quickly.' },
    { title: 'Enterprise Grade', desc: 'Bank-level security with full GDPR compliance.' },
    { title: 'Dedicated Support', desc: 'Expert team available to help you succeed.' },
    { title: 'Always Improving', desc: 'Regular updates and new features based on school feedback.' },
  ];

  return (
    <section className="py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900">Why Choose Scholr?</h2>
          <p className="mt-3 text-lg text-slate-500">Built by educators, for educators.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {benefits.map((b, i) => (
            <div key={i} className="bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="w-3 h-3 rounded-full bg-blue-600 mb-4"></div>
              <h3 className="font-bold text-slate-900 mb-2">{b.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Ready to transform your school?</h3>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">See how Scholr can streamline your academic operations. Request a personalized demo or explore our flexible licensing plans.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl('Demo')}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-8 h-12 text-base font-medium shadow-sm border-none">
                Schedule Demo <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link to={createPageUrl('Plans')}>
              <Button size="lg" variant="outline" className="border-slate-300 text-slate-800 hover:bg-slate-50 rounded-lg px-8 h-12 text-base font-medium">
                View Pricing
              </Button>
            </Link>
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
        <FeaturesGrid />
        <RolesSection />
        <ProblemSection />
        <PricingSection />
        <CTASection />
        <PublicFooter />
      </div>
    </div>
  );
}