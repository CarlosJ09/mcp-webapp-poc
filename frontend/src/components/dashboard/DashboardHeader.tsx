/**
 * Dashboard Header Component
 * Displays the dashboard title, refresh button, user menu, and connection status
 */

import {
  BarChart3,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  User,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";

interface DashboardHeaderProps {
  error?: string | null;
  onRefresh?: () => void;
}

export function DashboardHeader({ error, onRefresh }: DashboardHeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            MCP Analytics Dashboard
          </h1>

          <div className="flex items-center gap-4">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Data
              </button>
            )}

            {/* Status Indicator */}
            <div className="flex items-center gap-3">
              {error && (
                <div className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Connection Error
                </div>
              )}
              {!error && (
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  MCP Connected
                </div>
              )}
            </div>

            {/* User Menu */}
            {user && (
              <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium">
                    {user.name || user.email}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
