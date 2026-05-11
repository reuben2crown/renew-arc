'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface LicenseData {
  id: string;
  license_number: string;
  renewal_date: string;
  required_ce_hours: number;
  state: {
    name: string;
    abbreviation: string;
  };
  license_type: {
    name: string;
    abbreviation: string;
  };
}

interface CEData {
  id: string;
  title: string;
  hours: number;
  date_completed: string;
  verified: boolean;
}

interface ReadinessScore {
  score: number;
  status: 'green' | 'yellow' | 'red';
  daysUntilRenewal: number;
  ceProgress: number;
  message: string;
}

export default function ReadinessScore() {
  const [loading, setLoading] = useState(true);
  const [readiness, setReadiness] = useState<ReadinessScore | null>(null);
  const [licenses, setLicenses] = useState<LicenseData[]>([]);
  const [ceCredits, setCeCredits] = useState<CEData[]>([]);

  useEffect(() => {
    calculateReadiness();
  }, []);

  const calculateReadiness = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }

      // Fetch licenses
      const { data: licensesData } = await supabase
        .from('licenses')
        .select(`
          id,
          license_number,
          renewal_date,
          required_ce_hours,
          states (name, abbreviation),
          license_types (name, abbreviation)
        `)
        .eq('profile_id', session.user.id);

      if (!licensesData || licensesData.length === 0) {
        setLoading(false);
        return;
      }

      setLicenses(licensesData as LicenseData[]);

      // Fetch CE credits
      const { data: ceData } = await supabase
        .from('ce_credits')
        .select('id, title, hours, date_completed, verified')
        .eq('profile_id', session.user.id)
        .eq('verified', true);

      setCeCredits(ceData || []);

      // Calculate readiness for first license (can be extended for multiple)
      const license = licensesData[0];
      const totalCEHours = ceData?.reduce((sum, credit) => sum + Number(credit.hours), 0) || 0;
      const requiredHours = license.required_ce_hours || 0;
      
      const renewalDate = new Date(license.renewal_date);
      const today = new Date();
      const daysUntilRenewal = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      const ceProgress = requiredHours > 0 ? Math.min(100, (totalCEHours / requiredHours) * 100) : 0;
      
      // Calculate readiness score (0-100)
      let score = 0;
      let status: 'green' | 'yellow' | 'red' = 'red';
      let message = '';

      // Time-based scoring (50 points max)
      if (daysUntilRenewal > 90) {
        score += 50;
      } else if (daysUntilRenewal > 60) {
        score += 40;
      } else if (daysUntilRenewal > 30) {
        score += 25;
      } else if (daysUntilRenewal > 7) {
        score += 10;
      } else {
        score += 0;
      }

      // CE progress scoring (50 points max)
      score += Math.round(ceProgress / 2);

      // Determine status and message
      if (score >= 80) {
        status = 'green';
        message = 'Excellent! You\'re well prepared for renewal.';
      } else if (score >= 50) {
        status = 'yellow';
        message = 'You\'re on track, but there\'s room for improvement.';
      } else {
        status = 'red';
        message = 'Action needed! Your renewal requires attention.';
      }

      setReadiness({
        score,
        status,
        daysUntilRenewal,
        ceProgress,
        message,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error calculating readiness:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Renewal Readiness</CardTitle>
          <CardDescription>Calculating your compliance status...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!readiness || licenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Renewal Readiness</CardTitle>
          <CardDescription>No license information found</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Please add your license information to get started.</p>
        </CardContent>
      </Card>
    );
  }

  const license = licenses[0];
  const statusColors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  const statusBgColors = {
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    red: 'bg-red-50 border-red-200',
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Renewal Readiness Score</CardTitle>
        <CardDescription>
          {license.license_types?.abbreviation} - {license.states?.abbreviation}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Display */}
        <div className={`p-6 rounded-lg border-2 ${statusBgColors[readiness.status]}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-4xl font-bold">{readiness.score}</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[readiness.status]} text-white`}>
              {readiness.status.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-700">{readiness.message}</p>
        </div>

        {/* Days Until Renewal */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Days until renewal</span>
            <span className="font-medium">{readiness.daysUntilRenewal} days</span>
          </div>
          <Progress 
            value={Math.max(0, Math.min(100, ((90 - readiness.daysUntilRenewal) / 90) * 100))} 
            className="h-2"
          />
        </div>

        {/* CE Hours Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">CE Hours Completed</span>
            <span className="font-medium">
              {ceCredits.reduce((sum, credit) => sum + Number(credit.hours), 0).toFixed(1)} / {license.required_ce_hours}
            </span>
          </div>
          <Progress value={readiness.ceProgress} className="h-2" />
          <p className="text-xs text-gray-500">
            {readiness.ceProgress >= 100 
              ? '✓ All required CE hours completed' 
              : `${(license.required_ce_hours - ceCredits.reduce((sum, credit) => sum + Number(credit.hours), 0)).toFixed(1)} hours remaining`}
          </p>
        </div>

        {/* License Details */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">License Number</p>
              <p className="font-medium">{license.license_number}</p>
            </div>
            <div>
              <p className="text-gray-500">Renewal Date</p>
              <p className="font-medium">{new Date(license.renewal_date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
