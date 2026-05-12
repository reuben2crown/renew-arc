import { DodoCheckoutRequest, DodoWebhookEvent, PaymentStatus } from './dodo-types';

/**
 * Dodo Payments Provider Implementation
 * Handles checkout session creation and webhook verification for RenewPilot.
 * Dodo acts as the Merchant of Record, handling global taxes and compliance.
 */
export class DodoPaymentsProvider {
  private apiKey: string;
  private webhookSecret: string;
  private baseUrl = 'https://api.dodopayments.com'; // Placeholder URL

  constructor(apiKey: string, webhookSecret: string) {
    this.apiKey = apiKey;
    this.webhookSecret = webhookSecret;
  }

  /**
   * Creates a checkout session for a user to purchase a subscription or one-time credit.
   * @param request - Checkout details including user email, price ID, and success/cancel URLs.
   * @returns The checkout URL to redirect the user to.
   */
  async createCheckoutSession(request: DodoCheckoutRequest): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_email: request.customerEmail,
          items: [{ price_id: request.priceId, quantity: 1 }],
          success_url: request.successUrl,
          cancel_url: request.cancelUrl,
          metadata: {
            userId: request.userId,
            licenseType: request.licenseType,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Dodo API Error: ${error.message}`);
      }

      const data = await response.json();
      return data.checkout_url;
    } catch (error) {
      console.error('Failed to create Dodo checkout session:', error);
      throw error;
    }
  }

  /**
   * Verifies the signature of incoming webhooks from Dodo to ensure authenticity.
   * @param payload - The raw body of the webhook request.
   * @param signature - The signature header sent by Dodo.
   * @returns True if the signature is valid, false otherwise.
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    // Implementation depends on Dodo's specific signing algorithm (e.g., HMAC-SHA256)
    // This is a placeholder for the actual crypto logic
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Processes a verified webhook event to update local database state.
   * @param event - The parsed webhook event data.
   * @returns A promise resolving when the database update is complete.
   */
  async processWebhookEvent(event: DodoWebhookEvent): Promise<void> {
    const { type, data } = event;

    switch (type) {
      case 'checkout.completed':
        await this.handlePaymentSuccess(data);
        break;
      case 'subscription.updated':
        await this.handleSubscriptionUpdate(data);
        break;
      case 'payment.failed':
        await this.handlePaymentFailure(data);
        break;
      default:
        console.log(`Unhandled webhook event type: ${type}`);
    }
  }

  private async handlePaymentSuccess(data: any): Promise<void> {
    // TODO: Integrate with Supabase client to update user's subscription status
    console.log(`Payment successful for user: ${data.metadata?.userId}`);
    // Logic: Update 'profiles' table -> set is_premium = true, subscription_id = data.id
  }

  private async handleSubscriptionUpdate(data: any): Promise<void> {
    console.log(`Subscription updated: ${data.id}`);
    // Logic: Update renewal dates, plan changes
  }

  private async handlePaymentFailure(data: any): Promise<void> {
    console.error(`Payment failed for user: ${data.metadata?.userId}`);
    // Logic: Notify user, downgrade account after grace period
  }
}
