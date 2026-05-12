'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { useAnalytics } from '@/lib/analytics/init';
import FeedbackWidget from '@/components/feedback/widget';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RenewPilot - License Renewal Tracker',
  description: 'Track your professional license renewals and CE hours',
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useAnalytics();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    getUser();
  }, []);

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
        {userId && <FeedbackWidget userId={userId} />}
      </body>
    </html>
  );
}
