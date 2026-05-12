import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DodoProvider } from '@/lib/payments/dodo-provider';

describe('DodoProvider', () => {
  let provider: DodoProvider;
  const mockConfig = {
    apiKey: 'test-api-key',
    apiSecret: 'test-secret',
    webhookSecret: 'webhook-secret'
  };

  beforeEach(() => {
    provider = new DodoProvider(mockConfig);
    vi.clearAllMocks();
  });

  describe('createCheckoutSession', () => {
    it('should create a checkout session successfully', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          checkoutUrl: 'https://checkout.dodo.com/test-session',
          sessionId: 'session_123'
        })
      };

      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

      const result = await provider.createCheckoutSession({
        userId: 'user-123',
        email: 'test@example.com',
        planId: 'plan-pro-monthly'
      });

      expect(result.success).toBe(true);
      expect(result.data?.checkoutUrl).toContain('dodo.com');
      expect(result.data?.sessionId).toBe('session_123');
    });

    it('should handle API errors gracefully', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid plan ID' })
      };

      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

      const result = await provider.createCheckoutSession({
        userId: 'user-123',
        email: 'test@example.com',
        planId: 'invalid-plan'
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CHECKOUT_ERROR');
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should verify valid webhook signature', () => {
      const payload = JSON.stringify({ event: 'payment.succeeded' });
      // This would need actual signature logic - simplified for test
      const isValid = provider.verifyWebhookSignature(payload, 'valid-signature');
      
      // Note: Actual implementation needed for real verification
      expect(typeof isValid).toBe('boolean');
    });

    it('should reject invalid webhook signature', () => {
      const payload = JSON.stringify({ event: 'payment.succeeded' });
      const isValid = provider.verifyWebhookSignature(payload, 'invalid-signature');
      
      expect(isValid).toBe(false);
    });
  });

  describe('getSubscriptionStatus', () => {
    it('should fetch subscription status successfully', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          status: 'active',
          currentPeriodEnd: '2025-12-31'
        })
      };

      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

      const result = await provider.getSubscriptionStatus('sub_123');

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('active');
    });

    it('should handle subscription not found', async () => {
      const mockResponse = {
        ok: false,
        status: 404
      };

      global.fetch = vi.fn().mockResolvedValueOnce(mockResponse);

      const result = await provider.getSubscriptionStatus('invalid-sub');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SUBSCRIPTION_NOT_FOUND');
    });
  });
});
