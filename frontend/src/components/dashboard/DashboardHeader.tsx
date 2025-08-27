/**
 * Dashboard Header Component
 * Displays the dashboard title, refresh button, and connection status
 */

import { BarChart3, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface DashboardHeaderProps {
  error: string | null;
  onRefresh: () => void;
}

export function DashboardHeader({ error, onRefresh }: DashboardHeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            MCP Analytics Dashboard
          </h1>
          <div className="flex gap-3">
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </button>
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
        </div>
      </div>
    </header>
  );
}
