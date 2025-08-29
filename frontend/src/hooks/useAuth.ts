"use client";
import { useUser } from "@auth0/nextjs-auth0";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuth(redirectToLogin: boolean = true) {
  const { user, error, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user && redirectToLogin) {
      router.push("/auth/login");
    }
  }, [isLoading, user, redirectToLogin, router]);

  return { user, error, isLoading };
}
