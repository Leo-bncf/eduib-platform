/**
 * Production Configuration Management
 * Centralizes all environment-specific configuration for deployment
 */

const ENVIRONMENTS = {
  development: 'development',
  staging: 'staging',
  production: 'production',
};

const NODE_ENV = Deno.env.get('NODE_ENV') || 'production';

/**
 * Get the current environment
 */
export const getEnvironment = () => NODE_ENV;

/**
 * Check if running in production
 */
export const isProduction = () => NODE_ENV === ENVIRONMENTS.production;

/**
 * Check if running in development
 */
export const isDevelopment = () => NODE_ENV === ENVIRONMENTS.development;

/**
 * Configuration by environment
 */
export const CONFIG = {
  app: {
    name: 'AtlasIB',
    version: '1.0.0',
    environment: NODE_ENV,
  },

  // API Configuration
  api: {
    // Rate limiting per endpoint (requests per minute)
    rateLimits: {
      auth: 5, // Login attempts
      payment: 10, // Payment operations
      general: 60, // General API calls
      admin: 30, // Admin operations
    },
    // Request timeout in milliseconds
    timeout: isProduction() ? 30000 : 60000,
    // Maximum request size
    maxBodySize: '10mb',
  },

  // Security Configuration
  security: {
    // HTTPS enforcement
    httpsRequired: isProduction(),
    // CORS settings
    corsOrigins: isProduction()
      ? ['https://yourdomain.com'] // Set to your production domain
      : ['http://localhost:3000', 'http://localhost:5173'],
    // Security headers
    securityHeaders: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': isProduction()
        ? "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
        : "default-src 'self' 'unsafe-inline'",
    },
    // Session configuration
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Database Configuration
  database: {
    // Connection pooling
    poolSize: isProduction() ? 20 : 5,
    // Query timeout
    queryTimeout: 30000,
    // Automatic retry on failure
    retryAttempts: isProduction() ? 3 : 1,
    retryDelayMs: 1000,
  },

  // Billing & Stripe Configuration
  billing: {
    // Stripe keys from environment
    stripeSecretKey: Deno.env.get('STRIPE_SECRET_KEY'),
    stripePublishableKey: Deno.env.get('STRIPE_PUBLISHABLE_KEY'),
    stripeWebhookSecret: Deno.env.get('STRIPE_WEBHOOK_SECRET'),
    // Currency
    defaultCurrency: 'usd',
    // Minimum payment amount in cents
    minimumPaymentAmount: 100, // $1.00
  },

  // Logging Configuration
  logging: {
    // Log level: 'debug', 'info', 'warn', 'error'
    level: isProduction() ? 'info' : 'debug',
    // Include request/response bodies in logs
    logBodies: !isProduction(),
    // Sensitive fields to redact in logs
    redactFields: [
      'password',
      'token',
      'apiKey',
      'stripeSecretKey',
      'creditCard',
      'ssn',
    ],
  },

  // Feature Flags
  features: {
    // Enable/disable features by environment
    paymentProcessing: true,
    multiTenant: true,
    auditLogging: true,
    advancedReporting: !isDevelopment(),
    experimentalFeatures: isDevelopment(),
  },

  // Monitoring & Observability
  monitoring: {
    // Error tracking (e.g., Sentry)
    errorTrackingEnabled: isProduction(),
    // Performance monitoring
    performanceMonitoringEnabled: isProduction(),
    // Slowness threshold in ms
    slowQueryThreshold: 1000,
    slowApiThreshold: 5000,
  },

  // Email Configuration
  email: {
    enabled: isProduction(),
    fromAddress: isProduction()
      ? 'noreply@atlasib.com'
      : 'dev@atlasib.local',
  },
};

/**
 * Validate required configuration
 * Throws error if critical configuration is missing
 */
export function validateConfiguration() {
  const errors = [];

  // Check required environment variables
  const requiredVars = [
    'BASE44_APP_ID',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ];

  requiredVars.forEach((varName) => {
    if (!Deno.env.get(varName)) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  });

  // Production-specific checks
  if (isProduction()) {
    if (!CONFIG.security.corsOrigins ||
      CONFIG.security.corsOrigins.length === 0) {
      errors.push(
        'CORS origins not configured for production. Set CORS_ORIGINS environment variable.'
      );
    }
  }

  if (errors.length > 0) {
    console.error('Configuration validation failed:');
    errors.forEach((error) => console.error(`  - ${error}`));
    throw new Error(
      `Configuration validation failed with ${errors.length} error(s)`
    );
  }

  console.info(`Configuration validated for ${NODE_ENV} environment`);
}

/**
 * Get feature flag status
 */
export function isFeatureEnabled(featureName) {
  return CONFIG.features[featureName] ?? false;
}

/**
 * Log configuration (with sensitive data redacted)
 */
export function logConfiguration() {
  const safeConfig = JSON.parse(JSON.stringify(CONFIG));

  // Redact sensitive information
  if (safeConfig.billing.stripeSecretKey) {
    safeConfig.billing.stripeSecretKey = '***REDACTED***';
  }
  if (safeConfig.billing.stripeWebhookSecret) {
    safeConfig.billing.stripeWebhookSecret = '***REDACTED***';
  }

  console.info('Application Configuration:', safeConfig);
}