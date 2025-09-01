"use client";

import { useEffect } from 'react';
import { useAuth } from "@/context/AuthProvider";
import { useRouter } from 'next/navigation';
import { useDashboardData } from "@/hooks/useDashboardData";
import { KPICards } from "@/components/dashboard/KPICards";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { CustomerDistributionChart } from "@/components/dashboard/CustomerDistributionChart";
import { InventoryChart } from "@/components/dashboard/InventoryChart";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { LogOut, User } from 'lucide-react';

export default function DashboardPage() {
  const { user, authenticated, loading, logout } = useAuth();
  const router = useRouter();
  
  const {
    salesMetricsData,
    customersMetricsData,
    dashboardMetricsData,
    inventoryMetricsData,
    error,
    refreshData,
    currentPeriod,
    loadingSalesMetrics,
    changePeriod,
  } = useDashboardData();

  useEffect(() => {
    if (!loading && !authenticated) {
      router.push('/login');
    }
  }, [authenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!authenticated) {
    return null; // Will redirect to login
  }

  const kpiMetrics = {
    totalSales: dashboardMetricsData?.totalSales ?? 0,
    totalCustomers: dashboardMetricsData?.totalCustomers ?? 0,
    totalItems: dashboardMetricsData?.totalItems ?? 0,
    totalRevenue: dashboardMetricsData?.totalRevenue ?? 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                MCP Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* User Info */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.push('/profile')}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200"
                >
                  <User className="h-5 w-5 text-gray-400" />
                  <span>{user?.name || user?.email}</span>
                </button>
                
                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <DashboardHeader 
            onRefresh={refreshData} 
            error={error}
          />
          
          <div className="mt-8">
            <KPICards metrics={kpiMetrics} />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SalesChart 
              data={salesMetricsData} 
              loading={loadingSalesMetrics}
              currentPeriod={currentPeriod}
              onPeriodChange={changePeriod}
            />
            <CustomerDistributionChart data={customersMetricsData} />
          </div>

          <div className="mt-6">
            <InventoryChart data={inventoryMetricsData} />
          </div>
        </div>
      </main>
    </div>
  );
}
