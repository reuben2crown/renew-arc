/**
 * Notification Service Contract
 * Defines interfaces for email and SMS providers
 */

/**
 * Email message structure
 */
export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

/**
 * SMS message structure
 */
export interface SmsMessage {
  to: string;
  body: string;
  from?: string;
}

/**
 * Email provider contract
 */
export interface EmailProvider {
  send(message: EmailMessage): Promise<EmailSendResult>;
  isConfigured(): boolean;
}

/**
 * SMS provider contract
 */
export interface SmsProvider {
  send(message: SmsMessage): Promise<SmsSendResult>;
  isConfigured(): boolean;
}

/**
 * Email send result
 */
export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * SMS send result
 */
export interface SmsSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Reminder notification types
 */
export type ReminderType = '90_days' | '60_days' | '30_days' | '7_days';

/**
 * Notification context for reminder templates
 */
export interface ReminderContext {
  userName: string;
  licenseType: string;
  state: string;
  expiryDate: string;
  renewalLink: string;
  daysUntilExpiry: number;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  optInEmail: boolean;
  optInSms: boolean;
  timezone: string;
}
