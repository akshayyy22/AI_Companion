"use client";

import { useAuthStore } from "@/state/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppProvider } from "@/providers/AppProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <ProtectedContent>{children}</ProtectedContent>
    </AppProvider>
  );
}

function ProtectedContent({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.push("/auth/login");
    }
  }, [session, loading, router]);

  if (loading || !session) return null;

  return <>{children}</>;
}
