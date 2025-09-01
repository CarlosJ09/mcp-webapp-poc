/**
 * User Profile Component
 * Displays user information and profile actions
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import { User, Mail, Shield, Calendar, LogOut } from 'lucide-react';

interface UserProfileProps {
  className?: string;
}

export function UserProfile({ className = '' }: UserProfileProps) {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
        <button
          onClick={logout}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </button>
      </div>

      <div className="space-y-6">
        {/* Profile Picture & Basic Info */}
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {user.picture ? (
              <img
                className="h-16 w-16 rounded-full object-cover"
                src={user.picture}
                alt={user.name || 'User avatar'}
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="h-8 w-8 text-indigo-600" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {user.name || user.nickname || 'Unknown User'}
            </h3>
            <p className="text-sm text-gray-500">
              {user.email || 'No email available'}
            </p>
          </div>
        </div>

        {/* Detailed Info */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Email */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="text-sm text-gray-900">{user.email || 'Not provided'}</dd>
              {user.email_verified !== undefined && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.email_verified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.email_verified ? 'Verified' : 'Unverified'}
                </span>
              )}
            </div>
          </div>

          {/* User ID */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Shield className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">User ID</dt>
              <dd className="text-xs text-gray-900 font-mono break-all">
                {user.sub || 'Not available'}
              </dd>
            </div>
          </div>

          {/* Nickname */}
          {user.nickname && (
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Nickname</dt>
                <dd className="text-sm text-gray-900">{user.nickname}</dd>
              </div>
            </div>
          )}

          {/* Roles */}
          {user.roles && user.roles.length > 0 && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <Shield className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Roles</dt>
                <dd className="text-sm text-gray-900">
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.roles.map((role, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </dd>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
