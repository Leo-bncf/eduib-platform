import React from 'react';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    desc: 'For small IB schools getting started',
    price: '$4',
    per: 'per student / month',
    features: [
      'Up to 200 students',
      'Core dashboards (student, teacher, admin)',
      'Assignment workflows',
      'IB Gradebook (1-7 scale)',
      'Basic parent portal',
      'Email support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Professional',
    desc: 'For growing IB schools that need more',
    price: '$7',
    per: 'per student / month',
    features: [
      'Up to 1,000 students',
      'Everything in Starter',
      'IB Coordinator dashboard',
      'CAS, EE & TOK modules',
      'Predicted grades workflow',
      'Timetable integration',
      'Advanced messaging',
      'Attendance tracking',
      'Priority support',
    ],
    cta: 'Book a Demo',
    popular: true,
  },
  {
    name: 'Enterprise',
    desc: 'For large schools & school groups',
    price: 'Custom',
    per: 'tailored pricing',
    features: [
      'Unlimited students',
      'Everything in Professional',
      'Multi-campus support',
      'Custom integrations',
      'SSO / SAML authentication',
      'Dedicated account manager',
      'SLA guarantee',
      'On-boarding assistance',
      'Custom reporting',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      
      <section className="pt-32 pb-16 bg-gradient-to-b from-indigo-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            Pay per student, scale as you grow. No hidden fees, no surprise charges.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, i) => (
            <div key={i} className={`relative rounded-2xl border p-8 flex flex-col ${
              plan.popular 
                ? 'border-indigo-200 shadow-xl shadow-indigo-100/50 ring-1 ring-indigo-100' 
                : 'border-slate-200'
            }`}>
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-full">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{plan.desc}</p>
              </div>
              
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                <span className="text-sm text-slate-500 ml-2">{plan.per}</span>
              </div>
              
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-700">{f}</span>
                  </li>
                ))}
              </ul>
              
              <Link to={createPageUrl('Demo')}>
                <Button 
                  className={`w-full rounded-xl h-11 ${
                    plan.popular 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  {plan.cta} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}