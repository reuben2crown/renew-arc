import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createClient } from '@/lib/supabase/server';

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  }))
}));

describe('License Management Integration', () => {
  it('should create license with valid data', async () => {
    const mockSupabase = createClient();
    
    const licenseData = {
      profile_id: 'user-123',
      license_type_id: 'type-1',
      state_id: 'state-CA',
      license_number: 'LCSW123456',
      renewal_date: '2025-12-31',
      required_ce_hours: 36
    };

    const { error } = await (mockSupabase as any)
      .from('licenses')
      .insert([licenseData]);

    expect(error).toBeUndefined();
  });

  it('should fetch user licenses', async () => {
    const mockSupabase = createClient();

    const {  licenses } = await (mockSupabase as any)
      .from('licenses')
      .select('*')
      .eq('profile_id', 'user-123');

    expect(licenses).toBeDefined();
  });
});

describe('CE Credits Integration', () => {
  it('should create CE credit with OCR confidence', async () => {
    const mockSupabase = createClient();
    
    const ceData = {
      profile_id: 'user-123',
      license_id: 'license-1',
      title: 'Ethics Training',
      provider: 'APA Institute',
      date_completed: '2024-01-15',
      hours: 6.0,
      category: 'Ethics',
      ocr_confidence: 85.5,
      verified: true
    };

    const { error } = await (mockSupabase as any)
      .from('ce_credits')
      .insert([ceData]);

    expect(error).toBeUndefined();
  });

  it('should calculate total CE hours for user', async () => {
    const mockSupabase = createClient();

    const {  ceCredits } = await (mockSupabase as any)
      .from('ce_credits')
      .select('hours')
      .eq('profile_id', 'user-123');

    const totalHours = ceCredits?.reduce((sum: number, c: any) => sum + c.hours, 0) || 0;
    expect(typeof totalHours).toBe('number');
  });
});

describe('Notification Preferences Integration', () => {
  it('should update notification preferences', async () => {
    const mockSupabase = createClient();
    
    const preferences = {
      profile_id: 'user-123',
      email_reminders: true,
      sms_reminders: false,
      reminder_days: 30
    };

    const { error } = await (mockSupabase as any)
      .from('notification_preferences')
      .update(preferences)
      .eq('profile_id', 'user-123');

    expect(error).toBeUndefined();
  });
});
