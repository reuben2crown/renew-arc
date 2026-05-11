import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ReadinessScore from '@/components/dashboard/readiness-score';
import CEUpload from '@/components/ce-upload/ce-upload';
import ReminderSettings from '@/components/notifications/reminder-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardPage() {
  const supabase = createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/login');
  }

  // Fetch user's licenses
  const { data: licenses } = await supabase
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

  // Fetch user's CE credits
  const { data: ceCredits } = await supabase
    .from('ce_credits')
    .select('id, title, hours, date_completed, verified')
    .eq('profile_id', session.user.id)
    .eq('verified', true)
    .order('date_completed', { ascending: false })
    .limit(5);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Track your license renewal progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Readiness Score - Full width on mobile, span 2 columns on larger screens */}
        <div className="md:col-span-2 lg:col-span-2">
          <ReadinessScore />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to stay compliant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/dashboard/ce-credits"
              className="block w-full p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors"
            >
              <span className="font-medium text-blue-700">+ Add CE Credit</span>
            </a>
            <a
              href="/dashboard/licenses"
              className="block w-full p-3 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors"
            >
              <span className="font-medium text-green-700">Manage Licenses</span>
            </a>
            <a
              href="/dashboard/settings"
              className="block w-full p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors"
            >
              <span className="font-medium text-purple-700">Notification Settings</span>
            </a>
          </CardContent>
        </Card>

        {/* Recent CE Credits */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent CE Credits</CardTitle>
            <CardDescription>Your latest continuing education activities</CardDescription>
          </CardHeader>
          <CardContent>
            {ceCredits && ceCredits.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Title</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Hours</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Date</th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ceCredits.map((credit) => (
                      <tr key={credit.id} className="border-b last:border-0">
                        <td className="py-3 px-3 text-sm">{credit.title}</td>
                        <td className="py-3 px-3 text-sm">{Number(credit.hours).toFixed(1)}</td>
                        <td className="py-3 px-3 text-sm">
                          {new Date(credit.date_completed).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            Verified
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No CE credits yet. Upload your first certificate to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* License Summary */}
        {licenses && licenses.length > 0 && (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Your Licenses</CardTitle>
              <CardDescription>Active professional licenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {licenses.map((license) => (
                  <div
                    key={license.id}
                    className="p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-lg">
                        {license.license_types?.abbreviation}
                      </span>
                      <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {license.states?.abbreviation}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">License #:</span>
                        <span className="font-medium">{license.license_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Renewal:</span>
                        <span className="font-medium">
                          {new Date(license.renewal_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">CE Required:</span>
                        <span className="font-medium">{license.required_ce_hours} hours</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notification Settings Preview */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Manage how you receive renewal reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <ReminderSettings />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
