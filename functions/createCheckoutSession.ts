import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia',
});

const PRICE_IDS = {
  starter: 'price_1T57DeBCrwoLhJNyWKJ8UGjO',
  professional: 'price_1T57DeBCrwoLhJNy1oR4SAgL',
  enterprise: 'price_1T57DeBCrwoLhJNyaIhnHSbE',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { schoolId, plan } = await req.json();

    if (!schoolId || !plan) {
      return Response.json({ error: 'School ID and plan required' }, { status: 400 });
    }

    // Verify user has access to this school (school_admin or super_admin)
    if (user.role !== 'super_admin') {
      const memberships = await base44.entities.SchoolMembership.filter({
        user_id: user.id,
        school_id: schoolId,
        status: 'active'
      });
      
      if (memberships.length === 0 || !['school_admin', 'admin'].includes(memberships[0].role)) {
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

      // Update school with customer ID
      await base44.asServiceRole.entities.School.update(schoolId, {
        stripe_customer_id: customerId,
      });
    }

    const priceId = PRICE_IDS[plan];
    if (!priceId) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get('origin')}/SchoolAdminBilling?success=true`,
      cancel_url: `${req.headers.get('origin')}/SchoolAdminBilling?canceled=true`,
      metadata: {
        school_id: schoolId,
        plan: plan,
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
      },
      subscription_data: {
        metadata: {
          school_id: schoolId,
          plan: plan,
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