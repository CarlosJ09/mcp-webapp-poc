"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { useRouter } from "next/navigation";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useMCPChat } from "@/hooks/useMCPChat";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authenticated, loading } = useAuth();
  const router = useRouter();
  const { sendMessage } = useMCPChat();

  const { error, refreshData } = useDashboardData();

  useEffect(() => {
    if (!loading && !authenticated) {
      router.push("/login");
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <DashboardHeader onRefresh={refreshData} error={error} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>

      {/* Chat Widget */}
      <ChatWidget onSendMessage={sendMessage} />
    </div>
  );
}
