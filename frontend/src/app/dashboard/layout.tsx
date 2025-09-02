"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { useRouter } from "next/navigation";
import { useMCPChat } from "@/hooks/useMCPChat";
import { Sidebar } from "@/components/ui/Sidebar";
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
      <DashboardHeader />

      {/* Sidebar and Main Content */}
      <div className="flex">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 lg:ml-0">
          {children}
        </main>
      </div>

      {/* Chat Widget */}
      <ChatWidget onSendMessage={sendMessage} />
    </div>
  );
}
