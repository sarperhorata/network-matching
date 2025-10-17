import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface LogContext {
  userId?: string;
  tenantId?: string;
  eventId?: string;
  requestId?: string;
  [key: string]: any;
}

/**
 * Custom Logger Service
 * Integrates with external logging services (Sentry, Datadog, etc.)
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  private context: string;

  constructor(context?: string) {
    this.context = context || 'Application';
  }

  /**
   * Log error with context
   */
  error(message: string, trace?: string, context?: LogContext) {
    const logData = this.formatLog(LogLevel.ERROR, message, context);
    console.error(logData, trace);

    // Send to external service (Sentry)
    this.sendToSentry('error', message, { trace, ...context });
  }

  /**
   * Log warning
   */
  warn(message: string, context?: LogContext) {
    const logData = this.formatLog(LogLevel.WARN, message, context);
    console.warn(logData);

    // Send to external service if needed
    if (process.env.NODE_ENV === 'production') {
      this.sendToSentry('warning', message, context);
    }
  }

  /**
   * Log info
   */
  log(message: string, context?: LogContext) {
    const logData = this.formatLog(LogLevel.INFO, message, context);
    console.log(logData);
  }

  /**
   * Log debug (only in development)
   */
  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV !== 'production') {
      const logData = this.formatLog(LogLevel.DEBUG, message, context);
      console.debug(logData);
    }
  }

  /**
   * Log verbose
   */
  verbose(message: string, context?: LogContext) {
    if (process.env.NODE_ENV !== 'production') {
      this.log(message, context);
    }
  }

  /**
   * Format log message
   */
  private formatLog(
    level: LogLevel,
    message: string,
    context?: LogContext,
  ): object {
    return {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      ...context,
      environment: process.env.NODE_ENV,
      pid: process.pid,
    };
  }

  /**
   * Send to Sentry (placeholder)
   * In production, integrate with @sentry/node
   */
  private sendToSentry(
    level: 'error' | 'warning' | 'info',
    message: string,
    context?: any,
  ) {
    // Sentry integration will go here
    // Example:
    // if (process.env.SENTRY_DSN) {
    //   Sentry.captureMessage(message, {
    //     level,
    //     extra: context,
    //   });
    // }
  }

  /**
   * Log HTTP request
   */
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    context?: LogContext,
  ) {
    this.log(`${method} ${url} ${statusCode} ${responseTime}ms`, context);
  }

  /**
   * Log database query
   */
  logQuery(query: string, params: any[], duration: number) {
    if (process.env.NODE_ENV !== 'production') {
      this.debug(`Query executed in ${duration}ms`, {
        query: query.substring(0, 200),
        params,
      });
    }
  }

  /**
   * Log user action for analytics
   */
  logUserAction(
    action: string,
    userId: string,
    metadata?: Record<string, any>,
  ) {
    this.log(`User action: ${action}`, {
      userId,
      action,
      ...metadata,
    });

    // Send to analytics service (PostHog, Mixpanel, etc.)
    this.sendToAnalytics(action, userId, metadata);
  }

  /**
   * Send to analytics service (placeholder)
   */
  private sendToAnalytics(
    event: string,
    userId: string,
    properties?: Record<string, any>,
  ) {
    // PostHog/Mixpanel integration will go here
    // Example:
    // posthog.capture({
    //   distinctId: userId,
    //   event,
    //   properties,
    // });
  }

  /**
   * Log performance metrics
   */
  logPerformance(
    operation: string,
    duration: number,
    metadata?: Record<string, any>,
  ) {
    if (duration > 1000) {
      // Log slow operations
      this.warn(`Slow operation: ${operation} took ${duration}ms`, metadata);
    } else {
      this.debug(`${operation} completed in ${duration}ms`, metadata);
    }
  }
}

