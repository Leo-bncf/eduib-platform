/**
 * Production Environment Manager
 * Handles environment detection, configuration validation, and environment-specific behavior
 * This is the source of truth for production vs development environments
 */

/**
 * Environment Detection
 * Determines the actual runtime environment based on multiple signals
 */
export function detectEnvironment() {
  const nodeEnv = Deno.env.get('NODE_ENV') || 'development';
  const appId = Deno.env.get('BASE44_APP_ID') || '';
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';

  // Production indicators
  const isProduction =
    nodeEnv === 'production' &&
    appId &&
    stripeSecretKey &&
    !stripeSecretKey.includes('sk_test');

  // Staging indicators
  const isStaging = nodeEnv === 'staging';

  // Development by default
  const isDevelopment = !isProduction && !isStaging;

  return {
    nodeEnv,
    isProduction,
    isStaging,
    isDevelopment,
    environment: isProduction
      ? 'production'
      : isStaging
      ? 'staging'
      : 'development',
  };
}

/**
 * Production Configuration
 * Environment-specific settings and constraints
 */
export const PRODUCTION_CONFIG = {
  // Environment detection
  get environment() {
    return detectEnvironment().environment;
  },

  get isProduction() {
    return detectEnvironment().isProduction;
  },

  // Stripe configuration
  stripe: {
    get mode() {
      const key = Deno.env.get('STRIPE_SECRET_KEY') || '';
      return key.includes('sk_test') ? 'test' : 'live';
    },
    get isLiveMode() {
      return this.mode === 'live';
    },
  },

  // Data handling
  data: {
    // Allow demo data only in development
    allowDemoData: detectEnvironment().isDevelopment,
    // Require backup before operations in production
    requireBackupBefore: detectEnvironment().isProduction,
    // Enable data retention policies in production
    enableRetentionPolicies: detectEnvironment().isProduction,
  },

  // Operational constraints
  operations: {
    // Require approval for sensitive operations in production
    requireApprovalFor: detectEnvironment().isProduction
      ? [
        'delete_school',
        'delete_user',
        'modify_billing',
        'export_data',
      ]
      : [],
    // Enable audit logging in production
    auditLogAll: detectEnvironment().isProduction,
    // Email notifications enabled in production
    sendNotifications: detectEnvironment().isProduction,
  },

  // API behavior
  api: {
    // Rate limiting stricter in production
    rateLimitMultiplier: detectEnvironment().isProduction ? 1 : 10,
    // Timeout stricter in production
    timeoutMs: detectEnvironment().isProduction ? 30000 : 60000,
    // Detailed error messages only in development
    verboseErrors: detectEnvironment().isDevelopment,
  },

  // Security
  security: {
    // Enforce HTTPS in production
    httpsRequired: detectEnvironment().isProduction,
    // Stricter CORS in production
    corsOrigins: detectEnvironment().isProduction
      ? (Deno.env.get('CORS_ORIGINS') || 'https://yourdomain.com').split(',')
      : ['http://localhost:3000', 'http://localhost:5173', '*'],
  },
};

/**
 * Validate production readiness
 * Returns validation result with detailed checks
 */
export function validateProductionReadiness() {
  const env = detectEnvironment();
  const results = {
    isProduction: env.isProduction,
    checks: {},
    warnings: [],
    errors: [],
    canDeploy: true,
  };

  // Check 1: Environment variables
  const requiredVars = [
    'BASE44_APP_ID',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_PUBLISHABLE_KEY',
  ];

  results.checks.environmentVariables = {
    pass: requiredVars.every((v) => !!Deno.env.get(v)),
    missing: requiredVars.filter((v) => !Deno.env.get(v)),
  };

  if (!results.checks.environmentVariables.pass) {
    results.errors.push(
      `Missing environment variables: ${results.checks.environmentVariables.missing.join(
        ', '
      )}`
    );
    results.canDeploy = false;
  }

  // Check 2: Stripe mode
  if (env.isProduction) {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
    const isLiveMode = !stripeKey.includes('sk_test');

    results.checks.stripeLiveMode = {
      pass: isLiveMode,
      mode: isLiveMode ? 'live' : 'test',
    };

    if (!isLiveMode) {
      results.warnings.push(
        'Stripe is in test mode. For production, use live API keys.'
      );
    }
  }

  // Check 3: NODE_ENV
  results.checks.nodeEnv = {
    pass: env.nodeEnv === 'production',
    value: env.nodeEnv,
  };

  if (!env.isProduction && env.nodeEnv !== 'production') {
    results.warnings.push(`NODE_ENV is "${env.nodeEnv}", not "production"`);
  }

  // Check 4: CORS configuration
  if (env.isProduction) {
    const corsOrigins = Deno.env.get('CORS_ORIGINS') || '';
    results.checks.cors = {
      pass: !!corsOrigins,
      configured: !!corsOrigins,
    };

    if (!corsOrigins) {
      results.errors.push(
        'CORS_ORIGINS not configured for production. Set CORS_ORIGINS environment variable.'
      );
      results.canDeploy = false;
    }
  }

  return results;
}

/**
 * Log environment configuration (with sensitive data redacted)
 */
export function logEnvironmentConfig() {
  const env = detectEnvironment();
  const stripe = PRODUCTION_CONFIG.stripe;

  console.info('='.repeat(60));
  console.info('ENVIRONMENT CONFIGURATION');
  console.info('='.repeat(60));
  console.info(`Environment: ${env.environment.toUpperCase()}`);
  console.info(`NODE_ENV: ${env.nodeEnv}`);
  console.info(`Stripe Mode: ${stripe.mode.toUpperCase()}`);
  console.info(`App ID: ${Deno.env.get('BASE44_APP_ID') ? '✓ Set' : '✗ Missing'}`);
  console.info(`HTTPS Required: ${PRODUCTION_CONFIG.security.httpsRequired}`);
  console.info(`CORS Origins: ${PRODUCTION_CONFIG.security.corsOrigins.join(', ')}`);
  console.info('='.repeat(60));

  // Validate and report
  const validation = validateProductionReadiness();
  if (!validation.canDeploy) {
    console.error('❌ DEPLOYMENT BLOCKED - Fix errors before deploying');
    validation.errors.forEach((e) => console.error(`  - ${e}`));
  } else if (validation.warnings.length > 0) {
    console.warn('⚠️  WARNINGS:');
    validation.warnings.forEach((w) => console.warn(`  - ${w}`));
  } else {
    console.info('✅ All production checks passing');
  }
}