import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ResendProvider } from '@/lib/notifications/resend-provider';
import { TwilioProvider } from '@/lib/notifications/twilio-provider';

interface ReminderJob {
  id: string;
  user_id: string;
  license_id: string;
  days_until_renewal: number;
  email: string;
  phone?: string;
  email_reminders: boolean;
  sms_reminders: boolean;
}

/**
 * Scheduled cron job to send renewal reminders
 * Runs daily at 9 AM UTC via Vercel Cron
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createClient();
    
    // Get all licenses expiring in the next 90 days
    const today = new Date();
    const ninetyDaysFromNow = new Date(today);
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

    const { data: licenses } = await supabase
      .from('licenses')
      .select(`
        id,
        profile_id,
        renewal_date,
        profiles (email, phone),
        notification_preferences (email_reminders, sms_reminders)
      `)
      .gte('renewal_date', today.toISOString().split('T')[0])
      .lte('renewal_date', ninetyDaysFromNow.toISOString().split('T')[0]);

    if (!licenses || licenses.length === 0) {
      return NextResponse.json({ message: 'No reminders to send', count: 0 });
    }

    const resendProvider = new ResendProvider(process.env.RESEND_API_KEY!);
    const twilioProvider = new TwilioProvider(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!,
      process.env.TWILIO_PHONE_NUMBER!
    );

    let sentCount = 0;
    const reminderDays = [90, 60, 30, 14, 7]; // Days before renewal to send reminders

    for (const license of licenses) {
      const renewalDate = new Date(license.renewal_date);
      const daysUntilRenewal = Math.ceil(
        (renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Check if we should send a reminder today
      if (!reminderDays.includes(daysUntilRenewal)) {
        continue;
      }

      const preferences = license.notification_preferences;
      const profile = license.profiles;

      if (!preferences || !profile) {
        continue;
      }

      const reminderJob: ReminderJob = {
        id: license.id,
        user_id: license.profile_id,
        license_id: license.id,
        days_until_renewal: daysUntilRenewal,
        email: profile.email,
        phone: profile.phone || undefined,
        email_reminders: preferences.email_reminders,
        sms_reminders: preferences.sms_reminders,
      };

      // Send email reminder
      if (reminderJob.email_reminders && reminderJob.email) {
        const emailSent = await sendEmailReminder(resendProvider, reminderJob);
        if (emailSent) {
          sentCount++;
        }
      }

      // Send SMS reminder
      if (reminderJob.sms_reminders && reminderJob.phone) {
        const smsSent = await sendSmsReminder(twilioProvider, reminderJob);
        if (smsSent) {
          sentCount++;
        }
      }
    }

    return NextResponse.json({
      message: `Reminders processed successfully`,
      count: sentCount,
    });
  } catch (error) {
    console.error('Error processing reminders:', error);
    return NextResponse.json(
      { error: 'Failed to process reminders' },
      { status: 500 }
    );
  }
}

async function sendEmailReminder(
  provider: ResendProvider,
  job: ReminderJob
): Promise<boolean> {
  const subject = `License Renewal Reminder - ${job.days_until_renewal} Days Left`;
  const body = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>License Renewal Reminder</h2>
        <p>Your professional license is due for renewal in <strong>${job.days_until_renewal} days</strong>.</p>
        <p>To avoid any interruption to your practice, please complete your renewal soon.</p>
        <h3>Next Steps:</h3>
        <ul>
          <li>Review your CE hours completion status</li>
          <li>Gather required documentation</li>
          <li>Submit your renewal application</li>
        </ul>
        <p>Log in to your RenewPilot dashboard to track your progress.</p>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          You're receiving this because you opted in to email reminders. 
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings">Update preferences</a>
        </p>
      </body>
    </html>
  `;

  return await provider.sendEmail({
    userId: job.user_id,
    email: job.email,
    subject,
    body,
    type: 'email',
  });
}

async function sendSmsReminder(
  provider: TwilioProvider,
  job: ReminderJob
): Promise<boolean> {
  const body = `RenewPilot: Your license renewal is due in ${job.days_until_renewal} days. Log in to check your CE progress and complete your renewal. Reply STOP to opt out.`;

  return await provider.sendSms({
    userId: job.user_id,
    email: '',
    phone: job.phone,
    subject: '',
    body,
    type: 'sms',
  });
}
