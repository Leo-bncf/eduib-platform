/**
 * Health check endpoint for deployment monitoring
 * Used by load balancers and monitoring systems to verify service health
 */

Deno.serve(async (req) => {
  try {
    // Only accept GET requests
    if (req.method !== 'GET') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    // Verify all critical systems are operational
    const checks = {
      service: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: typeof Deno !== 'undefined' ? 'operational' : 'unknown',
    };

    // Check environment configuration
    const requiredEnvVars = [
      'BASE44_APP_ID',
      'STRIPE_SECRET_KEY',
      'STRIPE_PUBLISHABLE_KEY',
    ];

    const envCheck = requiredEnvVars.every((envVar) => {
      return Deno.env.get(envVar) !== undefined;
    });

    checks.environment = envCheck ? 'configured' : 'misconfigured';
    checks.criticalEnvVars = requiredEnvVars.map((v) => ({
      name: v,
      present: !!Deno.env.get(v),
    }));

    // Determine overall status
    const isHealthy = checks.environment === 'configured';
    const statusCode = isHealthy ? 200 : 503;

    return Response.json(checks, { status: statusCode });
  } catch (error) {
    console.error('Health check error:', error);
    return Response.json(
      {
        service: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      { status: 503 }
    );
  }
});