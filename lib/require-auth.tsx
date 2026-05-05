"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, hasToken } = useAuth();

  useEffect(() => {
    if (!loading && !hasToken) {
      router.replace("/auth");
    }
  }, [loading, hasToken, router]);

  if (loading || !hasToken || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading…
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
