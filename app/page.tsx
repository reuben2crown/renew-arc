import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">RenewPilot</h1>
          <p className="text-lg text-gray-600">
            Track your professional license renewals and CE hours with confidence
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Sign In
          </Link>
          
          <Link
            href="/signup"
            className="block w-full bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-6 rounded-lg border-2 border-blue-600 transition-colors"
          >
            Create Account
          </Link>
        </div>

        <div className="pt-8 text-sm text-gray-500">
          <p>For mental health counselors in CA, TX, NY, FL, IL</p>
        </div>
      </div>
    </main>
  );
}
