"use client";

import { useAuthStore } from "@/state/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Home } from "@/components/Homepage";

export default function Page() {
  return (
    <>
    <Home/>
    </>
  );
}
