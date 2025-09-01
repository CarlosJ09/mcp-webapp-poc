"use client";

import { useEffect } from 'react';
import { useAuth } from "@/context/AuthProvider";
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function Home() {
  const { authenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (authenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [authenticated, loading, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <LoadingSpinner message="Loading..." />
    </div>
  );
}
