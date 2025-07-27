"use client";

import { useAuthStore } from "@/state/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppProvider } from "@/providers/AppProvider";
// import { Button } from '@/components/ui/button'
// import { useAuth } from '@/hooks/useAuth'
import Dashboard from "./dashboard/page";
import { Home } from "@/components/Homepage";

export default function HomePage() {
  return (
    <AppProvider>
      <ProtectedContent />
    </AppProvider>
  );
}

function ProtectedContent() {
  const { session, loading } = useAuthStore();
  // const { logout } = useAuth()
  const router = useRouter();
  // console.log(session)
  // console.log('Session User ID:', session?.user?.id)

  useEffect(() => {
    if (!loading && !session) {
      router.push("/auth/login");
    }
  }, [session, loading, router]);

  if (loading || !session) return null;

  return (
      <>
      <Dashboard/>
      {/* <Home/> */}
      </>
  );
}
