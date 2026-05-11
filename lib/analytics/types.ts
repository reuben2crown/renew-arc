/**
 * Analytics Service Contract
 * 
 * Provides unified interface for PostHog analytics and Sentry error tracking.
 * Tracks user behavior, conversions, and system performance.
 */

export interface AnalyticsEvent {
  event: string;
  userId?: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

export interface ErrorContext {
  message: string;
  level: 'fatal' | 'error' | 'warning' | 'info';
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  user?: {
    id: string;
    email?: string;
  };
}

export interface AnalyticsProvider {
  /**
   * Initialize analytics with user context
   */
  init(apiKey: string, options?: { host?: string }): void;

  /**
   * Identify a user
   */
  identify(userId: string, properties?: Record<string, any>): void;

  /**
   * Track a custom event
   */
  track(event: AnalyticsEvent): void;

  /**
   * Capture page view
   */
  capturePageView(path: string, title?: string): void;

  /**
   * Set user properties
   */
  setUserProperties(userId: string, properties: Record<string, any>): void;

  /**
   * Group analytics by organization/team
   */
  group(groupId: string, groupType: string, properties?: Record<string, any>): void;

  /**
   * Check if feature flag is enabled
   */
  isFeatureEnabled(flag: string, userId?: string): boolean;

  /**
   * Get all active feature flags
   */
  getFeatureFlags(): string[];

  /**
   * Reload feature flags
   */
  reloadFeatureFlags(): Promise<void>;
}

export interface ErrorTrackingProvider {
  /**
   * Initialize error tracking
   */
  init(dsn: string, options?: { environment?: string; release?: string }): void;

  /**
   * Capture an exception
   */
  captureException(error: Error, context?: ErrorContext): string;

  /**
   * Capture a message
   */
  captureMessage(message: string, level?: ErrorContext['level']): string;

  /**
   * Set user context for error tracking
   */
  setUser(user: NonNullable<ErrorContext['user']>): void;

  /**
   * Add breadcrumb (action that led to error)
   */
  addBreadcrumb(breadcrumb: {
    category: string;
    message: string;
    level?: ErrorContext['level'];
    data?: Record<string, any>;
  }): void;

  /**
   * Set tag for filtering errors
   */
  setTag(key: string, value: string): void;

  /**
   * Set additional context data
   */
  setContext(name: string, context: Record<string, any>): void;

  /**
   * Start a performance monitoring transaction
   */
  startTransaction(name: string, op: string): Transaction;
}

export interface Transaction {
  finish(): void;
  setTag(key: string, value: string): void;
  setData(key: string, value: any): void;
}

/**
 * Common events to track across the application
 */
export const ANALYTICS_EVENTS = {
  // Authentication
  USER_SIGNUP: 'user_signed_up',
  USER_LOGIN: 'user_logged_in',
  USER_LOGOUT: 'user_logged_out',
  
  // License Management
  LICENSE_CREATED: 'license_created',
  LICENSE_UPDATED: 'license_updated',
  LICENSE_DELETED: 'license_deleted',
  
  // CE Credits
  CE_UPLOADED: 'ce_certificate_uploaded',
  CE_PROCESSED: 'ce_processed',
  CE_MANUALLY_EDITED: 'ce_manually_edited',
  CE_DELETED: 'ce_deleted',
  
  // OCR
  OCR_SUCCESS: 'ocr_extraction_success',
  OCR_LOW_CONFIDENCE: 'ocr_low_confidence',
  OCR_FAILED: 'ocr_extraction_failed',
  
  // Notifications
  REMINDER_SENT: 'reminder_sent',
  NOTIFICATION_PREFERENCES_UPDATED: 'notification_preferences_updated',
  
  // Payments
  CHECKOUT_STARTED: 'checkout_started',
  CHECKOUT_COMPLETED: 'checkout_completed',
  CHECKOUT_CANCELLED: 'checkout_cancelled',
  SUBSCRIPTION_CREATED: 'subscription_created',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  SUBSCRIPTION_UPDATED: 'subscription_updated',
  
  // Reports
  REPORT_GENERATED: 'report_generated',
  REPORT_DOWNLOADED: 'report_downloaded',
  
  // Feedback
  FEEDBACK_SUBMITTED: 'feedback_submitted',
  NPS_SUBMITTED: 'nps_submitted',
  SUPPORT_TICKET_CREATED: 'support_ticket_created',
  
  // Errors
  ERROR_OCCURRED: 'error_occurred',
} as const;

export type AnalyticsEventType = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

/**
 * User properties to track
 */
export interface UserProperties {
  email?: string;
  plan?: string;
  licenseCount?: number;
  state?: string;
  profession?: string;
  createdAt?: Date;
  lastActiveAt?: Date;
}

/**
 * Feature flags for A/B testing and gradual rollouts
 */
export const FEATURE_FLAGS = {
  NEW_ONBOARDING_FLOW: 'new_onboarding_flow',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  BULK_CE_UPLOAD: 'bulk_ce_upload',
  TEAM_FEATURES: 'team_features',
  API_ACCESS: 'api_access',
} as const;

export type FeatureFlagType = typeof FEATURE_FLAGS[keyof typeof FEATURE_FLAGS];
