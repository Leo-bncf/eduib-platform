import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { schoolId } = await req.json();

    if (!schoolId) {
      return Response.json({ error: 'School ID required' }, { status: 400 });
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

    // Get school
    const schools = await base44.asServiceRole.entities.School.filter({ id: schoolId });
    if (schools.length === 0) {
      return Response.json({ error: 'School not found' }, { status: 404 });
    }
    const school = schools[0];

    if (!school.stripe_customer_id) {
      return Response.json({ error: 'No billing account found' }, { status: 404 });
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: school.stripe_customer_id,
      return_url: `${req.headers.get('origin')}/SchoolAdminBilling`,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Customer portal session error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});