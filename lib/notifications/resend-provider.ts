/**
 * Resend Email Provider Implementation
 * Implements EmailProvider contract using Resend API
 */

import { Resend } from 'resend';
import type { EmailProvider, EmailMessage, EmailSendResult } from './types';

export class ResendEmailProvider implements EmailProvider {
  private client: Resend | null = null;
  private isConfiguredFlag: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize Resend client
   */
  private initialize(): void {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.warn('Resend not configured - missing RESEND_API_KEY');
      this.isConfiguredFlag = false;
      return;
    }

    this.client = new Resend(apiKey);
    this.isConfiguredFlag = true;
  }

  /**
   * Check if provider is properly configured
   */
  isConfigured(): boolean {
    return this.isConfiguredFlag && this.client !== null;
  }

  /**
   * Send an email message
   */
  async send(message: EmailMessage): Promise<EmailSendResult> {
    try {
      if (!this.client || !this.isConfigured()) {
        return {
          success: false,
          error: 'Email provider not configured',
        };
      }

      const from = message.from || 'RenewPilot <noreply@renewpilot.com>';

      const { data, error } = await this.client.emails.send({
        from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
      });

      if (error) {
        console.error('Resend email error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        messageId: data?.id,
      };
    } catch (error) {
      console.error('Unexpected email error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

/**
 * Singleton instance of Resend email provider
 */
export const resendProvider = new ResendEmailProvider();
