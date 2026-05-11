/**
 * Dodo Payments Service Contract
 * 
 * Dodo Payments provides merchant-of-record functionality for SaaS businesses.
 * This service handles subscription management, checkout flows, and webhooks.
 * 
 * @see https://dodopayments.com/docs
 */

export interface DodoCheckoutSession {
  id: string;
  url: string;
  customer_id?: string;
  plan_id: string;
  status: 'pending' | 'completed' | 'cancelled' | 'expired';
  created_at: Date;
  expires_at: Date;
}

export interface DodoSubscription {
  id: string;
  customer_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  current_period_start: Date;
  current_period_end: Date;
  cancel_at_period_end: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface DodoCustomer {
  id: string;
  email: string;
  name?: string;
  metadata?: Record<string, string>;
  created_at: Date;
}

export interface DodoPlan {
  id: string;
  name: string;
  amount: number; // in cents
  currency: string;
  interval: 'month' | 'year';
  trial_period_days?: number;
  features: string[];
}

export interface DodoWebhookEvent {
  id: string;
  type: string;
  data: any;
  created_at: Date;
}

export interface CreateCheckoutSessionParams {
  userId: string;
  email: string;
  planId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface DodoPaymentProvider {
  /**
   * Create a checkout session for a customer
   */
  createCheckoutSession(params: CreateCheckoutSessionParams): Promise<DodoCheckoutSession>;

  /**
   * Retrieve an existing subscription
   */
  getSubscription(subscriptionId: string): Promise<DodoSubscription>;

  /**
   * Get customer's active subscription
   */
  getCustomerSubscription(customerId: string): Promise<DodoSubscription | null>;

  /**
   * Cancel a subscription at period end
   */
  cancelSubscription(subscriptionId: string): Promise<DodoSubscription>;

  /**
   * Create or retrieve a customer
   */
  getOrCreateCustomer(email: string, name?: string): Promise<DodoCustomer>;

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean;

  /**
   * Handle incoming webhook events
   */
  handleWebhook(event: DodoWebhookEvent): Promise<void>;
}

/**
 * Subscription plans for RenewPilot
 */
export const RENEW_PILOT_PLANS = {
  FREE: {
    id: 'plan_free',
    name: 'Free',
    amount: 0,
    currency: 'USD',
    interval: 'month' as const,
    features: [
      'Track 1 license',
      'Manual CE entry',
      'Email reminders',
      'Basic dashboard',
    ],
    limits: {
      maxLicenses: 1,
      maxCEUploadsPerMonth: 5,
      ocrEnabled: false,
      smsReminders: false,
      reports: false,
    },
  },
  PREMIUM: {
    id: 'plan_premium',
    name: 'Premium',
    amount: 900, // $9.00 in cents
    currency: 'USD',
    interval: 'month' as const,
    trial_period_days: 14,
    features: [
      'Unlimited licenses',
      'OCR certificate scanning',
      'Email + SMS reminders',
      'Advanced analytics',
      'PDF report exports',
      'Priority support',
    ],
    limits: {
      maxLicenses: -1, // unlimited
      maxCEUploadsPerMonth: -1, // unlimited
      ocrEnabled: true,
      smsReminders: true,
      reports: true,
    },
  },
  ANNUAL: {
    id: 'plan_annual',
    name: 'Premium Annual',
    amount: 9000, // $90.00/year (2 months free)
    currency: 'USD',
    interval: 'year' as const,
    trial_period_days: 14,
    features: [
      'Everything in Premium',
      '2 months free',
      'Annual compliance report',
      'Dedicated support',
    ],
    limits: {
      maxLicenses: -1,
      maxCEUploadsPerMonth: -1,
      ocrEnabled: true,
      smsReminders: true,
      reports: true,
    },
  },
} as const;

export type PlanType = keyof typeof RENEW_PILOT_PLANS;
