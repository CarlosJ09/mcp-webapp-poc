/**
 * Profile Page
 * Displays user profile and account settings
 */

'use client';

import { UserProfile } from '@/components/auth/UserProfile';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Settings, Database } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex items-center">
                  <Database className="h-6 w-6 text-indigo-600 mr-2" />
                  <h1 className="text-xl font-semibold text-gray-900">
                    MCP Dashboard - Profile
                  </h1>
                </div>
              </div>
              <div className="flex items-center">
                <Settings className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
            <p className="mt-2 text-sm text-gray-600">
              Manage your profile information and account preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Profile Information */}
            <div className="lg:col-span-2">
              <UserProfile />
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200 transition-colors"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => window.open('https://auth0.com/docs', '_blank')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200 transition-colors"
                  >
                    Auth0 Documentation
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Security Information
                </h4>
                <p className="text-xs text-blue-700">
                  Your session is secured with Auth0 authentication. 
                  Sessions automatically expire for enhanced security.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
