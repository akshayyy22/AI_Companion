"use client";

import { useAuthStore } from "@/state/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppProvider } from "@/providers/AppProvider";
import { Skeleton } from "@/components/ui/skeleton";
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

  if (loading) return <Skeleton />;
if (!session) return null;

  return <>{children}</>;
}
