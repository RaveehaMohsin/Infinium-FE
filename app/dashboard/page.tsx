"use client";

import { Dashboard } from "@/components/Dashboard";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/lib/require-auth";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <RequireAuth>
      <Dashboard
        navigateTo={(page: string) => {
          router.push(`/${page}`);
        }}
      />
    </RequireAuth>
  );
}
