/**
 * Twilio SMS Provider Implementation
 * Implements SmsProvider contract using Twilio API
 */

import twilio from 'twilio';
import type { SmsProvider, SmsMessage, SmsSendResult } from './types';

export class TwilioSmsProvider implements SmsProvider {
  private client: any = null;
  private isConfiguredFlag: boolean = false;
  private fromNumber: string = '';

  constructor() {
    this.initialize();
  }

  /**
   * Initialize Twilio client
   */
  private initialize(): void {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !phoneNumber) {
      console.warn('Twilio not configured - missing environment variables');
      this.isConfiguredFlag = false;
      return;
    }

    this.client = twilio(accountSid, authToken);
    this.fromNumber = phoneNumber;
    this.isConfiguredFlag = true;
  }

  /**
   * Check if provider is properly configured
   */
  isConfigured(): boolean {
    return this.isConfiguredFlag && this.client !== null;
  }

  /**
   * Send an SMS message
   */
  async send(message: SmsMessage): Promise<SmsSendResult> {
    try {
      if (!this.client || !this.isConfigured()) {
        return {
          success: false,
          error: 'SMS provider not configured',
        };
      }

      const messagingResponse = await this.client.messages.create({
        body: message.body,
        from: message.from || this.fromNumber,
        to: message.to,
      });

      return {
        success: true,
        messageId: messagingResponse.sid,
      };
    } catch (error) {
      console.error('Twilio SMS error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

/**
 * Singleton instance of Twilio SMS provider
 */
export const twilioProvider = new TwilioSmsProvider();
