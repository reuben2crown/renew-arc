/**
 * Supabase Database Types
 * Auto-generated from Prisma schema for type safety
 * 
 * Note: In production, generate these using:
 * npx supabase gen types typescript --project-id <your-project-id>
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          phone: string | null;
          timezone: string;
          opt_in_sms: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          phone?: string | null;
          timezone?: string;
          opt_in_sms?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          phone?: string | null;
          timezone?: string;
          opt_in_sms?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      licenses: {
        Row: {
          id: string;
          user_id: string;
          profession: string;
          state: 'CA' | 'TX' | 'NY' | 'FL' | 'IL';
          license_number: string;
          expiry_date: string;
          status: 'active' | 'expired' | 'pending';
          required_hours_total: number;
          required_hours_ethics: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          profession: string;
          state: 'CA' | 'TX' | 'NY' | 'FL' | 'IL';
          license_number: string;
          expiry_date: string;
          status?: 'active' | 'expired' | 'pending';
          required_hours_total?: number;
          required_hours_ethics?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          profession?: string;
          state?: 'CA' | 'TX' | 'NY' | 'FL' | 'IL';
          license_number?: string;
          expiry_date?: string;
          status?: 'active' | 'expired' | 'pending';
          required_hours_total?: number;
          required_hours_ethics?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      ce_credits: {
        Row: {
          id: string;
          user_id: string;
          license_id: string | null;
          provider_name: string;
          course_title: string;
          hours: number;
          category: 'ethics' | 'core' | 'elective' | null;
          completion_date: string;
          ocr_confidence: number | null;
          image_url: string | null;
          verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          license_id?: string | null;
          provider_name: string;
          course_title: string;
          hours: number;
          category?: 'ethics' | 'core' | 'elective' | null;
          completion_date: string;
          ocr_confidence?: number | null;
          image_url?: string | null;
          verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          license_id?: string | null;
          provider_name?: string;
          course_title?: string;
          hours?: number;
          category?: 'ethics' | 'core' | 'elective' | null;
          completion_date?: string;
          ocr_confidence?: number | null;
          image_url?: string | null;
          verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      reminders: {
        Row: {
          id: string;
          user_id: string;
          license_id: string | null;
          trigger_days: 90 | 60 | 30 | 7;
          channel: 'email' | 'sms';
          status: 'pending' | 'sent' | 'failed';
          sent_at: string | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          license_id?: string | null;
          trigger_days: 90 | 60 | 30 | 7;
          channel: 'email' | 'sms';
          status?: 'pending' | 'sent' | 'failed';
          sent_at?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          license_id?: string | null;
          trigger_days?: 90 | 60 | 30 | 7;
          channel?: 'email' | 'sms';
          status?: 'pending' | 'sent' | 'failed';
          sent_at?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
      };
      state_rules: {
        Row: {
          id: string;
          state: 'CA' | 'TX' | 'NY' | 'FL' | 'IL';
          profession: Json;
          last_updated: string;
        };
        Insert: {
          id?: string;
          state: 'CA' | 'TX' | 'NY' | 'FL' | 'IL';
          profession: Json;
          last_updated?: string;
        };
        Update: {
          id?: string;
          state?: 'CA' | 'TX' | 'NY' | 'FL' | 'IL';
          profession?: Json;
          last_updated?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
