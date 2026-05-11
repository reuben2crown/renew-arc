'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface NotificationPreferences {
  id: string;
  email_reminders: boolean;
  sms_reminders: boolean;
  reminder_days: number;
  phone?: string;
}

export default function ReminderSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [phone, setPhone] = useState('');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('profile_id', session.user.id)
        .single();

      if (data) {
        setPreferences(data);
        // Load phone from profiles if SMS is enabled
        if (data.sms_reminders) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('phone')
            .eq('id', session.user.id)
            .single();
          
          if (profileData?.phone) {
            setPhone(profileData.phone);
          }
        }
      } else {
        // Create default preferences
        const { data: newPrefs } = await supabase
          .from('notification_preferences')
          .insert([{
            profile_id: session.user.id,
            email_reminders: true,
            sms_reminders: false,
            reminder_days: 30,
          }])
          .select()
          .single();
        
        setPreferences(newPrefs);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading preferences:', error);
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;
    
    setSaving(true);
    
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }

      // Update notification preferences
      const { error: prefsError } = await supabase
        .from('notification_preferences')
        .update({
          email_reminders: preferences.email_reminders,
          sms_reminders: preferences.sms_reminders,
          reminder_days: preferences.reminder_days,
        })
        .eq('id', preferences.id);

      if (prefsError) {
        throw prefsError;
      }

      // Update phone number in profiles if SMS is enabled
      if (preferences.sms_reminders && phone) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ phone })
          .eq('id', session.user.id);

        if (profileError) {
          throw profileError;
        }
      }

      alert('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleEmailReminders = (enabled: boolean) => {
    setPreferences(prev => prev ? { ...prev, email_reminders: enabled } : null);
  };

  const toggleSmsReminders = (enabled: boolean) => {
    setPreferences(prev => prev ? { ...prev, sms_reminders: enabled } : null);
  };

  const updateReminderDays = (days: number) => {
    setPreferences(prev => prev ? { ...prev, reminder_days: days } : null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reminder Settings</CardTitle>
          <CardDescription>Loading your preferences...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!preferences) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reminder Settings</CardTitle>
          <CardDescription>Configure your notification preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Unable to load preferences. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reminder Settings</CardTitle>
        <CardDescription>Choose how you want to be reminded about renewals</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Reminders */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-reminders">Email Reminders</Label>
            <p className="text-sm text-gray-500">Receive reminders via email</p>
          </div>
          <Switch
            id="email-reminders"
            checked={preferences.email_reminders}
            onCheckedChange={toggleEmailReminders}
          />
        </div>

        {/* SMS Reminders */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="sms-reminders">SMS Reminders</Label>
            <p className="text-sm text-gray-500">Receive reminders via text message</p>
          </div>
          <Switch
            id="sms-reminders"
            checked={preferences.sms_reminders}
            onCheckedChange={toggleSmsReminders}
          />
        </div>

        {/* Phone Number (if SMS enabled) */}
        {preferences.sms_reminders && (
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Required for SMS reminders. Format: +1 (555) 123-4567
            </p>
          </div>
        )}

        {/* Reminder Days */}
        <div className="space-y-2">
          <Label>First Reminder (Days Before Renewal)</Label>
          <div className="grid grid-cols-4 gap-2">
            {[7, 14, 30, 60].map((days) => (
              <Button
                key={days}
                variant={preferences.reminder_days === days ? 'default' : 'outline'}
                onClick={() => updateReminderDays(days)}
                className="w-full"
              >
                {days} days
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Additional reminders will be sent at 30, 14, and 7 days before renewal
          </p>
        </div>

        {/* Save Button */}
        <Button 
          onClick={savePreferences} 
          disabled={saving}
          className="w-full"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>

        <div className="pt-4 border-t">
          <p className="text-xs text-gray-500">
            Reminders are sent automatically based on your license renewal date. 
            You can opt out at any time by disabling email or SMS reminders.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
