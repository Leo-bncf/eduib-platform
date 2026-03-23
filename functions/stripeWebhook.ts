import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia',
});

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    // Verify webhook signature
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')
    );

    console.log('Webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const schoolId = session.metadata?.school_id;
        const plan = session.metadata?.plan;
        const studentCount = parseInt(session.metadata?.student_count) || null;

        if (schoolId && session.subscription) {
          const updatePayload = {
            stripe_subscription_id: session.subscription,
            plan: plan,
            billing_status: 'trial',
          };
          if (studentCount) updatePayload.max_students = studentCount;
          await base44.asServiceRole.entities.School.update(schoolId, updatePayload);
          console.log(`Subscription created for school ${schoolId}, plan ${plan}, students ${studentCount}`);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const schoolId = subscription.metadata?.school_id;

        if (schoolId) {
          const updateData = {
            stripe_subscription_id: subscription.id,
            billing_status: subscription.status,
            subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            subscription_cancel_at_period_end: subscription.cancel_at_period_end,
          };

          if (subscription.trial_end) {
            updateData.trial_end_date = new Date(subscription.trial_end * 1000).toISOString();
          }

          await base44.asServiceRole.entities.School.update(schoolId, updateData);
          console.log(`Subscription updated for school ${schoolId}: ${subscription.status}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const schoolId = subscription.metadata?.school_id;

        if (schoolId) {
          await base44.asServiceRole.entities.School.update(schoolId, {
            billing_status: 'canceled',
            status: 'suspended',
          });
          console.log(`Subscription canceled for school ${schoolId}`);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        const subscription = invoice.subscription;

        if (subscription) {
          const sub = await stripe.subscriptions.retrieve(subscription);
          const schoolId = sub.metadata?.school_id;

          if (schoolId) {
            await base44.asServiceRole.entities.School.update(schoolId, {
              billing_status: 'active',
              status: 'active',
            });
            console.log(`Invoice paid for school ${schoolId}`);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscription = invoice.subscription;

        if (subscription) {
          const sub = await stripe.subscriptions.retrieve(subscription);
          const schoolId = sub.metadata?.school_id;

          if (schoolId) {
            await base44.asServiceRole.entities.School.update(schoolId, {
              billing_status: 'past_due',
              status: 'suspended',
            });
            console.log(`Payment failed for school ${schoolId}`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
});