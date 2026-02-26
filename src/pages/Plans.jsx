import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 99,
    description: 'Perfect for small IB schools getting started',
    features: [
      'Up to 100 users',
      'Core IB features (TOK, EE, CAS)',
      'Assignment management',
      'Basic gradebook',
      'Email support',
      '14-day free trial',
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 299,
    description: 'For growing schools with advanced needs',
    features: [
      'Up to 500 users',
      'All Starter features',
      'Advanced analytics',
      'Parent portal',
      'Timetable integration',
      'Priority support',
      'Custom integrations',
      '14-day free trial',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 799,
    description: 'Full-featured solution for large institutions',
    features: [
      'Unlimited users',
      'All Professional features',
      'Multi-school management',
      'Advanced security & compliance',
      'Dedicated account manager',
      'Custom development',
      'SLA guarantees',
      '14-day free trial',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export default function Plans() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to={createPageUrl('Landing')} className="text-xl font-bold text-slate-900">
            Atlas<span className="text-indigo-600">IB</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Landing')}>
              <Button variant="ghost" size="sm">Home</Button>
            </Link>
            <Link to={createPageUrl('Features')}>
              <Button variant="ghost" size="sm">Features</Button>
            </Link>
            <Link to={createPageUrl('Demo')}>
              <Button className="bg-indigo-600 hover:bg-indigo-700" size="sm">Book Demo</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Start with a 14-day free trial. No credit card required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-8 bg-white ${
                plan.highlighted
                  ? 'border-indigo-500 shadow-xl scale-105'
                  : 'border-slate-200'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-indigo-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-slate-600 text-sm mb-6">{plan.description}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-slate-900">${plan.price}</span>
                  <span className="text-slate-600">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to={createPageUrl('Demo')}>
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'bg-slate-900 hover:bg-slate-800'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-600 mb-4">
            All plans include a 14-day free trial with full access to features
          </p>
          <p className="text-sm text-slate-500">
            Need a custom plan? <Link to={createPageUrl('Contact')} className="text-indigo-600 hover:underline">Contact our sales team</Link>
          </p>
        </div>
      </div>

      <footer className="border-t border-slate-200 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">© 2026 AtlasIB. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to={createPageUrl('Contact')} className="text-sm text-slate-500 hover:text-slate-900">Contact</Link>
              <Link to={createPageUrl('Security')} className="text-sm text-slate-500 hover:text-slate-900">Security</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}