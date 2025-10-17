/**
 * Sentry Error Tracking Configuration
 * 
 * Setup Instructions:
 * 1. Create account at sentry.io
 * 2. Create new project (Node.js/NestJS)
 * 3. Copy DSN to .env file: SENTRY_DSN=https://xxx@sentry.io/xxx
 * 4. Install: npm install @sentry/node @sentry/profiling-node
 * 5. Uncomment integration code below
 */

// Uncomment when ready to use Sentry
// import * as Sentry from '@sentry/node';
// import { ProfilingIntegration } from '@sentry/profiling-node';

export function initializeSentry() {
  const sentryDsn = process.env.SENTRY_DSN;

  if (!sentryDsn) {
    console.log('Sentry DSN not configured. Skipping Sentry initialization.');
    return;
  }

  console.log('Initializing Sentry error tracking...');

  // Uncomment when @sentry/node is installed
  /*
  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.NODE_ENV || 'development',
    
    // Set sample rate for production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      new ProfilingIntegration(),
    ],
    
    // Release tracking
    release: process.env.npm_package_version || '1.0.0',
    
    // Filter sensitive data
    beforeSend(event, hint) {
      // Remove sensitive data from error reports
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
      
      return event;
    },
    
    // Ignore specific errors
    ignoreErrors: [
      'Non-Error exception captured',
      'Network request failed',
      'cancelled',
    ],
  });
  
  console.log('Sentry initialized successfully');
  */
}

/**
 * Sentry error handler middleware
 */
export function sentryErrorHandler() {
  // Uncomment when ready
  /*
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Only report 500 errors
      return error.status >= 500;
    },
  });
  */
  return (err: any, req: any, res: any, next: any) => {
    console.error('Error caught:', err);
    next(err);
  };
}

/**
 * Capture exception manually
 */
export function captureException(error: Error, context?: Record<string, any>) {
  console.error('Exception captured:', error, context);
  
  // Uncomment when ready
  /*
  Sentry.captureException(error, {
    extra: context,
  });
  */
}

/**
 * Capture message
 */
export function captureMessage(
  message: string,
  level: 'error' | 'warning' | 'info' = 'info',
  context?: Record<string, any>,
) {
  console.log(`[${level.toUpperCase()}] ${message}`, context);
  
  // Uncomment when ready
  /*
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
  */
}

/**
 * Set user context
 */
export function setUserContext(user: { id: string; email?: string; role?: string }) {
  // Uncomment when ready
  /*
  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role,
  });
  */
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext() {
  // Uncomment when ready
  /*
  Sentry.setUser(null);
  */
}

