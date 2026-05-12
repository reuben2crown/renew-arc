import * as Sentry from '@sentry/nextjs';
import posthog from 'posthog-js';

/**
 * Analytics Initialization Module
 * Sets up Sentry for error tracking and PostHog for product analytics.
 * Call this once in the app root layout or _app.tsx.
 */

interface AnalyticsConfig {
  sentryDsn: string;
  posthogApiKey: string;
  posthogHost: string;
  environment: string;
}

/**
 * Initializes both Sentry and PostHog with the provided configuration.
 */
export function initializeAnalytics(config: AnalyticsConfig) {
  // Initialize Sentry
  Sentry.init({
    dsn: config.sentryDsn,
    environment: config.environment,
    tracesSampleRate: config.environment === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: config.environment === 'production' ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    beforeSend(event, hint) {
      // Filter out known non-critical errors
      const error = hint.originalException as Error;
      if (error?.message?.includes('Network request failed')) {
        return null;
      }
      return event;
    },
  });

  // Initialize PostHog
  if (typeof window !== 'undefined') {
    posthog.init(config.posthogApiKey, {
      api_host: config.posthogHost,
      loaded: (posthog) => {
        if (config.environment === 'development') posthog.debug();
      },
      autocapture: true,
      capture_pageview: true,
      persistence: 'localStorage',
    });
  }
}

/**
 * Identifies a user in PostHog after they log in.
 * Should be called after successful authentication.
 */
export function identifyUser(userId: string, properties?: { email?: string; licenseType?: string }) {
  if (typeof window !== 'undefined') {
    posthog.identify(userId, properties);
  }
}

/**
 * Tracks a custom event in PostHog.
 */
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    posthog.capture(eventName, properties);
  }
}

/**
 * Records an error manually in Sentry.
 */
export function recordError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, { extra: context });
}

/**
 * Adds breadcrumbs to Sentry for better debugging context.
 */
export function addBreadcrumb(message: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({ message, data, level: 'info' });
}
