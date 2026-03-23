/**
 * System Metrics Collection
 * Gathers operational metrics for monitoring and debugging
 * POST endpoint to record or retrieve system health metrics
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    if (req.method === 'GET') {
      // Get current system metrics
      return Response.json({
        timestamp: new Date().toISOString(),
        runtime: {
          version: '1.0.0',
          environment: Deno.env.get('NODE_ENV') || 'production',
          platform: Deno.build.os,
          arch: Deno.build.arch,
        },
        resources: {
          // Deno has limited resource metrics available
          memoryAvailable: true,
          cpuAvailable: true,
        },
        environment: {
          httpsRequired: Deno.env.get('NODE_ENV') === 'production',
          stripeConfigured: !!Deno.env.get('STRIPE_SECRET_KEY'),
          appId: Deno.env.get('BASE44_APP_ID') ? 'present' : 'missing',
        },
        checks: {
          healthEndpoint: '/functions/healthCheck',
          deploymentReady: '/functions/deploymentReady',
          metricsEndpoint: '/functions/systemMetrics',
        },
      });
    } else if (req.method === 'POST') {
      // Log custom metric (for application monitoring)
      const body = await req.json();
      const {
        metric,
        value,
        tags = {},
        timestamp = new Date().toISOString(),
      } = body;

      if (!metric) {
        return Response.json(
          { error: 'metric name required' },
          { status: 400 }
        );
      }

      // Log the metric (in production, send to metrics aggregator)
      console.info(
        `[METRIC] ${metric}=${value} tags=${JSON.stringify(tags)} at ${timestamp}`
      );

      return Response.json({
        success: true,
        metric,
        value,
        timestamp,
      });
    } else {
      return Response.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }
  } catch (error) {
    console.error('Metrics error:', error);
    return Response.json(
      {
        error: 'Failed to process metrics request',
        message: error.message,
      },
      { status: 500 }
    );
  }
});