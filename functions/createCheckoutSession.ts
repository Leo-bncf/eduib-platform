import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia',
});

// Per-student annual price IDs (EUR)
const PRICE_IDS = {
  starter:    'price_1TCqN7BCrwoLhJNy0ZUAckNW',  // €24/student/yr
  growth:     'price_1TCqN7BCrwoLhJNydURe3Oyz',  // €20/student/yr
  enterprise: 'price_1TCqN7BCrwoLhJNyELaRhBGI',  // €16/student/yr
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { schoolId, plan, studentCount } = await req.json();

    if (!schoolId || !plan) {
      return Response.json({ error: 'School ID and plan required' }, { status: 400 });
    }

    const quantity = parseInt(studentCount) || 50;
    if (quantity < 1) {
      return Response.json({ error: 'Student count must be at least 1' }, { status: 400 });
    }

    // Validate student count against plan limits
    const planLimits = { starter: 200, growth: 600, enterprise: Infinity };
    if (plan !== 'enterprise' && quantity > planLimits[plan]) {
      return Response.json({ error: `Student count exceeds ${plan} plan limit` }, { status: 400 });
    }

    // Verify user has access to this school
    if (user.role !== 'super_admin' && user.role !== 'admin') {
      const memberships = await base44.entities.SchoolMembership.filter({
        user_id: user.id,
        school_id: schoolId,
        status: 'active'
      });
      if (memberships.length === 0 || !['school_admin'].includes(memberships[0].role)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Get school details
    const schools = await base44.asServiceRole.entities.School.filter({ id: schoolId });
    if (schools.length === 0) {
      return Response.json({ error: 'School not found' }, { status: 404 });
    }
    const school = schools[0];

    // Get or create Stripe customer
    let customerId = school.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: school.billing_email || school.email,
        name: school.name,
        metadata: {
          school_id: schoolId,
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
        },
      });
      customerId = customer.id;
      await base44.asServiceRole.entities.School.update(schoolId, {
        stripe_customer_id: customerId,
      });
    }

    const priceId = PRICE_IDS[plan];
    if (!priceId) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      success_url: `${req.headers.get('origin')}/SchoolAdminBilling?success=true`,
      cancel_url: `${req.headers.get('origin')}/SchoolAdminBilling?canceled=true`,
      metadata: {
        school_id: schoolId,
        plan: plan,
        student_count: String(quantity),
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
      },
      subscription_data: {
        metadata: {
          school_id: schoolId,
          plan: plan,
          student_count: String(quantity),
        },
        trial_period_days: 14,
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session creation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});